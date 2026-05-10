const { OpenAI } = require('openai');

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const summarizeConversation = async (messages) => {
  if (!openai) {
    // Fallback/Mock for development without API key
    return {
      property_intent: "Interested in high-floor units with sea views (Mock Data)",
      budget: "$2.5M - $3M (Mock Data)",
      next_steps: "Schedule viewing for Saturday (Mock Data)",
      sentiment: "Positive / High Intent"
    };
  }

  const conversationText = messages.map(m => 
    `${m.direction === 'inbound' ? 'Customer' : 'Agent'}: ${m.content}`
  ).join('\n');

  const prompt = `
    Analyze the following WhatsApp conversation between a Real Estate Agent and a Customer.
    Extract the following information in a structured JSON format:
    - property_intent (What kind of property are they looking for?)
    - budget (What is their mentioned budget or range?)
    - next_steps (What is the immediate action required?)
    - sentiment (Overall intent level and tone)

    Conversation:
    ${conversationText}

    Return ONLY the JSON object.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw new Error('Failed to analyze conversation with AI');
  }
};

module.exports = { summarizeConversation };