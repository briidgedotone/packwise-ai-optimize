import { v } from "convex/values";
import { action } from "./_generated/server";

// Product Packaging Design Comparator Action
export const compareDesigns = action({
  args: {
    category: v.string(),
    market_context: v.optional(v.string()),
    designs: v.array(v.object({
      id: v.string(),
      image_data: v.string(), // base64 encoded
      variant: v.optional(v.string()),
      copy: v.optional(v.object({
        product_name: v.optional(v.string()),
        claims: v.optional(v.array(v.string())),
        benefits: v.optional(v.array(v.string()))
      })),
      brand_rules: v.optional(v.object({
        colors: v.optional(v.array(v.string())),
        typography: v.optional(v.string()),
        rules: v.optional(v.array(v.string()))
      })),
      constraints: v.optional(v.object({
        print_method: v.optional(v.string()),
        substrate: v.optional(v.string()),
        dieline: v.optional(v.string()),
        legal_area: v.optional(v.string())
      })),
      claims_evidence: v.optional(v.boolean()),
      accessibility_targets: v.optional(v.object({
        min_text_size: v.optional(v.number()),
        contrast_ratio: v.optional(v.number())
      }))
    })),
    weights: v.optional(v.object({
      branding: v.optional(v.number()),
      hierarchy: v.optional(v.number()),
      variant: v.optional(v.number()),
      color: v.optional(v.number()),
      imagery: v.optional(v.number()),
      claims: v.optional(v.number()),
      compliance: v.optional(v.number()),
      accessibility: v.optional(v.number()),
      feasibility: v.optional(v.number()),
      sustainability: v.optional(v.number()),
      differentiation: v.optional(v.number())
    }))
  },
  handler: async (_ctx, args) => {
    try {
      // Normalize weights to sum to 1.0
      const defaultWeights = {
        branding: 0.18,
        hierarchy: 0.18,
        variant: 0.12,
        color: 0.10,
        imagery: 0.08,
        claims: 0.08,
        compliance: 0.07,
        accessibility: 0.07,
        feasibility: 0.06,
        sustainability: 0.06,
        differentiation: 0.10
      };

      const weights = args.weights ? { ...defaultWeights, ...args.weights } : defaultWeights;
      
      // Normalize weights to sum to 1.0
      const weightSum = Object.values(weights).reduce((sum, w) => sum + w, 0);
      if (weightSum !== 1.0) {
        Object.keys(weights).forEach(key => {
          weights[key as keyof typeof weights] = weights[key as keyof typeof weights] / weightSum;
        });
      }

      // Analyze each design sequentially to prevent WebSocket overload
      const designAnalyses = [];
      for (const design of args.designs) {
        console.log(`Analyzing design ${design.id}...`);
        const analysis = await analyzeDesign(design, args.category, args.market_context);
        designAnalyses.push(analysis);
        console.log(`Completed analysis for design ${design.id}`);
      }

      // Calculate weighted totals
      const designResults = designAnalyses.map((analysis, index) => {
        const weighted_total = calculateWeightedTotal(analysis.scores, weights);
        return {
          id: args.designs[index].id,
          scores: analysis.scores,
          weighted_total: Math.round(weighted_total * 100) / 100,
          strengths: analysis.strengths,
          risks: analysis.risks,
          recommendations: analysis.recommendations
        };
      });

      // Determine winner with tie-break rules
      const winner = determineWinner(designResults);

      // Generate shared opportunities
      const opportunities = generateSharedOpportunities(designAnalyses, args.category);

      // Calculate confidence based on image quality and analysis depth
      const confidence = calculateConfidence(designAnalyses);

      // Generate assumptions list
      const assumptions = generateAssumptions(args, designAnalyses);

      return {
        category: args.category,
        assumptions,
        weights_used: weights,
        designs: designResults,
        winner,
        opportunities_shared_across_designs: opportunities,
        confidence: Math.round(confidence * 100) / 100
      };

    } catch (error) {
      console.error('Error comparing designs:', error);
      throw new Error(error instanceof Error ? error.message : "Failed to compare designs");
    }
  }
});

// Analyze individual design using GPT-5 with packaging expertise
async function analyzeDesign(
  design: DesignInput,
  category: string,
  market_context?: string
): Promise<DesignAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = buildDesignAnalysisPrompt(design, category, market_context);
  
  // Add timeout protection to prevent WebSocket connection drops
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error(`OpenAI API timeout (30s) for design ${design.id}`);
    controller.abort();
  }, 30000); // 30 second timeout per design analysis
  
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
            content: `You are GPT-5 Thinking, a rigorous packaging design analyst. Your job is to score product designs on a 1-10 scale across clear criteria, explain the reasoning concisely, and provide evidence-based insights.

You understand:
- Category-specific design principles and consumer psychology
- Retail environments and shelf behavior
- Brand differentiation strategies
- Accessibility and compliance requirements
- Material and print feasibility considerations

Score each design fairly with evidence-based reasoning that demonstrates packaging expertise.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${design.image_data}`,
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
      scores: result.scores,
      strengths: result.strengths || [],
      risks: result.risks || [],
      recommendations: result.recommendations || []
    };
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Design analysis timeout for ${design.id} - request took longer than 30 seconds`);
    }
    
    throw error;
  }
}

// Build comprehensive analysis prompt
function buildDesignAnalysisPrompt(design: DesignInput, category: string, market_context?: string): string {
  const contextInfo = [
    `Product Category: ${category}`,
    market_context && `Market Context: ${market_context}`,
    design.variant && `Variant: ${design.variant}`,
    design.copy?.product_name && `Product Name: ${design.copy.product_name}`,
    design.copy?.claims && `Key Claims: ${design.copy.claims.join(', ')}`,
    design.brand_rules?.colors && `Brand Colors: ${design.brand_rules.colors.join(', ')}`,
    design.constraints?.print_method && `Print Method: ${design.constraints.print_method}`,
    design.accessibility_targets && `Accessibility Requirements: Min text ${design.accessibility_targets.min_text_size}px, Contrast ${design.accessibility_targets.contrast_ratio}:1`
  ].filter(Boolean).join('\n');

  return `Analyze this ${category} product packaging design using advanced packaging science and consumer psychology expertise.

${contextInfo}

EVALUATION CRITERIA (score each 1-10, half points allowed):

1. BRANDING & RECOGNITION (0.18 weight)
Logo visibility at 3-6 ft, distinctiveness, memorability, brand codes consistency, SKU navigation system

2. HIERARCHY & READABILITY (0.18 weight)  
Visual flow, headline legibility, distance readability, type contrast/size/spacing, clutter management

3. FLAVOR/VARIANT COMMUNICATION (0.12 weight)
Clarity of variant (copy + imagery), appetite cues realism, avoidance of confusion

4. COLOR STRATEGY & CONTRAST (0.10 weight)
Contrast vs background, category signaling, shelf pop, harmony vs noise, color blindness resilience

5. IMAGERY QUALITY (0.08 weight)
Photo/illustration quality, cropping, lighting, relevance, consistency potential

6. CLAIMS & PROOF (0.08 weight)
Clarity and trust of claims, seal/third-party marks, hierarchy, compliance risk assessment

7. COMPLIANCE & MANDATORY INFO (0.07 weight)
Space and legibility for regulatory marks, net weight, nutrition, recycling, warnings

8. ACCESSIBILITY & INCLUSIVITY (0.07 weight)
Minimum text size, WCAG contrast for key text, icon aids, language clarity

9. STRUCTURAL FIT & PRINT FEASIBILITY (0.06 weight)
Dieline fit, seam/curve distortion risk, ink coverage cost, substrate suitability, barcode zone

10. SUSTAINABILITY CUES (0.06 weight)
Honest material/recyclability signaling, greenwashing avoidance, credible icons

11. DIFFERENTIATION & SHELF IMPACT (0.10 weight)
Distinctiveness vs typical shelf, quick findability, stopping power without sacrificing clarity

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
    "variant": 0.0,
    "color": 0.0,
    "imagery": 0.0,
    "claims": 0.0,
    "compliance": 0.0,
    "accessibility": 0.0,
    "feasibility": 0.0,
    "sustainability": 0.0,
    "differentiation": 0.0
  },
  "strengths": ["Specific strength with evidence", "Another strength"],
  "risks": ["Potential issue or risk", "Another risk"],
  "recommendations": ["Actionable improvement", "Another recommendation"]
}`;
}

// Calculate weighted total score
function calculateWeightedTotal(scores: Record<string, number>, weights: Record<string, number>): number {
  let total = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    if (scores[key] !== undefined) {
      total += scores[key] * weight;
    }
  });
  return total;
}

// Determine winner with tie-break rules
function determineWinner(designs: DesignResult[]): { id: string; reason: string } {
  // Sort by weighted total (descending)
  const sorted = [...designs].sort((a, b) => b.weighted_total - a.weighted_total);
  
  const topScore = sorted[0].weighted_total;
  const tied = sorted.filter(d => Math.abs(d.weighted_total - topScore) <= 0.1);
  
  if (tied.length === 1) {
    return {
      id: tied[0].id,
      reason: `Won with highest weighted score of ${topScore}, excelling in key criteria.`
    };
  }
  
  // Tie-break by Branding & Recognition → Hierarchy & Readability → Differentiation & Shelf Impact
  const tieBreakers = ['branding', 'hierarchy', 'differentiation'];
  
  for (const metric of tieBreakers) {
    tied.sort((a, b) => b.scores[metric] - a.scores[metric]);
    if (tied[0].scores[metric] > tied[1].scores[metric]) {
      return {
        id: tied[0].id,
        reason: `Won by tie-break on ${metric} (${tied[0].scores[metric]} vs ${tied[1].scores[metric]}) after tied weighted scores.`
      };
    }
  }
  
  // Final tie-break: lowest compliance risk, highest accessibility
  tied.sort((a, b) => (b.scores.accessibility - b.scores.compliance) - (a.scores.accessibility - a.scores.compliance));
  
  return {
    id: tied[0].id,
    reason: `Won by final tie-break on compliance risk and accessibility after all other ties.`
  };
}

// Generate shared improvement opportunities  
function generateSharedOpportunities(_analyses: DesignAnalysis[], category: string): string[] {
  const commonThemes = [
    "Consider omni-channel performance - ensure designs work at shelf scale and digital thumbnails",
    `Apply ${category}-specific consumer psychology triggers for emotional connection`,
    "Evaluate combined effect of all elements for holistic design synergy",
    "Balance information density with clarity based on category norms",
    "Ensure accessibility integration doesn't compromise design effectiveness"
  ];
  
  return commonThemes;
}

// Calculate confidence score based on analysis quality
function calculateConfidence(analyses: DesignAnalysis[]): number {
  // Base confidence on whether all designs were analyzed successfully
  // and if scores seem reasonable (not all 0s or all 10s)
  let confidence = 0.8; // Base confidence
  
  analyses.forEach((analysis: DesignAnalysis) => {
    const scores = Object.values(analysis.scores);
    const avgScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    
    // Reduce confidence if scores seem unrealistic
    if (avgScore === 0 || avgScore === 10) {
      confidence -= 0.2;
    }
    
    // Reduce confidence if no recommendations provided
    if (!analysis.recommendations.length) {
      confidence -= 0.1;
    }
  });
  
  return Math.max(0.1, confidence); // Minimum 0.1 confidence
}

// Generate assumptions list
function generateAssumptions(args: any, _analyses: DesignAnalysis[]): string[] {
  const assumptions = [
    "Analysis based on front-facing Principal Display Panel view only",
    "Retail viewing distance assumed to be 3-6 feet unless specified",
    "Standard lighting conditions assumed for color evaluation"
  ];
  
  if (!args.market_context) {
    assumptions.push("General market context assumed without specific competitive landscape");
  }
  
  if (args.designs.some((d: any) => !d.variant)) {
    assumptions.push("Some variant information inferred from visual elements");
  }
  
  return assumptions;
}

// Type definitions
interface DesignInput {
  id: string;
  image_data: string;
  variant?: string;
  copy?: {
    product_name?: string;
    claims?: string[];
    benefits?: string[];
  };
  brand_rules?: {
    colors?: string[];
    typography?: string;
    rules?: string[];
  };
  constraints?: {
    print_method?: string;
    substrate?: string;
    dieline?: string;
    legal_area?: string;
  };
  claims_evidence?: boolean;
  accessibility_targets?: {
    min_text_size?: number;
    contrast_ratio?: number;
  };
}

interface DesignAnalysis {
  scores: {
    branding: number;
    hierarchy: number;
    variant: number;
    color: number;
    imagery: number;
    claims: number;
    compliance: number;
    accessibility: number;
    feasibility: number;
    sustainability: number;
    differentiation: number;
  };
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

interface DesignResult {
  id: string;
  scores: Record<string, number>;
  weighted_total: number;
  strengths: string[];
  risks: string[];
  recommendations: string[];
}