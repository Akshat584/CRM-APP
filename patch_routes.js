const fs = require('fs');
const path = require('path');
const routesDir = path.join(__dirname, 'server/src/routes');

fs.readdirSync(routesDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace default import with named import
    content = content.replace(
      "const requireAuth = require('../middleware/requireAuth');",
      "const { requireAuth } = require('../middleware/requireAuth');"
    );
    
    fs.writeFileSync(filePath, content);
  }
});
console.log('Routes patched.');