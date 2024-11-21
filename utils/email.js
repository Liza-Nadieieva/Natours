const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // create transporter 
    const  transport = nodemailer.createTransport({
        host:  process.env.EMAIL_HOST,
        port:  process.env.EMAIL_PORT,
        auth: {
          user:  process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    // define the email options 
    const mailOptions = {
        from: 'Elizabeth <test1@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: 
    };
    // actually send the eamil 
   await  transport.sendMail(mailOptions)
};

module.exports = sendEmail;