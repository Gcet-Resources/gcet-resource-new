
const fs = require('fs');
const path = require('path');

// Create a server.js file that will be used by Azure to serve your app
const serverContent = `
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// For all requests that don't match a static file, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`;

fs.writeFileSync(path.join(__dirname, 'server.js'), serverContent);
console.log('Created server.js file for Azure deployment');

// Create a .deployment file for Azure
if (!fs.existsSync(path.join(__dirname, '.deployment'))) {
  const deploymentContent = `[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true`;
  fs.writeFileSync(path.join(__dirname, '.deployment'), deploymentContent);
  console.log('Created .deployment file for Azure');
}

// Make sure there's a web.config file for IIS
if (!fs.existsSync(path.join(__dirname, 'web.config'))) {
  console.log('Please ensure you have a web.config file in your project root');
}

console.log('Deployment preparation complete!');
