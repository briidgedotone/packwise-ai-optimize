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

// Analyze individual image using OpenAI Vision with enhanced Design Comparator system prompt
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
  
  // Add timeout protection similar to Design Comparator
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error(`OpenAI API timeout (30s) for PDP ${label}`);
    controller.abort();
  }, 30000); // 30 second timeout
  
  console.log(`Analyzing ${label} with enhanced GPT-4 Vision`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are GPT-4 Vision with advanced packaging design expertise, specializing in Principal Display Panel (PDP) analysis. You understand retail psychology, shelf visibility, consumer behavior, and the sophisticated 10-criterion scoring methodology used by professional packaging consultants.

You understand:
- Category-specific design principles and consumer psychology
- Retail environments and shelf behavior patterns
- Brand differentiation strategies and positioning
- Professional packaging assessment methodologies
- Premium design perception and quality indicators
- Omni-channel performance (shelf visibility + digital thumbnails)

Provide expert-level analysis with evidence-based reasoning that demonstrates deep packaging science knowledge.`
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
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });
    
    clearTimeout(timeoutId);
    
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
      strengths: result.strengths || [],
      risks: result.risks || [],
      recommendations: result.recommendations || []
    };
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`PDP analysis timeout for ${label} - request took longer than 30 seconds`);
    }
    
    throw error;
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

1. BRANDING & RECOGNITION (Primary Focus)
Brand visibility and recognition from a distance - is the brand name easy to find and recognize? Logo distinctiveness, memorability, brand consistency across elements.

2. VISUAL HIERARCHY & READABILITY (Primary Focus)
Information clarity and layout organization - clean layouts where the eye knows where to look first. Visual flow, headline legibility, type contrast/size/spacing, clutter management.

3. COLOR BLOCKING & CONTRAST (High Impact)
Color use and impact - strong use of unified color zones and high contrast that makes the design pop on shelf. Professional color coordination and category-appropriate choices.

4. PREMIUM & PROFESSIONAL APPEAL (Quality Perception)
Premium look and feel - does the design reflect quality and professionalism for the target market? Material choice perception, finishes, refinement, and elevated design execution.

5. KEY BENEFIT/CLAIM COMMUNICATION (Message Priority)
Message priority - are the most important claims or benefits front and center? Clear communication of primary product value proposition and key differentiators.

6. SIMPLICITY & FOCUS (Clean Design)
Design simplicity - is the design free from unnecessary clutter that could distract the buyer? Clean, focused approach that prioritizes essential information.

7. IMAGERY QUALITY & INTEGRATION (Visual Appeal)
Image quality - are photos or graphics sharp, clear, and relevant to the product? Professional imagery that enhances brand perception and product appeal.

8. SKU DIFFERENTIATION (Variant Recognition)
Variant recognition - can customers easily tell product variations apart while maintaining brand cohesion? Clear flavor/variant communication without confusion.

9. MODERNITY & DESIGN RELEVANCE (Contemporary Appeal)
Modern style - does the design feel current and competitive in today's market? Contemporary aesthetic that aligns with category trends and consumer expectations.

10. COMPLIANCE & LEGIBILITY (Required Information)
Required information - are mandatory details (weight, specs, certifications) legible and well-placed? Regulatory compliance without dominating the design.

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
    "branding": 0.0,
    "hierarchy": 0.0,
    "color": 0.0,
    "premium": 0.0,
    "claims": 0.0,
    "simplicity": 0.0,
    "imagery": 0.0,
    "variant": 0.0,
    "modernity": 0.0,
    "compliance": 0.0
  },
  "analysis": {
    "branding": "Explanation of score...",
    "hierarchy": "Explanation of score...",
    "color": "Explanation of score...",
    "premium": "Explanation of score...",
    "claims": "Explanation of score...",
    "simplicity": "Explanation of score...",
    "imagery": "Explanation of score...",
    "variant": "Explanation of score...",
    "modernity": "Explanation of score...",
    "compliance": "Explanation of score..."
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
    'branding', 'hierarchy', 'color', 'premium', 'claims', 
    'simplicity', 'imagery', 'variant', 'modernity', 'compliance'
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
    branding: number;
    hierarchy: number;
    color: number;
    premium: number;
    claims: number;
    simplicity: number;
    imagery: number;
    variant: number;
    modernity: number;
    compliance: number;
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