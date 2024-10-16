const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "moustafaashraf20@gmail.com",
    to: email,
    subject: subject,
    html:html ,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail ;  