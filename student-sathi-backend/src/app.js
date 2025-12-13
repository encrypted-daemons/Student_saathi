const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

// 👇 Routes Import karo
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/properties');
const serviceRoutes = require('./routes/services'); 
const roommateRoutes = require('./routes/roommates');
const marketplaceRoutes = require('./routes/marketplace');
const wikiRoutes = require('./routes/wiki');
const eventRoutes = require('./routes/events');
const issueRoutes = require('./routes/issues');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notificationRoutes'); // ✅ New Route

const app = express();

// 1. Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. Routes Mount karo
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/roommates', roommateRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);

 // ✅ Yahan connect hoga

// 3. Health Check
app.get('/', (req, res) => {
    res.json({ 
        success: true, 
        message: "🚀 Student Sathi Backend is Live!",
        timestamp: new Date()
    });
});

// 4. Error Handling
app.use(errorHandler);

module.exports = app;
