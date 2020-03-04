const nodemailer = require('nodemailer');

const sendEmail = async options => {
// 1. Transport
var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

// 2. Email options
const emailOptions = {
    from: 'Phonico admin team <phonico.admin.team@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
};

// 3. Sending
await transport.sendMail(emailOptions)
};

module.exports = sendEmail