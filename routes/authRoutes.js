const express = require('express');
const router = express.Router();
const { register, login ,checkApproval} = require('../controllers/authController');


router.post('/register', register);
router.post('/login', login);
router.get('/check-approval', checkApproval);


module.exports = router;