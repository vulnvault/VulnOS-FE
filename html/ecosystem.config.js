// ecosystem.contact.config.js
// PM2 configuration specifically for the contact form server.

module.exports = {
  apps: [{
    name: 'vulnos-contact-server', // A name for your app
    script: 'server.js', // The path to your server file
    watch: '.',
    
    env_production: {
      "NODE_ENV": "production",
      "PORT": 3001, // Or whatever port you use in production
      "M365_USER_EMAIL": "no-reply@vulnos.tech",
      "M365_APP_PASSWORD": "cyswrjldytzrmnpw",
      "CONTACT_FORM_RECIPIENT": "contact@vulnos.tech"
    }
  }]
};
