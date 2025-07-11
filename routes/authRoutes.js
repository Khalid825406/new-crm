const express = require('express');
const router = express.Router();
const { register, login ,checkApproval} = require('../controllers/authController');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/check-approval', checkApproval);



router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    if (!username || !newPassword) {
      return res.status(400).json({ message: 'Username and new password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(' Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;