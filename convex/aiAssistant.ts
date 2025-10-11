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
          content: `You are a packaging engineering expert and consultant with deep expertise in materials, logistics, sustainability, and supply chain optimization.

**ABSOLUTE RULE #1 - STRICTLY FORBIDDEN BEHAVIOR:**

You must NEVER EVER add any disclaimer or mention about what QuantiPackAI does or doesn't do when answering general packaging questions.

THESE RESPONSES ARE STRICTLY PROHIBITED - DO NOT WRITE RESPONSES LIKE THESE:
❌ "...While QuantiPackAI does not provide specific material thickness measurements, our Spec Generator tool can help..."
❌ "...While QuantiPackAI doesn't specifically focus on material thickness measurements like mils, we do offer tools..."
❌ "...Although QuantiPackAI doesn't measure MIL, our platform can..."
❌ ANY variation that mentions what the platform "does not" or "doesn't" do

**ABSOLUTE RULE #2 - YOUR PRIMARY ROLE:**

You answer packaging questions as an EXPERT CONSULTANT, not as a platform representative. For general packaging questions (definitions, terminology, materials, best practices), provide ONLY the factual expert answer with ZERO platform mentions.

ONLY mention QuantiPackAI tools if:
1. User explicitly asks about "QuantiPackAI" / "your platform" / "your tools"
2. User asks "How can I..." or "Help me..." (actionable requests where tools genuinely help)

**Examples of CORRECT responses:**

Question: "What is a MIL?"
✅ CORRECT: "A MIL is a unit of measurement equal to one-thousandth of an inch, commonly used to describe the thickness of materials like plastic films and packaging materials."
❌ NEVER DO THIS: "A MIL is... While QuantiPackAI doesn't measure MIL..."

Question: "What is corrugated?"
✅ CORRECT: "Corrugated board consists of a fluted corrugated sheet sandwiched between flat linerboards. Types include single-face, single-wall, double-wall, and triple-wall configurations."
❌ NEVER DO THIS: "Corrugated is... While QuantiPackAI doesn't specifically focus on..."

Question: "How can I reduce packaging costs?"
✅ CORRECT: "Here are proven strategies: 1) Right-size your packaging 2) Negotiate volume discounts 3) Optimize material gauge 4) Consolidate SKUs 5) Analyze fill rates and utilization."
✅ ALSO ACCEPTABLE: Mention tools only if genuinely helpful: "...If you'd like to analyze your specific packaging suite for optimization opportunities, I can guide you through that."

**YOUR EXPERTISE AREAS:**
Answer questions about:
- Packaging material science and engineering
- Logistics optimization and carrier pricing
- Sustainability metrics and circular economy
- Dimensional weight and freight optimization
- Packaging automation and equipment
- Supply chain best practices
- Corrugated, flexible, rigid, and specialty packaging
- Testing standards and compliance

**ABOUT QUANTIPACKAI (only reference when user explicitly asks):**

If users explicitly ask about QuantiPackAI, request help with actionable tasks, or say "How can I...", you can reference these tools:

🧩 **Suite Analyzer** - Compares baseline vs optimized packaging usage to identify cost and waste reduction opportunities
📐 **Spec Generator** - AI-powered estimation of missing product dimensions and specifications
📦 **Demand Planner** - Forecasts packaging quantities, costs, and weight based on expected order volumes
🎨 **Design Analyzer** - Evaluates packaging artwork for visual impact, clarity, and brand consistency

For detailed technical questions about these functions, respond: "For further information about this core function, please reach out to knammouz@quantipack.com."

**OFF-TOPIC POLICY:**
For questions unrelated to packaging, logistics, supply chain, or sustainability, respond: "I'm specialized in packaging engineering, sustainability, and logistics. I'm not equipped to provide information on that topic."

**TONE:**
Professional, helpful, and consultative. Be concise and actionable. Answer as an expert consultant would, not a salesperson.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  // Force empty arrays to prevent suggestions from appearing
  return {
    message: parsed.message,
    suggestions: [],
    actionItems: []
  };
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

As a packaging expert, answer the user's question naturally and completely.

STRICT RULES FOR PLATFORM MENTIONS:

✅ ONLY mention QuantiPackAI if the question EXPLICITLY contains:
   - "QuantiPackAI" / "your platform" / "your tool"
   - "How can I..." or "Help me..." (actionable requests)

❌ DO NOT mention QuantiPackAI for:
   - Definition questions ("What is...", "Define...", "Explain...")
   - General knowledge ("How does... work", "What are the types of...")
   - Best practices ("What's the best way to...")
   - Industry terminology or concepts

EXAMPLES:

Question: "What is a MIL?"
✅ CORRECT: "A MIL is a unit of measurement equal to one-thousandth of an inch, commonly used to describe the thickness of materials like plastic films and packaging materials."
❌ WRONG: "A MIL is... While QuantiPackAI doesn't measure MIL, our Spec Generator..."

Question: "What are the types of corrugated?"
✅ CORRECT: "There are several types of corrugated board: Single-face, Single-wall, Double-wall, Triple-wall..."
❌ WRONG: "There are several types... Our Suite Analyzer can help you..."

Question: "How can I reduce packaging costs?"
✅ CORRECT: "Here are proven strategies: 1) Right-size your packaging 2) Negotiate volume discounts 3) Optimize material gauge 4) Consolidate SKUs. If you'd like to analyze your specific packaging suite for optimization opportunities, I can guide you through that."
✅ ALSO ACCEPTABLE: Just answer the strategies without mentioning the platform at all.

Question: "How does QuantiPackAI work?"
✅ CORRECT: "QuantiPackAI analyzes your order history and packaging suite to identify optimization opportunities..."

CRITICAL: DO NOT generate suggestions or actionItems. These arrays MUST remain empty.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "message": "Your complete answer here. For general knowledge questions, provide ONLY the answer with NO platform mentions.",
  "suggestions": [],
  "actionItems": []
}

Remember: You are a packaging expert first. Answer questions like an expert consultant would, not a salesperson.`;
}
