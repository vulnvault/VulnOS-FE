// ecosystem.contact.config.js
// PM2 configuration specifically for the contact form server.

module.exports = {
  apps : [{
    name   : "vulnos-contact-form",     // A unique name for this server process
    script : "./server.js",             // Path to the contact form server.js
    env    : {
      "NODE_ENV": "production",
      "PORT": 3001,                     // Running on a different port to avoid conflicts
      
      // Paste your Microsoft 365 credentials here
      "M365_USER_EMAIL": "no-reply@vulnos.tech",
      "M365_APP_PASSWORD": "cyswrjldytzrmnpw"
    }
  }]
};
