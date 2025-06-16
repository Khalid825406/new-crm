// // routes/adminRoutes.js
// const express = require('express');
// const router = express.Router();
// const { getPendingUsers, approveUser, rejectUser, getAllUsers, getAllTechnicians , assignJobToTechnician} = require('../controllers/adminController');
// const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
// const {rejectJob,acceptJob, newgetAssignedJobs} = require('../controllers/userController')



// // ✅ Technician-only routes (authenticated + role check)
// router.use(verifyToken, authorizeRoles('technician'));

// // Only admin can access
// router.use(verifyToken, authorizeRoles('admin'));

// // GET pending users
// router.get('/pending-users', getPendingUsers);

// // PUT approve user
// router.put('/approve-user/:id', approveUser);

// // DELETE reject user
// router.delete('/reject-user/:id', rejectUser);

// router.get('/all-users', getAllUsers); // Fetch all for admin dashboard

// // 🔹 Get all approved technicians
// router.get('/all-technicians', getAllTechnicians);

// // 🔹 Assign technician to a job
// router.post('/assign-job', assignJobToTechnician);

// router.get('/assigned-jobs', authMiddleware(['technician']), newgetAssignedJobs);
// router.post('/accept-job/:jobId', acceptJob);
// router.post('/reject-job/:jobId', rejectJob);


// module.exports = router;


// routes/adminRoutes.js
// const express = require('express');
// const router = express.Router();

// const {
//   getPendingUsers,
//   approveUser,
//   rejectUser,
//   getAllUsers,
//   getAllTechnicians,
//   assignJobToTechnician,
// } = require('../controllers/adminController');

// const {
//   newgetAssignedJobs,
// } = require('../controllers/userController');

// const { 
//   getAssignedJobsWithStatus, 
//   acceptJob,
//   rejectJob,
//   updateJobStatus,
//  } = require('../controllers/jobController');

// const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// // ✅ Admin Routes
// router.get('/pending-users', verifyToken, authorizeRoles('admin'), getPendingUsers);
// router.put('/approve-user/:id', verifyToken, authorizeRoles('admin'), approveUser);
// router.delete('/reject-user/:id', verifyToken, authorizeRoles('admin'), rejectUser);
// router.get('/all-users', verifyToken, authorizeRoles('admin'), getAllUsers);
// router.get('/all-technicians', verifyToken, authorizeRoles('admin'), getAllTechnicians);
// router.post('/assign-job', verifyToken, authorizeRoles('admin'), assignJobToTechnician);

// // ✅ Technician Routes
// router.get('/assigned-jobs', verifyToken, authorizeRoles('technician'), newgetAssignedJobs);

// router.get(
//   '/assigned-jobs-status',
//   verifyToken,
//   authorizeRoles('admin', 'technician'),
//   getAssignedJobsWithStatus
// );


// router.post(
//   '/admin/accept-job/:jobId',
//   verifyToken,
//   authorizeRoles('technician'),
//   acceptJob
// );

// router.post(
//   '/admin/reject-job/:jobId',
//   verifyToken,
//   authorizeRoles('technician'),
//   rejectJob
// );

// router.post(
//   '/admin/update-status/:jobId',
//   verifyToken,
//   authorizeRoles('technician'),
//   updateJobStatus
// );

// module.exports = router;


// routes/adminRoutes.js


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

// ===============================
// ✅ Admin Routes
// ===============================
router.get('/pending-users', verifyToken, authorizeRoles('admin'), getPendingUsers);
router.put('/approve-user/:id', verifyToken, authorizeRoles('admin'), approveUser);
router.delete('/reject-user/:id', verifyToken, authorizeRoles('admin'), rejectUser);
router.get('/all-users', verifyToken, authorizeRoles('admin'), getAllUsers);
router.get('/all-technicians', verifyToken, authorizeRoles('admin'), getAllTechnicians);
router.post('/assign-job', verifyToken, authorizeRoles('admin'), assignJobToTechnician);

// 🔹 Job status tracking for admin & technician
router.get('/assigned-jobs-status', verifyToken, authorizeRoles('admin', 'technician'), getAssignedJobsWithStatus);

// ===============================
// ✅ Technician Routes
// ===============================
router.get('/assigned-jobs', verifyToken, authorizeRoles('technician'), newgetAssignedJobs);

router.post('/accept-job/:jobId', verifyToken, authorizeRoles('technician'), acceptJob);
router.post('/reject-job/:jobId', verifyToken, authorizeRoles('technician'), rejectJob);
router.post('/update-status/:jobId', verifyToken, authorizeRoles('technician'), updateJobStatus);

module.exports = router;
