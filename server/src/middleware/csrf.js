const crypto = require('crypto');

const generateCsrfToken = (req, res, next) => {
  let token = req.cookies['XSRF-TOKEN'];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }
  // Also send in a header that the client can read
  res.setHeader('X-CSRF-Token', token);
  next();
};

const verifyCsrfToken = (req, res, next) => {
  // Skip CSRF validation for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const tokenFromCookie = req.cookies['XSRF-TOKEN'];
  const tokenFromHeader = req.headers['x-xsrf-token'];

  if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
    console.warn(`CSRF validation failed for ${req.method} ${req.originalUrl}. Cookie: ${!!tokenFromCookie}, Header: ${!!tokenFromHeader}`);
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
  }

  next();
};

module.exports = {
  generateCsrfToken,
  verifyCsrfToken
};
