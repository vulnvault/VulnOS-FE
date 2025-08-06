// Simplified server.js for the contact form

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // Modern replacement for bodyParser.json()

// Nodemailer setup using environment variables from ecosystem.config.js
const mailer = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.M365_USER_EMAIL,
        pass: process.env.M365_APP_PASSWORD
    }
});

// The single route to handle form submissions
app.post('/submit-contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Email content for the site owner
    const mailOptions = {
        from: `"VulnOS Website Form" <${process.env.M365_USER_EMAIL}>`,
        replyTo: email,
        to: process.env.CONTACT_FORM_RECIPIENT,
        subject: `New Contact Form Submission from ${name}: ${subject}`,
        html: `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `
    };

    try {
        // Attempt to send the single email to the site owner
        await mailer.sendMail(mailOptions);
        
        // Respond to the user's browser to confirm success
        const ticketNumber = Math.floor(10000 + Math.random() * 90000);
        res.status(200).json({
            message: 'Your message has been sent successfully!',
            ticketNumber: ticketNumber
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Simplified contact server running on http://localhost:${PORT}`);
});
