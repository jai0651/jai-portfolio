import nodemailer from 'nodemailer'

const email= process.env.EMAIL;
const pass= process.env.PASS;

export const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service's SMTP host
    auth: {
      user:email , // Your email address
      pass, // Your email password or app-specific password
    },
  });

  // Email content
  export const mailOptions = {
    from: email, // Sender's email address
    to: email // Receiver's email addres,
  };

  // Send the email
  await transporter.sendMail(mailOptions);