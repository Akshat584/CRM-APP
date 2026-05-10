const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0';
const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env;

const api = axios.create({
  baseURL: `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const sendTextMessage = async (to, text) => {
  try {
    const response = await api.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text }
    });
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error (Text):', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to send WhatsApp message');
  }
};

const sendTemplate = async (to, templateName, languageCode = 'en_US', components = []) => {
  try {
    const response = await api.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components
      }
    });
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error (Template):', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to send WhatsApp template');
  }
};

const getTemplates = async () => {
  try {
    // Note: Templates are fetched from the WABA ID, not the Phone Number ID
    const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const response = await axios.get(`${WHATSAPP_API_URL}/${WABA_ID}/message_templates`, {
      headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('WhatsApp API Error (Fetch Templates):', error.response?.data || error.message);
    throw new Error('Failed to fetch WhatsApp templates');
  }
};

module.exports = {
  sendTextMessage,
  sendTemplate,
  getTemplates
};
