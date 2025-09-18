
#!/bin/bash

# Install dependencies
npm install

# Build the application
npm run build

# Prepare for Azure deployment
node deploy.js

# Install express for the server
npm install express --save
