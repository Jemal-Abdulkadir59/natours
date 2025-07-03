/*eslint-disable*/
const nodemailer = require('nodemailer');
const pug = require('pug');
const {htmlToText} = require('html-to-text');

module.exports = class Email {

    constructor(user, url){
      this.to = user.email;
      this.firstName = user.name.split(' ')[0];
      this.url = url;
      this.from = `Jemal Abadulkadir<${process.env.EMAIL_FROM}>`;
    }

  newTransport(){
    if(process.env.NODE_ENV ===  'production'){
      // Sendgrid - to send email to real address
      return nodemailer.createTransport({
        host: 'smtp.mailersend.net',
        port: 587, // or 465 for secure SMTP
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'MS_fe2MBD@trial-pq3enl61x08g2vwr.mlsender.net', // Your MailerSend SMTP username
          pass: 'e5AvcwHl3AUBQkWt', // Your MailerSend SMTP password
        },
      })
    }

    // 1 Create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  // send the actual email
  async send(template, subject){
    // 1) render HTML based on a pug template
      //pug.renderFile take file and render pug code into real html
      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject
      });

    // 2) Define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
      //convert html to text use package -> npm i html-to-text
    };

    //Create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  
  async sendWelcome(){
   await this.send('welcome', 'welcome to the Natours') 
  }

  async sendPasswordReset(){
    await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)')
  }
}







// OLD CODE
// const sendEmail = async options => {
//   // 1 Create a transporter
//   // const transporter = nodemailer.createTransport({
//   //   // service:'Gmail',
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD
//   //   }
//   //   // activate in gmail "less secure app " option
//   // });
//   // 2 Define the email option
//   const mailOptions = {
//     from: 'jemil abdulkadir <hello@jemil.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//     // html:
//   };
//   // 3 Actully send email
//   await transporter.sendMail(mailOptions);
// };

// // safe email testing "mailtrap.io"

// // module.exports = sendEmail;
