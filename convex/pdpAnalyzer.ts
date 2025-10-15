import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Main PDP analysis action
export const analyzePDP = action({
  args: {
    mainPDPData: v.string(), // base64 encoded image data
    competitorPDPs: v.optional(v.array(v.string())), // array of base64 encoded images
    metaInfo: v.optional(v.object({
      category: v.optional(v.string()),
      description: v.optional(v.string()),
      shelfType: v.optional(v.string()),
      claims: v.optional(v.string()),
      analysisFocus: v.optional(v.string()),
      targetDemographics: v.optional(v.string()),
      retailEnvironment: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    try {
      // Get user for analysis tracking
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("User not authenticated");
      }

      const user = await ctx.runQuery(api.users.getUserByClerkId, {
        clerkId: identity.subject
      });

      if (!user) {
        throw new Error("User not found");
      }

      // SEQUENTIAL PROCESSING: Analyze main design first
      console.log('Starting main design analysis...');
      let mainAnalysis: PDPAnalysis;

      try {
        mainAnalysis = await analyzeImageWithRetry(args.mainPDPData, args.metaInfo, "Your Design");
        console.log('✅ Main design analysis completed');
      } catch (error) {
        // If main analysis fails, throw a user-friendly error
        console.error('Main PDP analysis failed:', error);
        throw new Error(
          error instanceof Error
            ? `Failed to analyze main design: ${error.message}`
            : 'Failed to analyze your design. The image may be too large or the service is temporarily unavailable. Please try again with a smaller image or wait a few moments.'
        );
      }

      // SEQUENTIAL PROCESSING: Analyze competitors one by one with delays to avoid rate limiting
      const competitorAnalyses: PDPAnalysis[] = [];

      if (args.competitorPDPs && args.competitorPDPs.length > 0) {
        console.log(`Starting analysis of ${args.competitorPDPs.length} competitor designs...`);

        for (let i = 0; i < args.competitorPDPs.length; i++) {
          const competitorLabel = `Competitor ${String.fromCharCode(65 + i)}`; // A, B, C, D

          try {
            // Add delay before EVERY competitor analysis to avoid burst rate limits
            const delayMs = 1500; // 1.5 seconds before each competitor
            console.log(`Waiting ${delayMs}ms before analyzing ${competitorLabel}...`);
            await delay(delayMs);

            console.log(`Analyzing ${competitorLabel}...`);
            const competitorAnalysis = await analyzeImageWithRetry(
              args.competitorPDPs[i],
              args.metaInfo,
              competitorLabel
            );
            competitorAnalyses.push(competitorAnalysis);
            console.log(`✅ ${competitorLabel} analysis completed (${i + 1}/${args.competitorPDPs.length})`);

          } catch (error) {
            // Log but don't fail entire analysis if competitor fails
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn(`❌ ${competitorLabel} analysis failed: ${errorMessage}`);
            // Continue to next competitor
          }
        }

        console.log(`Completed competitor analyses: ${competitorAnalyses.length}/${args.competitorPDPs.length} successful`);
      }

      // Calculate Z-scores if competitors exist
      const normalizedScores = competitorAnalyses.length > 0
        ? calculateZScores(mainAnalysis, competitorAnalyses)
        : null;

      // Generate actionable recommendations
      const recommendations = await generateRecommendations(
        mainAnalysis,
        competitorAnalyses,
        args.metaInfo
      );

      // Calculate overall score for the analysis record
      const overallScore = Object.values(mainAnalysis.scores).reduce((sum, score) => sum + score, 0) / Object.keys(mainAnalysis.scores).length;

      // Save analysis record (just tracking usage, no full results)
      await ctx.runMutation(api.analyses.create, {
        type: "pdp_analyzer",
        name: `Design Analysis - ${args.metaInfo?.category || 'Product'}`,
        status: "completed",
        results: {
          overallScore: Math.round(overallScore * 10) / 10, // Just track overall score, not full analysis
          competitorCount: competitorAnalyses.length
        },
      });

      return {
        mainAnalysis,
        competitorAnalyses,
        normalizedScores,
        recommendations,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error analyzing PDP:', error);
      throw new Error(error instanceof Error ? error.message : "Failed to analyze PDP");
    }
  },
});

// Helper function to add delay between API calls to avoid rate limiting
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry logic with exponential backoff for rate limit errors
async function analyzeImageWithRetry(
  imageData: string,
  metaInfo: MetaInfo | undefined,
  label: string = "Your PDP",
  maxRetries: number = 3
): Promise<PDPAnalysis> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await analyzeImage(imageData, metaInfo, label);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      const errorMessage = lastError.message;

      // Don't retry on authentication errors (401)
      if (errorMessage.includes('401') || errorMessage.includes('API key')) {
        throw lastError;
      }

      // Retry on rate limit (429) and server errors (5xx), but not on final attempt
      if (attempt < maxRetries) {
        const shouldRetry =
          errorMessage.includes('429') ||
          errorMessage.includes('rate limit') ||
          errorMessage.includes('500') ||
          errorMessage.includes('503');

        if (shouldRetry) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`${label} analysis failed (attempt ${attempt}/${maxRetries}), retrying in ${backoffDelay}ms...`);
          await delay(backoffDelay);
          continue;
        }
      }

      // Don't retry on other errors (timeouts, client errors, etc.)
      throw lastError;
    }
  }

  throw lastError || new Error(`Failed to analyze ${label} after ${maxRetries} attempts`);
}

// Analyze individual image using Google Gemini 2.0 Flash with enhanced Design Comparator system prompt
async function analyzeImage(
  imageData: string,
  metaInfo: MetaInfo | undefined,
  label: string = "Your PDP"
): Promise<PDPAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = buildAnalysisPrompt(metaInfo, label);

  // System instruction for Gemini
  const systemInstruction = `You are an AI with advanced packaging design expertise, specializing in Principal Display Panel (PDP) analysis. You understand retail psychology, shelf visibility, consumer behavior, and the sophisticated 10-criterion scoring methodology used by professional packaging consultants.

You understand:
- Category-specific design principles and consumer psychology
- Retail environments and shelf behavior patterns
- Brand differentiation strategies and positioning
- Professional packaging assessment methodologies
- Premium design perception and quality indicators
- Omni-channel performance (shelf visibility + digital thumbnails)

Provide expert-level analysis with evidence-based reasoning that demonstrates deep packaging science knowledge.`;

  // Add timeout protection
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error(`Gemini API timeout (30s) for PDP ${label}`);
    controller.abort();
  }, 30000); // 30 second timeout

  console.log(`Analyzing ${label} with Gemini 2.0 Flash`);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json'
        }
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();

      // Provide specific error messages for common issues
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded - Too many requests to Gemini API. Please wait a moment and try again.`);
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(`Invalid API key - Gemini authentication failed. Please check your API key configuration.`);
      } else if (response.status >= 500) {
        throw new Error(`Gemini server error (${response.status}) - The service is temporarily unavailable. Please try again in a few moments.`);
      } else if (response.status === 400) {
        throw new Error(`Invalid request - The image may be too large or in an unsupported format. Please try with a smaller image (under 1MB) in JPG or PNG format.`);
      }

      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Parse Gemini response format
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const resultText = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(resultText);

    return {
      label,
      scores: result.scores,
      analysis: result.analysis,
      visualElements: result.visual_elements,
      strengths: result.strengths || [],
      risks: result.risks || [],
      recommendations: result.recommendations || []
    };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Analysis timeout (30s) - The image analysis took too long. Please try with a smaller image file (under 1MB recommended) or try again in a few moments.`);
    }

    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }

    throw new Error('Analysis failed: Unknown error occurred');
  }
}

// Build analysis prompt using Design Comparator's sophisticated 10-criterion system
function buildAnalysisPrompt(metaInfo: MetaInfo | undefined, _label: string): string {
  const contextInfo = metaInfo ? [
    metaInfo.category && `Product Category: ${metaInfo.category}`,
    metaInfo.description && `Product Description: ${metaInfo.description}`,
    metaInfo.shelfType && `Shelf Type: ${metaInfo.shelfType}`,
    metaInfo.claims && `Primary Claims: ${metaInfo.claims}`,
    metaInfo.analysisFocus && `Analysis Focus: ${metaInfo.analysisFocus}`,
    metaInfo.targetDemographics && `Target Demographics: ${metaInfo.targetDemographics}`,
    metaInfo.retailEnvironment && `Retail Environment: ${metaInfo.retailEnvironment}`,
  ].filter(Boolean).join('\n') : '';

  const category = metaInfo?.category || 'general consumer product';

  return `Analyze this ${category} Principal Display Panel (PDP) packaging using advanced packaging science and consumer psychology expertise.

This image shows the FRONT VIEW of the product packaging - the main display panel that consumers see first on the shelf. Focus your analysis specifically on this front-facing view only.

${contextInfo ? `CONTEXT:\n${contextInfo}\n\n` : ''}

EVALUATION CRITERIA (score each 1-10, half points allowed):

1. VISUAL HIERARCHY
How well the layout guides the eye from the most important element to the least important. Is the brand name, product type, and key benefit ordered logically?

2. BRAND PROMINENCE & PLACEMENT
Is the brand clearly visible and easy to recognize at shelf distance? Is it positioned consistently for maximum recognition?

3. TYPOGRAPHY & READABILITY
Are fonts legible at both close and far distances? Is there a good balance between type sizes, weights, and spacing?

4. COLOR STRATEGY & CONTRAST
Are colors chosen to stand out on the shelf while staying on-brand? Is contrast used to make key elements pop without clashing?

5. IMAGERY INTEGRATION & QUALITY
Are product photos or illustrations high-quality and well-lit? Do they feel cohesive with the rest of the design rather than pasted on?

6. MESSAGING CLARITY & CLAIM PLACEMENT
Are key benefits, features, or claims easy to find and read? Are they placed where the customer's eye naturally lands?

7. SIMPLICITY & FOCUS
Is the artwork free from unnecessary clutter, background noise, or over-detailing? Does each design element serve a clear purpose?

8. BALANCE & COMPOSITION
Is the artwork visually balanced? Are elements spaced evenly so no area feels too empty or overcrowded?

9. SHELF & OMNI-CHANNEL PERFORMANCE
Will the design work well at physical shelf scale and in digital thumbnails? Is it still recognizable and legible when reduced in size or viewed quickly?

10. DESIGN CONSISTENCY & COHESION
Do all visual elements (colors, fonts, imagery, icons) feel like part of the same family? Is there a consistent tone and style throughout the design?

CATEGORY-SPECIFIC CONSIDERATIONS:
Apply category expertise for ${category}:
- Health/Wellness: Prioritize claims communication, transparency, nutritional callouts
- Beverages: Emphasize emotional appeal, brand recognition, refreshment cues  
- Cosmetics/Beauty: Focus on luxury perception, aspirational imagery, brand authority
- Technology: Highlight innovation cues, product features, sophisticated minimalism
- FMCG/Household: Balance information density with clarity and trust signals
- Premium/Luxury: Maximize white space, material finish perception, understated elegance

RESPOND IN THIS EXACT JSON FORMAT:
{
  "scores": {
    "hierarchy": 0.0,
    "branding": 0.0,
    "typography": 0.0,
    "color": 0.0,
    "imagery": 0.0,
    "messaging": 0.0,
    "simplicity": 0.0,
    "balance": 0.0,
    "shelf_performance": 0.0,
    "consistency": 0.0
  },
  "analysis": {
    "hierarchy": "Explanation of score...",
    "branding": "Explanation of score...",
    "typography": "Explanation of score...",
    "color": "Explanation of score...",
    "imagery": "Explanation of score...",
    "messaging": "Explanation of score...",
    "simplicity": "Explanation of score...",
    "balance": "Explanation of score...",
    "shelf_performance": "Explanation of score...",
    "consistency": "Explanation of score..."
  },
  "visual_elements": {
    "logo_position": "Description of logo placement",
    "primary_colors": ["color1", "color2", "color3"],
    "text_hierarchy": "Description of text organization",
    "featured_claims": ["claim1", "claim2"],
    "design_style": "Overall style description"
  },
  "strengths": ["Specific strength with evidence", "Another strength"],
  "risks": ["Potential issue or risk", "Another risk"],
  "recommendations": ["Actionable improvement", "Another recommendation"]
}`;
}

// Calculate Z-scores for competitor comparison using new 10-criterion system
function calculateZScores(
  mainAnalysis: PDPAnalysis,
  competitorAnalyses: PDPAnalysis[]
): NormalizedScores {
  const metrics = [
    'hierarchy', 'branding', 'typography', 'color', 'imagery',
    'messaging', 'simplicity', 'balance', 'shelf_performance', 'consistency'
  ];
  
  const normalizedScores: Record<string, {
    raw_score: number;
    z_score: number;
    percentile: number;
    interpretation: string;
  }> = {};
  
  metrics.forEach(metric => {
    const allScores = [
      mainAnalysis.scores[metric],
      ...competitorAnalyses.map(comp => comp.scores[metric])
    ];
    
    const mean = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const variance = allScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allScores.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate Z-score for main PDP
    const zScore = stdDev > 0 ? (mainAnalysis.scores[metric] - mean) / stdDev : 0;
    
    normalizedScores[metric] = {
      raw_score: mainAnalysis.scores[metric],
      z_score: Math.round(zScore * 100) / 100,
      percentile: calculatePercentile(mainAnalysis.scores[metric], allScores),
      interpretation: interpretZScore(zScore)
    };
  });
  
  return normalizedScores;
}

// Calculate percentile ranking
function calculatePercentile(score: number, allScores: number[]): number {
  const sorted = allScores.sort((a, b) => a - b);
  const rank = sorted.filter(s => s < score).length;
  return Math.round((rank / (sorted.length - 1)) * 100);
}

// Interpret Z-score for user-friendly messaging
function interpretZScore(zScore: number): string {
  if (zScore > 1.5) return "Significantly above average";
  if (zScore > 0.5) return "Above average";
  if (zScore > -0.5) return "Average";
  if (zScore > -1.5) return "Below average";
  return "Significantly below average";
}

// Generate actionable recommendations using Gemini
async function generateRecommendations(
  mainAnalysis: PDPAnalysis,
  competitorAnalyses: PDPAnalysis[],
  metaInfo: MetaInfo | undefined
): Promise<Recommendations> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = buildRecommendationsPrompt(mainAnalysis, competitorAnalyses, metaInfo);

  const systemInstruction = 'You are a packaging design consultant providing actionable recommendations to improve PDP performance based on analysis data.';

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4000,
        responseMimeType: 'application/json'
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API');
  }

  const resultText = data.candidates[0].content.parts[0].text;
  const initialRecommendations = JSON.parse(resultText);
  
  // Validate that we have recommendations for ALL metrics below 8.5
  const qualifyingMetrics = Object.entries(mainAnalysis.scores)
    .filter(([key, value]) => value < 8.5)
    .map(([key, value]) => key);
  
  const existingMetrics = initialRecommendations.priority_improvements.map((imp: any) => imp.metric);
  const missingMetrics = qualifyingMetrics.filter(metric => !existingMetrics.includes(metric));
  
  console.log(`Initial recommendations: ${existingMetrics.length}/${qualifyingMetrics.length} metrics covered`);
  console.log(`Missing metrics: ${missingMetrics.join(', ')}`);
  
  // If we're missing any qualifying metrics, make individual API calls for them
  if (missingMetrics.length > 0) {
    console.log(`Making individual API calls for ${missingMetrics.length} missing metrics...`);
    
    for (let i = 0; i < missingMetrics.length; i++) {
      const metric = missingMetrics[i];
      
      try {
        // Add delay between individual API calls to avoid rate limiting
        if (i > 0) {
          await delay(1000); // 1 second delay between calls
        }
        
        const individualRecommendation = await generateIndividualMetricRecommendation(
          metric,
          mainAnalysis.scores[metric],
          mainAnalysis.analysis[metric],
          metaInfo
        );
        
        if (individualRecommendation) {
          initialRecommendations.priority_improvements.push(individualRecommendation);
          console.log(`✅ Added recommendation for ${metric}`);
        }
      } catch (error) {
        console.warn(`Failed to generate individual recommendation for ${metric}:`, error);
        // Continue with other metrics even if one fails
      }
    }
  }
  
  console.log(`Final recommendations: ${initialRecommendations.priority_improvements.length}/${qualifyingMetrics.length} metrics covered`);
  
  // Ensure we have at least the initial recommendations even if some individual calls failed
  if (initialRecommendations.priority_improvements.length === 0) {
    console.warn('No recommendations generated, this should not happen');
  }
  
  return initialRecommendations;
}

// Generate individual recommendation for a specific metric
async function generateIndividualMetricRecommendation(
  metric: string,
  currentScore: number,
  analysis: string,
  metaInfo: MetaInfo | undefined
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const contextInfo = metaInfo ? [
    metaInfo.category && `Product Category: ${metaInfo.category}`,
    metaInfo.description && `Product Description: ${metaInfo.description}`,
    metaInfo.shelfType && `Shelf Type: ${metaInfo.shelfType}`,
    metaInfo.retailEnvironment && `Retail Environment: ${metaInfo.retailEnvironment}`,
  ].filter(Boolean).join('\n') : '';

  const prompt = `You are an expert packaging design consultant providing a targeted recommendation for a specific metric.

${contextInfo ? `CONTEXT:\n${contextInfo}\n\n` : ''}

METRIC TO IMPROVE: ${metric}
CURRENT SCORE: ${currentScore}/10
CURRENT ANALYSIS: ${analysis}

TARGET: Generate ONE specific recommendation to improve this metric from ${currentScore} to 8.5+.

Provide a focused, actionable recommendation that addresses this specific metric. Be specific about what changes to make and why they will improve the score.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "metric": "${metric}",
  "current_score": ${currentScore},
  "target_score": ${Math.max(currentScore + 1.5, 8.5)},
  "recommendation": "Specific actionable advice for improving this metric",
  "example": "Concrete example or reference"
}`;

  const systemInstruction = 'You are a packaging design consultant providing focused recommendations for specific metrics.';

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json'
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API');
  }

  const resultText = data.candidates[0].content.parts[0].text;
  
  try {
    const result = JSON.parse(resultText);
    
    // Validate the response has the required fields
    if (!result.metric || !result.current_score || !result.recommendation) {
      throw new Error('Invalid response format from individual recommendation API');
    }
    
    return result;
  } catch (parseError) {
    console.error(`Failed to parse individual recommendation for ${metric}:`, parseError);
    console.error('Raw response:', resultText);
    throw new Error(`Failed to parse recommendation response for ${metric}`);
  }
}

// Build recommendations prompt
function buildRecommendationsPrompt(
  mainAnalysis: PDPAnalysis,
  competitorAnalyses: PDPAnalysis[],
  metaInfo: MetaInfo | undefined
): string {
  const contextInfo = metaInfo ? [
    metaInfo.category && `Product Category: ${metaInfo.category}`,
    metaInfo.description && `Product Description: ${metaInfo.description}`,
    metaInfo.shelfType && `Shelf Type: ${metaInfo.shelfType}`,
    metaInfo.retailEnvironment && `Retail Environment: ${metaInfo.retailEnvironment}`,
  ].filter(Boolean).join('\n') : '';

  const competitorData = competitorAnalyses.length > 0 
    ? `\n\nCOMPETITOR COMPARISON:\n${competitorAnalyses.map(comp => 
        `${comp.label}: ${Object.entries(comp.scores).map(([key, value]) => `${key}: ${value}`).join(', ')}`
      ).join('\n')}`
    : '';

  return `You are an expert packaging design consultant providing strategic recommendations based on advanced consumer psychology research and category-specific best practices. Your recommendations will differentiate this analysis from generic AI advice.

Remember: You are analyzing the FRONT VIEW of the product packaging only. All recommendations should focus on improving the front-facing Principal Display Panel that consumers see first on the shelf.

${contextInfo ? `CONTEXT:\n${contextInfo}\n\n` : ''}

YOUR PDP SCORES:
${Object.entries(mainAnalysis.scores).map(([key, value]) => `${key}: ${value}/10`).join('\n')}

METRICS REQUIRING IMPROVEMENT (scores below 8.5):
${Object.entries(mainAnalysis.scores)
  .filter(([key, value]) => value < 8.5)
  .map(([key, value]) => `${key}: ${value}/10`)
  .join('\n')}

YOUR PDP ANALYSIS:
${Object.entries(mainAnalysis.analysis).map(([key, value]) => `${key}: ${value}`).join('\n')}

${competitorData}

EXPERT RECOMMENDATION FRAMEWORK:
Apply these research-backed principles when providing recommendations:

CATEGORY-SPECIFIC EXPERTISE:
- Health/Wellness: Reference RXBAR's success with ingredient-first transparency and bold claims hierarchy
- Beverages: Apply Coca-Cola vs Pepsi emotional appeal lessons and Oatly's creative differentiation strategies  
- Household: Use Method's minimalist success vs traditional cluttered designs
- Technology: Leverage Apple's sophisticated minimalism and premium white space principles
- Cosmetics: Focus on luxury perception through material finish implications and aspirational imagery

CONSUMER PSYCHOLOGY INSIGHTS:
- 3-second shelf scanning behavior: Prioritize immediate visual hierarchy
- Subconscious brand legacy: Balance familiarity with differentiation (Coca-Cola typography success)
- Emotional triggers: Match color psychology to category motivations
- Premium perception: Strategic white space increases perceived quality
- Omni-channel optimization: Ensure designs work at both shelf scale and digital thumbnails

HOLISTIC DESIGN SYNERGY:
- Evaluate combined effect of all elements, not isolated features
- Ensure creativity serves category relevance (Oatly's purposeful quirkiness vs random novelty)
- Consider material/finish perception from visual cues
- Integrate accessibility and cultural sensitivity
- Balance information density with clarity based on category norms

COMPETITIVE DIFFERENTIATION:
- Identify category conventions to either leverage or strategically break
- Reference successful design disruptions (RXBAR minimalism, Oatly's anti-dairy positioning)
- Suggest improvements that create competitive advantage, not just compliance

Provide strategic recommendations that demonstrate deep packaging expertise and consumer behavior understanding. 

CRITICAL REQUIREMENT: You MUST provide improvement recommendations for ALL metrics that score below 8.5. This is not optional - you must include recommendations for every single metric below 8.5, regardless of how many there are.

Based on the "METRICS REQUIRING IMPROVEMENT" section above, you MUST provide a priority_improvements entry for EVERY SINGLE metric listed there. Each metric in that list requires an improvement recommendation. Do not skip any of them. Do not limit yourself to just the lowest 3 scores.

Focus on ALL metrics that score below 8.5 (indicating room for improvement) plus holistic strategy.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "priority_improvements": [
    {
      "metric": "metric_name",
      "current_score": 0.0,
      "target_score": 0.0,
      "recommendation": "Specific actionable advice",
      "example": "Concrete example or reference"
    }
    // CRITICAL: Include EVERY metric from the "METRICS REQUIRING IMPROVEMENT" section above
  ],
  "overall_strategy": "High-level strategic advice for PDP optimization",
  "quick_wins": [
    "Easy change #1",
    "Easy change #2",
    "Easy change #3"
  ],
  "competitive_advantages": [
    "Strength to maintain/emphasize"
  ]
}`;
}

// Type definitions
interface MetaInfo {
  category?: string;
  description?: string;
  shelfType?: string;
  claims?: string;
  analysisFocus?: string;
  targetDemographics?: string;
  retailEnvironment?: string;
}

interface PDPAnalysis {
  label: string;
  scores: {
    hierarchy: number;
    branding: number;
    typography: number;
    color: number;
    imagery: number;
    messaging: number;
    simplicity: number;
    balance: number;
    shelf_performance: number;
    consistency: number;
    [key: string]: number;
  };
  analysis: {
    [key: string]: string;
  };
  visualElements: {
    logo_position: string;
    primary_colors: string[];
    text_hierarchy: string;
    featured_claims: string[];
    design_style: string;
  };
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

interface NormalizedScores {
  [key: string]: {
    raw_score: number;
    z_score: number;
    percentile: number;
    interpretation: string;
  };
}

interface Recommendations {
  priority_improvements: Array<{
    metric: string;
    current_score: number;
    target_score: number;
    recommendation: string;
    example: string;
  }>;
  overall_strategy: string;
  quick_wins: string[];
  competitive_advantages: string[];
}