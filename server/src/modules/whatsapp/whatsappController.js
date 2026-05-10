const inboxService = require('./inboxService');
const whatsappService = require('./whatsappService');

const getConversations = async (req, res) => {
  try {
    const { assigned_to, status } = req.query;
    const conversations = await inboxService.getConversations({
      userId: req.user.userId,
      assignedTo: assigned_to,
      status
    });
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
};

const assignConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await inboxService.assignConversation(req.params.id, userId);
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Assign conversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign conversation' });
  }
};

const getTeam = async (req, res) => {
  try {
    const team = await inboxService.getTeam();
    res.json({ success: true, data: team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch team' });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await inboxService.getMessages(req.params.id);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { phone, content, type, templateName, languageCode, contact_id, mediaIdOrUrl, caption } = req.body;
    
    let result;
    if (type === 'template') {
      result = await whatsappService.sendTemplate(phone, templateName, languageCode);
    } else if (['image', 'video', 'audio', 'document'].includes(type)) {
      result = await whatsappService.sendMediaMessage(phone, type, mediaIdOrUrl, caption);
    } else {
      result = await whatsappService.sendTextMessage(phone, content);
    }

    // Save outbound message to DB
    const message = await inboxService.saveOutboundMessage(req.user.userId, {
      phone,
      content: content || `[${type}]`,
      type,
      contact_id,
      meta_id: result.messages[0].id
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send message' });
  }
};

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }
    // Stub: In production, upload to Meta Media API here
    // const mediaId = await whatsappService.uploadToMeta(req.file);
    res.json({ 
      success: true, 
      data: { 
        mediaId: 'stub_id_' + Date.now(),
        fileName: req.file.originalname,
        mimeType: req.file.mimetype
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = await inboxService.getTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch templates' });
  }
};

const syncTemplates = async (req, res) => {
  try {
    const metaTemplates = await whatsappService.getTemplates();
    const synced = await inboxService.syncTemplates(metaTemplates);
    res.json({ success: true, data: synced });
  } catch (error) {
    console.error('Sync templates error:', error);
    res.status(500).json({ success: false, error: 'Failed to sync templates' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  uploadMedia,
  getTemplates,
  assignConversation,
  getTeam,
  syncTemplates
};
