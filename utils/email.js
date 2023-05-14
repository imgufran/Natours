const pug = require("pug");
const nodemailer = require("nodemailer");
const {convert} = require("html-to-text");

//* We're declaring and exporting this class
module.exports = class Email {
  // Constructor is the first function that is called when we create new objects.
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Jonas Steven <${process.env.EMAIL_FROM}>`;
  }

  //* a "Transporter" is an abstraction layer that handles the process of sending email messages from one email server to another. It is like a virtual airplane that flies your email message from your computer to the recipient's computer.
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Send grid
      return nodemailer.createTransport({
        host: "smtp-relay.sendinblue.com",
        port: 587,
        auth: {
          user: "mdgufran258@gmail.com",
          pass: "gwfEmt0SHIFavAPn"
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    // Send the actual email
    // 1.) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2.) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, {
        wordwrap: false,
      })
    }

    // 3.) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours family");
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Your password reset token (Valid for only 10 minutes");
  }
}
















