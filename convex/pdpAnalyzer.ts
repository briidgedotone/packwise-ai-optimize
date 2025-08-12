import { v } from "convex/values";
import { action } from "./_generated/server";

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
      // Analyze main PDP
      const mainAnalysis = await analyzeImage(args.mainPDPData, args.metaInfo);
      
      // Analyze competitor PDPs if provided
      const competitorAnalyses = [];
      if (args.competitorPDPs && args.competitorPDPs.length > 0) {
        for (let i = 0; i < args.competitorPDPs.length; i++) {
          const competitorAnalysis = await analyzeImage(
            args.competitorPDPs[i], 
            args.metaInfo,
            `Competitor ${String.fromCharCode(65 + i)}` // A, B, C, D
          );
          competitorAnalyses.push(competitorAnalysis);
        }
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

// Analyze individual image using OpenAI Vision
async function analyzeImage(
  imageData: string,
  metaInfo: MetaInfo | undefined,
  label: string = "Your PDP"
): Promise<PDPAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = buildAnalysisPrompt(metaInfo, label);
  
  console.log(`Analyzing ${label} with OpenAI Vision`);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a packaging design expert specializing in Principal Display Panel (PDP) analysis. You understand retail psychology, shelf visibility, and consumer behavior.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:image/jpeg;base64,${imageData}`,
                detail: 'high'
              } 
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI Vision API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return {
    label,
    scores: result.scores,
    analysis: result.analysis,
    visualElements: result.visual_elements,
  };
}

// Build analysis prompt for OpenAI Vision
function buildAnalysisPrompt(metaInfo: MetaInfo | undefined, label: string): string {
  const contextInfo = metaInfo ? [
    metaInfo.category && `Product Category: ${metaInfo.category}`,
    metaInfo.description && `Product Description: ${metaInfo.description}`,
    metaInfo.shelfType && `Shelf Type: ${metaInfo.shelfType}`,
    metaInfo.claims && `Primary Claims: ${metaInfo.claims}`,
    metaInfo.analysisFocus && `Analysis Focus: ${metaInfo.analysisFocus}`,
    metaInfo.targetDemographics && `Target Demographics: ${metaInfo.targetDemographics}`,
    metaInfo.retailEnvironment && `Retail Environment: ${metaInfo.retailEnvironment}`,
  ].filter(Boolean).join('\n') : '';

  return `You are an expert packaging design consultant with deep knowledge of consumer psychology, retail environments, and category-specific design principles. Analyze this Principal Display Panel (PDP) using advanced packaging science.

This image shows the FRONT VIEW of the product packaging - the main display panel that consumers see first on the shelf. Focus your analysis and recommendations specifically on this front-facing view only.

${contextInfo ? `CONTEXT:\n${contextInfo}\n\n` : ''}

ADVANCED ANALYSIS FRAMEWORK:
Use category-specific expertise to evaluate holistic design effectiveness. Consider these research-backed principles:

CATEGORY-SPECIFIC WEIGHTING:
- Health/Wellness Products: Prioritize claims communication, transparency, nutritional callouts
- Beverages: Emphasize emotional appeal, brand recognition, refreshment cues
- Cosmetics/Beauty: Focus on luxury perception, aspirational imagery, brand authority
- Technology: Highlight innovation cues, product features, sophisticated minimalism
- FMCG/Household: Balance information density with clarity and trust signals
- Premium/Luxury: Maximize white space, material finish perception, understated elegance

CONSUMER PSYCHOLOGY FACTORS:
- Subconscious emotional triggers (nostalgia, trust, excitement)
- Brand familiarity vs. innovation balance
- Implicit visual preferences (logo placement psychology, color emotional impact)
- Shelf scanning behavior (3-second attention span, peripheral vision)
- Cultural and inclusive design sensitivity

Score each metric from 0-10 (10 being excellent):

1. HIERARCHY - Visual flow directing eye to category-relevant elements first
2. READABILITY - Text clarity optimized for shelf distance AND digital thumbnails  
3. COLOR_IMPACT - Emotionally appropriate palette with high contrast and category fit
4. LOGO_VISIBILITY - Brand recognition optimized for both familiarity and distinctiveness
5. EMOTIONAL_APPEAL - Psychological triggers aligned with category motivations
6. CLAIMS_COMMUNICATION - Key benefits presented with category-appropriate prominence
7. FONT_CHOICE - Typography balancing legibility, personality, and premium perception
8. WHITE_SPACE_BALANCE - Strategic spacing enhancing perceived quality and comprehension

HOLISTIC EVALUATION CRITERIA:
- Synergy between all elements (not isolated features)
- Category authenticity vs. creative differentiation
- Omni-channel performance (shelf + digital)
- Compliance and accessibility integration
- Material/finish perception from visual cues

For each score, provide reasoning that demonstrates category expertise and consumer psychology understanding.

Also identify key visual elements:
- Logo position psychology and brand recognition impact
- Color palette emotional triggers and category appropriateness
- Typography personality and legibility balance
- Claims hierarchy matching consumer priorities
- Design authenticity vs. differentiation strategy

RESPOND IN THIS EXACT JSON FORMAT:
{
  "scores": {
    "hierarchy": 0.0,
    "readability": 0.0,
    "color_impact": 0.0,
    "logo_visibility": 0.0,
    "emotional_appeal": 0.0,
    "claims_communication": 0.0,
    "font_choice": 0.0,
    "white_space_balance": 0.0
  },
  "analysis": {
    "hierarchy": "Explanation of score...",
    "readability": "Explanation of score...",
    "color_impact": "Explanation of score...",
    "logo_visibility": "Explanation of score...",
    "emotional_appeal": "Explanation of score...",
    "claims_communication": "Explanation of score...",
    "font_choice": "Explanation of score...",
    "white_space_balance": "Explanation of score..."
  },
  "visual_elements": {
    "logo_position": "Description of logo placement",
    "primary_colors": ["color1", "color2", "color3"],
    "text_hierarchy": "Description of text organization",
    "featured_claims": ["claim1", "claim2"],
    "design_style": "Overall style description"
  }
}`;
}

// Calculate Z-scores for competitor comparison
function calculateZScores(
  mainAnalysis: PDPAnalysis,
  competitorAnalyses: PDPAnalysis[]
): NormalizedScores {
  const metrics = [
    'hierarchy', 'readability', 'color_impact', 'logo_visibility',
    'emotional_appeal', 'claims_communication', 'font_choice', 'white_space_balance'
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

// Generate actionable recommendations using GPT
async function generateRecommendations(
  mainAnalysis: PDPAnalysis,
  competitorAnalyses: PDPAnalysis[],
  metaInfo: MetaInfo | undefined
): Promise<Recommendations> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = buildRecommendationsPrompt(mainAnalysis, competitorAnalyses, metaInfo);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a packaging design consultant providing actionable recommendations to improve PDP performance based on analysis data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
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

Provide strategic recommendations that demonstrate deep packaging expertise and consumer behavior understanding. Focus on the 3 lowest-scoring metrics plus holistic strategy.

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
    readability: number;
    color_impact: number;
    logo_visibility: number;
    emotional_appeal: number;
    claims_communication: number;
    font_choice: number;
    white_space_balance: number;
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