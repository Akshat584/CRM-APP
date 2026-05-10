require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { sanitizeBody } = require('./middleware/xssSanitize');
const { generateCsrfToken, verifyCsrfToken } = require('./middleware/csrf');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dealRoutes = require('./routes/dealRoutes');
const activityRoutes = require('./routes/activityRoutes');
const taskRoutes = require('./routes/taskRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const searchRoutes = require('./routes/searchRoutes');
const whatsappRoutes = require('./modules/whatsapp/routes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const stripeController = require('./controllers/stripeController');
const stripeRoutes = require('./routes/stripeRoutes');
const { initSocket } = require('./socket');

const app = express();
const server = require('http').createServer(app);

// Initialize Socket.io
initSocket(server);

// Security headers
app.use(helmet());

app.use(morgan('dev'));

// Stripe Webhook needs raw body, mount it before express.json
app.post('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.webhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize inputs
app.use(sanitizeBody);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['X-CSRF-Token']
}));

// CSRF Protection
app.use(generateCsrfToken);
// Exclude stripe webhook from CSRF
app.use('/api', (req, res, next) => {
  if (req.path === '/v1/stripe/webhook') return next();
  verifyCsrfToken(req, res, next);
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/deals', dealRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/stripe', stripeRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;