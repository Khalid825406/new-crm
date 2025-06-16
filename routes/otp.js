const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../utils/twilio');


function formatPhoneNumber(number) {
  if (!number) return null;

  const trimmed = number.trim();

 
  if (trimmed.startsWith('+')) return trimmed;


  if (!/^\d{10}$/.test(trimmed)) {
    return null; 
  }

  
  return `+91${trimmed}`;
}


router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    return res.status(400).json({ message: 'Invalid phone number format (must be 10 digits)' });
  }

  console.log('Sending OTP to:', formattedPhone);

  try {
    const status = await sendOtp(formattedPhone);
    return res.status(200).json({ message: 'OTP sent successfully', status });
  } catch (err) {
    console.error('Send OTP Error:', err.message);
    return res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
});


router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ message: 'Phone number and OTP code are required' });
  }

  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    return res.status(400).json({ message: 'Invalid phone number format (must be 10 digits)' });
  }

  console.log('Verifying OTP for:', formattedPhone);

  try {
    const result = await verifyOtp(formattedPhone, code);

    if (result.status === 'approved') {
      return res.status(200).json({ message: 'OTP verified successfully', status: result.status });
    } else {
      return res.status(400).json({ message: 'Invalid or expired OTP', status: result.status });
    }
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    return res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
});

module.exports = router;
