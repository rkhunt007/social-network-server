const nodemailer = require('nodemailer');
const service = process.env.service;
const email = process.env.email;
const pass = process.env.pass;

/**
 * Sends registration email
 * @param {Object} user - user object
 */
const sendRegistrationEmailMessage = (user = {}) => {
    const subject = `Welcome ${user.name}`;
    const htmlMessage = `<p>Hello ${user.name},</p> <p>Welcome! Thanks for creating an account with us.<p>Thank you.</p>`

    let transporter = nodemailer.createTransport({
        service: service,
        auth: {
            user: email,
            pass: pass
        }
    })

    const mailOptions = {
        from: email,
        to: user.email,
        subject: subject,
        html: htmlMessage
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            return console.log('Mail Sent Error', err);
        }
    })
}

module.exports = { sendRegistrationEmailMessage }
