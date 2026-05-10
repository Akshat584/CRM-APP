const inboxService = require('./inboxService');

const verify = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
};

const events = async (req, res) => {
  try {
    const { body } = req;

    if (body.object) {
      const value = body.entry?.[0]?.changes?.[0]?.value;
      if (!value) return res.sendStatus(200);

      // Handle incoming messages
      if (value.messages && value.messages[0]) {
        const message = value.messages[0];
        const from = message.from; // phone number
        const msgBody = message.text ? message.text.body : '';
        const type = message.type;
        const metaId = message.id;

        await inboxService.handleInboundMessage({
          phone: from,
          content: msgBody,
          type,
          metaId,
          raw: message
        });
      }

      // Handle status updates (delivered, read, failed)
      if (value.statuses && value.statuses[0]) {
        const statusUpdate = value.statuses[0];
        await inboxService.handleStatusUpdate({
          metaId: statusUpdate.id,
          status: statusUpdate.status,
          timestamp: statusUpdate.timestamp,
          recipientId: statusUpdate.recipient_id
        });
      }

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};

module.exports = {
  verify,
  events
};
