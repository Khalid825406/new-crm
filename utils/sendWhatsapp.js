const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsAppMessage = async (toPhone, message) => {
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${toPhone}`, 
      body: message,
    });
    console.log('✅ WhatsApp message sent');
  } catch (error) {
    console.error(' Failed to send WhatsApp:', error.message);
  }
};

module.exports = sendWhatsAppMessage;
