const fs = require('fs');
const path = require('path');

const authControllerFile = path.join(__dirname, 'server/src/controllers/authController.js');
let authContent = fs.readFileSync(authControllerFile, 'utf8');

// Add password complexity
authContent = authContent.replace(
  "body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')",
  "body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*])/).withMessage('Password must contain uppercase, lowercase, number, and special character')"
);

// Add login lockout mechanism (in-memory for simplicity)
const lockoutCode = `
const loginAttempts = new Map();

const login = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Lockout check
      const attempts = loginAttempts.get(email) || { count: 0, lockoutEnd: 0 };
      if (attempts.lockoutEnd > Date.now()) {
        return res.status(429).json({ success: false, error: 'Account locked. Try again later.' });
      }

      const user = await authService.getUserByEmail(email);
      if (!user) {
        attempts.count += 1;
        loginAttempts.set(email, attempts);
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const isValidPassword = await authService.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        attempts.count += 1;
        if (attempts.count >= 5) {
          attempts.lockoutEnd = Date.now() + 15 * 60 * 1000; // 15 mins
        }
        loginAttempts.set(email, attempts);
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      // Reset attempts
      loginAttempts.delete(email);

`;

authContent = authContent.replace(/const login = \[\n  body\('email'\)[\s\S]*?const user = await authService\.getUserByEmail\(email\);\n      if \(!user\) {\n        return res\.status\(401\)\.json\({\n          success: false,\n          error: 'Invalid credentials'\n        }\);\n      }\n\n      const isValidPassword = await authService\.verifyPassword\(password, user\.password_hash\);\n      if \(!isValidPassword\) {\n        return res\.status\(401\)\.json\({\n          success: false,\n          error: 'Invalid credentials'\n        }\);\n      }/, lockoutCode);

fs.writeFileSync(authControllerFile, authContent);
console.log('Patched authController.js for security');

// Add audit log table
const migrationFile = path.join(__dirname, 'server/src/db/migrations/003_audit_logs.sql');
fs.writeFileSync(migrationFile, `
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`);
console.log('Created audit logs migration');
