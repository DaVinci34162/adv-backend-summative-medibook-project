require('dotenv').config();
const express = require('express');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const errorHandler = require('./middleware/errorHandler');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Central Error Handler (must be the last app.use)
app.use(errorHandler);

app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MediBook server running on http://localhost:${PORT}`);
});