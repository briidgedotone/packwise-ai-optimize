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
          content: `You are an expert AI assistant for QuantiPackAI, a comprehensive packaging optimization platform. You help users with:

1. **Packaging Suite Analyzer**: Cost optimization, material recommendations, CUIN calculations
2. **Spec Generator**: AI-powered specification creation and templates  
3. **Packaging Demand Planner**: Forecasting, usage analysis, inventory planning
4. **PDP Analyzer**: Principal Display Panel optimization, visual analysis  
5. **Design Comparator**: Multi-design comparison with rigorous 10-criterion scoring methodology focusing on brand visibility, premium appeal, and professional presentation

EXPERTISE AREAS:
- Packaging engineering and material science
- Cost optimization and supply chain efficiency
- Consumer psychology and shelf psychology
- Regulatory compliance and sustainability
- Brand positioning and visual design
- Data analysis and forecasting

RESPONSE STYLE:
- Be concise but comprehensive
- Provide actionable insights
- Reference specific QuantiPackAI features when relevant
- Use industry terminology appropriately
- Always think about ROI and business impact

You should help users navigate the platform, interpret results, troubleshoot issues, and make strategic packaging decisions.`
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

As a QuantiPackAI packaging optimization expert, provide a helpful response that:

1. Directly addresses the user's question
2. Provides actionable next steps specific to the platform
3. References relevant QuantiPackAI features when appropriate
4. Considers business impact and ROI

RESPOND IN THIS EXACT JSON FORMAT:
{
  "message": "Direct helpful response to the user's question (2-4 sentences max)",
  "suggestions": [
    "Specific actionable suggestion 1",
    "Specific actionable suggestion 2",
    "Specific actionable suggestion 3"
  ],
  "actionItems": [
    "Immediate next step the user can take",
    "Follow-up action if applicable"
  ]
}

Focus on being practical and specific to packaging optimization and the QuantiPackAI platform features.`;
}