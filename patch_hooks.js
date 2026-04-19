const fs = require('fs');
const path = require('path');

const patchHookFile = (file, entityName) => {
  let content = fs.readFileSync(file, 'utf8');

  // Inject useToast import
  if (!content.includes('useToast')) {
    content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useToast } from '../context/ToastContext';");
  }

  // Replace each hook definition
  ['Create', 'Update', 'Delete'].forEach(action => {
    const hookName = "use" + action + entityName;
    
    if (content.includes("const " + hookName + " = () => {")) {
      content = content.replace(
        "const " + hookName + " = () => {",
        "const " + hookName + " = () => {\n  const { addToast } = useToast();"
      );
      
      const lowerAction = action.toLowerCase();
      
      // Patch success toast
      content = content.replace(
        /return { success: true, data: response\.data\.data };/g,
        "addToast('" + entityName + " " + lowerAction + "d successfully', 'success');\n      return { success: true, data: response.data.data };"
      );
      // For delete which returns { success: true }
      content = content.replace(
        /return { success: true };/g,
        "addToast('" + entityName + " " + lowerAction + "d successfully', 'success');\n      return { success: true };"
      );
      
      // Patch error toast
      content = content.replace(
        /setError\(errorMessage\);\n      return { success: false, error: errorMessage };/g,
        "setError(errorMessage);\n      addToast(errorMessage, 'error');\n      return { success: false, error: errorMessage };"
      );
    }
  });

  fs.writeFileSync(file, content);
  console.log("Patched " + file);
};

['Contact', 'Deal', 'Task', 'Activity'].forEach(entityName => {
  const fileName = entityName === 'Activity' ? 'Activities' : entityName + 's';
  const file = path.join(__dirname, 'client/src/hooks', "use" + fileName + ".js");
  if (fs.existsSync(file)) {
    patchHookFile(file, entityName);
  }
});
