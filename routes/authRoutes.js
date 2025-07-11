const express = require('express');
const router = express.Router();
const { register, login ,checkApproval} = require('../controllers/authController');


router.post('/register', register);
router.post('/login', login);
router.get('/check-approval', checkApproval);

// POST /api/auth/reset-password

router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword; // ⛔ NOTE: ideally hash this!
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;