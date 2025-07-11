// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const jobRoute = require('./routes/jobRoute');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const otpRoutes = require('./routes/otp');
const newStart = require('./routes/newstart')
const technicianRoutes = require('./routes/technicianRoutes')
const staffRoutes = require('./routes/staffRoutes');



const notificationRoutes = require('./routes/notificationRoutes'); 

const app = express();

app.use(cors({
  origin: ['https://www.sultanmedical-crm.com'], 
  credentials: true, 
}));
app.use(express.json());



// Route prefixes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes); 
// Routes
app.use('/api', jobRoute); 
app.use('/api/technician', newStart); 
app.use('/api/technician', technicianRoutes);
// 🔐 OTP routes
app.use('/api', otpRoutes);

app.use('/api/staff', staffRoutes);

app.use('/api/notifications', notificationRoutes); 


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get("/", (req, res)=>{
 res.send("Api Working...")
})
// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error(' MongoDB connection error:', err));
  