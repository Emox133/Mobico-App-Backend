const nodemailer = require('nodemailer');
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email,
    this.from = `<${process.env.EMAIL_FROM}>`,
    this.firstName = user.firstName
    this.url = url
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
      }
    })
  }

  async send(template, subject) {
      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject
      })

      const emailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.fromString(html)
    };

    await this.newTransport().sendMail(emailOptions)
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Mobico Team!')
  } 

  async sendPasswordReset() {
    await this.send('passwordReset', 'Password reset token(valid for only 10 minutes)')
  }
}

