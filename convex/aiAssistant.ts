import { v } from "convex/values";
import { action } from "./_generated/server";

// Universal AI Assistant for Packaging Optimization
export const askAssistant = action({
  args: {
    message: v.string(),
    context: v.optional(v.object({
      currentFeature: v.optional(v.string()), // suite-analyzer, pdp-analyzer, spec-generator, etc.
      userHistory: v.optional(v.array(v.string())), // Previous messages for context
      analysisResults: v.optional(v.any()), // Current analysis data if available
    }))
  },
  handler: async (ctx, args) => {
    try {
      const response = await generateAssistantResponse(args.message, args.context);
      return {
        response: response.message,
        suggestions: response.suggestions,
        actionItems: response.actionItems,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error in AI Assistant:', error);
      throw new Error(error instanceof Error ? error.message : "Failed to get AI response");
    }
  },
});

// Generate comprehensive AI response for packaging optimization
async function generateAssistantResponse(
  userMessage: string,
  context?: {
    currentFeature?: string;
    userHistory?: string[];
    analysisResults?: any;
  }
): Promise<{
  message: string;
  suggestions: string[];
  actionItems: string[];
}> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = buildAssistantPrompt(userMessage, context);

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
          content: `You are an expert AI assistant for QuantiPackAI, a comprehensive packaging optimization platform. You provide accurate information ONLY about what our platform actually does.

**PLATFORM FEATURES - WHAT EACH TOOL ACTUALLY DOES:**

1. **Packaging Suite Analyzer**
   - Analyzes order volumes and packaging inventory
   - Optimizes package allocation to minimize costs
   - Calculates CUIN (cubic inches) for packages
   - Identifies cost-saving opportunities through better package selection
   - Shows baseline usage vs. recommended optimized allocation
   - **DOES NOT**: Calculate dimensional weight charges, provide carrier-specific pricing, or integrate with shipping carriers

2. **Spec Generator**
   - AI-powered generation of packaging specifications
   - Creates detailed spec sheets with dimensions, materials, and requirements
   - Template-based outputs for standardization
   - Accepts product lists (CSV) with optional descriptions and categories
   - **DOES NOT**: Design actual packaging graphics or 3D models

3. **Packaging Demand Planner**
   - Forecasts future packaging needs based on historical data
   - Analyzes usage trends and patterns
   - Helps plan inventory levels to avoid stockouts
   - Provides demand projections for better procurement
   - **DOES NOT**: Integrate with inventory management systems or place orders automatically

4. **Design Analyzer** (formerly PDP Analyzer)
   - AI-powered visual analysis of packaging designs using GPT-4 Vision
   - Scores designs across 10 criteria: visual hierarchy, brand prominence, typography, color strategy, imagery quality, messaging clarity, simplicity, balance, shelf performance, consistency
   - Compares your design against competitor designs with weighted scoring
   - Provides actionable recommendations for improvement
   - Analyzes the front-facing Principal Display Panel only
   - **DOES NOT**: Create new designs, provide print-ready files, or analyze structural packaging

**EXPERTISE AREAS:**
- Packaging cost optimization and allocation strategies
- CUIN calculations and volume-based package selection
- Visual design analysis and competitive benchmarking
- Demand forecasting and inventory planning
- Specification documentation and standardization

**RESPONSE GUIDELINES:**
- Be accurate about what each tool does and does NOT do
- Never claim features we don't have (like dimensional weight calculations, carrier integration, etc.)
- Provide specific, actionable advice within our platform's actual capabilities
- If asked about something we don't do, acknowledge it and suggest what we DO offer
- Use clear, concise language focused on business value
- Reference specific QuantiPackAI features when relevant

**IMPORTANT - WHAT WE DO NOT DO:**
- Dimensional weight calculations or carrier-specific pricing
- Integration with shipping carriers (UPS, FedEx, USPS)
- 3D packaging design or structural engineering
- Automated inventory ordering or ERP integration
- Print production or file preparation
- Material sourcing or supplier management`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Build contextual prompt for the AI assistant
function buildAssistantPrompt(
  userMessage: string,
  context?: {
    currentFeature?: string;
    userHistory?: string[];
    analysisResults?: any;
  }
): string {
  const contextInfo = [];

  if (context?.currentFeature) {
    contextInfo.push(`Current Feature: ${context.currentFeature}`);
  }

  if (context?.userHistory && context.userHistory.length > 0) {
    contextInfo.push(`Previous Context: ${context.userHistory.slice(-3).join(', ')}`);
  }

  if (context?.analysisResults) {
    contextInfo.push(`Current Analysis: Available (user has analysis results to reference)`);
  }

  return `User Question: "${userMessage}"

${contextInfo.length > 0 ? `Context:\n${contextInfo.join('\n')}\n` : ''}

As a QuantiPackAI packaging optimization expert, provide a helpful and ACCURATE response that:

1. Directly addresses the user's question with factual information about what our platform actually does
2. Provides actionable next steps specific to our platform's actual capabilities
3. References relevant QuantiPackAI features when appropriate (but only features we actually have)
4. If the user asks about something we don't do, politely clarify what we DO offer instead

RESPOND IN THIS EXACT JSON FORMAT:
{
  "message": "Direct helpful response to the user's question (2-4 sentences max). Be accurate about our capabilities.",
  "suggestions": [
    "Specific actionable suggestion 1 (within our platform capabilities)",
    "Specific actionable suggestion 2 (within our platform capabilities)",
    "Specific actionable suggestion 3 (within our platform capabilities)"
  ],
  "actionItems": [
    "Immediate next step the user can take in QuantiPackAI",
    "Follow-up action if applicable"
  ]
}

Focus on being practical, accurate, and specific to what QuantiPackAI actually does.`;
}
