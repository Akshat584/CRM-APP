const aiService = require('../services/aiService');
const inboxService = require('../modules/whatsapp/inboxService');

const getConversationSummary = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // 1. Fetch messages for this conversation
    const messages = await inboxService.getMessages(conversationId);
    
    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'No messages to analyze' });
    }

    // 2. Get AI summary
    const summary = await aiService.summarizeConversation(messages);
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('AI Summary Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate intelligence summary' });
  }
};

module.exports = { getConversationSummary };