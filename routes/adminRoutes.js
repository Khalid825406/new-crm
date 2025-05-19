// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser, rejectUser, getAllUsers } = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Only admin can access
router.use(verifyToken, authorizeRoles('admin'));

// GET pending users
router.get('/pending-users', getPendingUsers);

// PUT approve user
router.put('/approve-user/:id', approveUser);

// DELETE reject user
router.delete('/reject-user/:id', rejectUser);

router.get('/all-users', getAllUsers); // Fetch all for admin dashboard


module.exports = router;
