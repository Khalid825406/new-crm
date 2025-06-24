const express = require('express');
const router = express.Router();

const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  getAllTechnicians,
  assignJobToTechnician,
} = require('../controllers/adminController');

const {
  newgetAssignedJobs,
} = require('../controllers/userController');

const { 
  getAssignedJobsWithStatus, 
  acceptJob,
  rejectJob,
  updateJobStatus,
} = require('../controllers/jobController');

const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');


router.get('/pending-users', verifyToken, authorizeRoles('admin'), getPendingUsers);
router.put('/approve-user/:id', verifyToken, authorizeRoles('admin'), approveUser);
router.delete('/reject-user/:id', verifyToken, authorizeRoles('admin'), rejectUser);
router.get('/all-users', verifyToken, authorizeRoles('admin'), getAllUsers);
router.get('/all-technicians', verifyToken, authorizeRoles('admin','staff'), getAllTechnicians);
router.post('/assign-job', verifyToken, authorizeRoles('admin','staff'), assignJobToTechnician);


router.get('/assigned-jobs-status', verifyToken, authorizeRoles('admin', 'technician', 'staff'), getAssignedJobsWithStatus);


router.get('/assigned-jobs', verifyToken, authorizeRoles('technician','staff'), newgetAssignedJobs);

router.post('/accept-job/:jobId', verifyToken, authorizeRoles('technician','staff'), acceptJob);
router.post('/reject-job/:jobId', verifyToken, authorizeRoles('technician','staff'), rejectJob);
router.post('/update-status/:jobId', verifyToken, authorizeRoles('technician', 'staff'), updateJobStatus);

module.exports = router;