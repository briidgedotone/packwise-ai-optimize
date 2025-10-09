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
          content: `You are an expert AI assistant for QuantiPackAI, a comprehensive packaging optimization platform.

**QuantiPackAI Global Prompting & Response Summary**

If users have detailed or technical questions about any function, respond: "For further information about this core function, please reach out to knammouz@quantipack.com."

🧩 **Suite Analyzer**

**Purpose:**
Compares how packaging is currently used versus how it could be optimized to reduce cost, material, and waste.

**Inputs Needed:**
- Order history (order volume data)
- Packaging suite (package types, sizes, weights, costs, and usage rates)

**Outputs:**
- Baseline vs. optimized package distribution
- Cost and material savings
- Fill-rate and utilization metrics

**Main Use:**
Identify inefficiencies, reduce packaging waste, and visualize potential savings opportunities.

For complete feature details and limitations, visit the Suite Analyzer page for a complete manual.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📐 **Spec Generator**

**Purpose:**
Estimates missing product or packaging dimensions using AI-based scaling and bounding data.

**Inputs Needed:**
- Product list (with product names)
- Minimum and maximum dimensions (to define scale limits)

**Outputs:**
- Estimated Length, Width, Height, and Volume
- Confidence levels and reasoning notes

**Main Use:**
Build or complete packaging specification libraries quickly when dimension data is missing.

For complete feature details and limitations, visit the Spec Generator page for a complete manual.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 **Demand Planner**

**Purpose:**
Forecasts packaging quantities, costs, and total weight based on expected order volumes and usage rates.

**Inputs Needed:**
- Packaging data (type, cost, weight)
- Historical usage or manual percentages
- Forecasted order count and optional safety buffer

**Outputs:**
- Quantity forecast per package type
- Total projected cost and weight
- Budget and buffer-adjusted summaries

**Main Use:**
Plan packaging inventory and budgets accurately for upcoming demand cycles.

For complete feature details and limitations, visit the Demand Planner page for a complete manual.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 **Design Analyzer**

**Purpose:**
Evaluates packaging artwork to measure visual impact, clarity, and brand consistency across 10 design metrics.

**Inputs Needed:**
- 1–5 design images (main and optional competitor designs)
- Product category and short description

**Outputs:**
- Overall design score (0–10)
- Strengths, weaknesses, and improvement recommendations
- Competitive benchmarking insights

**Main Use:**
Analyze design performance and receive actionable feedback to improve shelf presence and communication clarity.

For complete feature details and limitations, visit the Design Analyzer page for a complete manual.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**GENERAL PACKAGING QUESTIONS:**
For general packaging, logistics, sustainability, or supply chain-related questions outside the four core tools, answer normally using your knowledge without line limits. Topics include:
- Packaging material science
- Logistics optimization
- Sustainability metrics
- Carrier pricing and dimensional weight
- Packaging automation and equipment
- Supply chain best practices

**OFF-TOPIC POLICY:**
Avoid questions unrelated to packaging, logistics, supply chain, or sustainability. If asked about unrelated topics (politics, health, entertainment, etc.), respond: "I'm specialized in packaging engineering, sustainability, and logistics. I'm not equipped to provide information on that topic."

**TONE:**
Maintain a professional, helpful, and consultative tone. Be concise and actionable in your responses.`
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
