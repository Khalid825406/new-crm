const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

async function sendOtp(phoneNumber) {
  try {
    const verification = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' });
    return verification;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

async function verifyOtp(phoneNumber, code) {
  try {
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: phoneNumber, code });
    return verificationCheck;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

module.exports = {
  sendOtp,
  verifyOtp
};