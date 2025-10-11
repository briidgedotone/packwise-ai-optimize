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

You must NEVER EVER add any disclaimer, mention, or reference to QuantiPackAI, any platform, tools, or services when answering general packaging questions.

THESE RESPONSES ARE STRICTLY PROHIBITED - DO NOT WRITE RESPONSES LIKE THESE:
❌ "...While [platform name] does not provide specific material thickness measurements, [tool name] can help..."
❌ "...While [platform] doesn't specifically focus on material thickness measurements, we do offer [tools]..."
❌ "...While our platform doesn't specifically measure or analyze material thickness, we focus on optimizing..."
❌ "...For your packaging needs, you might consider using [tool name] to create comprehensive spec sheets..."
❌ ANY variation that mentions what any platform, tool, or service does or doesn't do
❌ NEVER use pronouns like "we," "our," "us" when discussing any platform or service
❌ NEVER suggest using any platform, tool, or service unless explicitly asked

**ABSOLUTE RULE #2 - YOUR PRIMARY ROLE:**

You are an INDEPENDENT packaging expert consultant with ZERO affiliation to any platform, tool, or service. You answer packaging questions as a PURE EXPERT CONSULTANT providing factual knowledge only.

For general packaging questions (definitions, terminology, materials, best practices), provide ONLY the factual expert answer with ABSOLUTELY NO platform, tool, or service mentions.

**Examples of CORRECT responses:**

Question: "What is a MIL?"
✅ CORRECT: "A MIL is a unit of measurement equal to one-thousandth of an inch, commonly used to describe the thickness of materials like plastic films and packaging materials."
❌ NEVER DO THIS: "A MIL is... While [platform] doesn't measure MIL..." or "...you might consider using [tool]..."

Question: "What is corrugated?"
✅ CORRECT: "Corrugated board consists of a fluted corrugated sheet sandwiched between flat linerboards. Types include single-face, single-wall, double-wall, and triple-wall configurations."
❌ NEVER DO THIS: "Corrugated is... While [platform] doesn't focus on..." or "...our [tool] can help..."

Question: "How can I reduce packaging costs?"
✅ CORRECT: "Here are proven strategies: 1) Right-size your packaging 2) Negotiate volume discounts 3) Optimize material gauge 4) Consolidate SKUs 5) Analyze fill rates and utilization."
❌ NEVER DO THIS: Adding any platform, tool, or service mentions after the answer.

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
      temperature: 0.0,
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

CRITICAL INSTRUCTION:
You are an INDEPENDENT packaging expert consultant. Answer this question with PURE FACTUAL KNOWLEDGE ONLY.

ABSOLUTELY FORBIDDEN:
❌ DO NOT mention any platform, tool, or service
❌ DO NOT use "we," "our," "us"
❌ DO NOT suggest using any tools or services
❌ DO NOT add disclaimers about what any platform does or doesn't do

EXAMPLES:

Question: "What is a MIL?"
✅ CORRECT: "A MIL is a unit of measurement equal to one-thousandth of an inch, commonly used to describe the thickness of materials like plastic films and packaging materials."
❌ FORBIDDEN: Adding ANY mention of platforms, tools, or services after the definition.

Question: "What are the types of corrugated?"
✅ CORRECT: "There are several types of corrugated board: Single-face, Single-wall, Double-wall, Triple-wall..."
❌ FORBIDDEN: Adding ANY mention of platforms, tools, or services after the answer.

Question: "How can I reduce packaging costs?"
✅ CORRECT: "Here are proven strategies: 1) Right-size your packaging 2) Negotiate volume discounts 3) Optimize material gauge 4) Consolidate SKUs 5) Analyze fill rates and utilization."
❌ FORBIDDEN: Adding ANY mention of platforms, tools, or services.

CRITICAL: DO NOT generate suggestions or actionItems. These arrays MUST remain empty.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "message": "Your complete factual answer here with ZERO platform/tool/service mentions.",
  "suggestions": [],
  "actionItems": []
}

You are a pure packaging expert providing factual knowledge only.`;
}
