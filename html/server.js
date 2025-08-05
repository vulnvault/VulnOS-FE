// server.js
// Handles contact form submissions using credentials from environment variables.

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
// The server will run on the port defined in the ecosystem file, defaulting to 3001
const PORT = process.env.PORT || 3001;

// --- Nodemailer Transporter Setup ---
// It reads credentials directly from environment variables provided by PM2.
// Make sure M365_USER_EMAIL and M365_APP_PASSWORD are set in your ecosystem file.
const mailer = nodemailer.createTransport({
    host: "smtp.office365.com", // Microsoft 365 SMTP server
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.M365_USER_EMAIL, // Your M365 email from config
        pass: process.env.M365_APP_PASSWORD  // Your M365 App Password from config
    }
});

// Middleware
app.use(cors()); 
app.use(bodyParser.json());

app.post('/submit-contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required. Please fill out the entire form.' });
    }

    console.log(`[Contact Server] Received submission from: ${name} <${email}>`);

    // --- Email to You (the Site Owner) ---
    const mailToOwner = {
        from: `"${name}" <${process.env.M365_USER_EMAIL}>`, // Use your verified email as the sender
        replyTo: email, // Set the user's email as the reply-to address
        to: "contact@vulnos.tech", // Send the notification to yourself
        subject: `New Contact Form Submission: ${subject}`,
        html: `
            <p>You have a new contact form submission from your website.</p>
            <h3>Contact Details</h3>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email (Reply-To):</strong> ${email}</li>
                <li><strong>Subject:</strong> ${subject}</li>
            </ul>
            <h3>Message</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `
    };

    // --- Confirmation Email to the User ---
    const mailToUser = {
        from: `"VulnOS Support" <${process.env.M365_USER_EMAIL}>`,
        to: email,
        subject: 'We\'ve Received Your Message!',
        html: `
            <p>Hello ${name},</p>
            <p>Thank you for contacting us! We have successfully received your message and will get back to you as soon as possible.</p>
            <p><strong>Here's a copy of your submission:</strong></p>
            <blockquote>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${message.replace(/\n/g, '<br>')}</p>
            </blockquote>
            <p>Best regards,<br>The VulnOS Team</p>
        `
    };

    try {
        console.log('[Contact Server] Sending notification email to owner...');
        await mailer.sendMail(mailToOwner);
        console.log('[Contact Server] Sending confirmation email to user...');
        await mailer.sendMail(mailToUser);

        const ticketNumber = Math.floor(10000 + Math.random() * 90000);
        res.status(200).json({ 
            message: 'Your message has been sent successfully!',
            ticketNumber: ticketNumber 
        });

    } catch (error) {
        console.error('[Contact Server] Error sending email:', error);
        res.status(500).json({ message: 'There was an error processing your request. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Contact form server is running on http://localhost:${PORT}`);
});
