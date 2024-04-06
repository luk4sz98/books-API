const nodemailer = require('nodemailer');
const validator = require('email-validator');

class EmailSender {
    #mailTransporter;
    #baseUri;

    constructor() {
        this.#mailTransporter = nodemailer.createTransport(
            {
                service: 'gmail',
                auth: {
                    user: 'lwserwisyweb@gmail.com',
                    pass: 'oobn qkdq frja xiej'
                }
            }
        );

        this.#baseUri = 'http://localhost:3000/api/auth/';
    }

    async sendActivationEmail(email, activationToken) {
        const isValid = validator.validate(email);
        if (!isValid) {
          return false;
        } 

        const activationLink = this.#baseUri.concat(`activate/${activationToken}`)
        const msg = this.#buildActivationMsg(email, activationLink);
        
        let result = true
        this.#mailTransporter.sendMail(msg, (err) => {
            if (err) {
                result = false;
            }
        });
        return result;
    }

    async sendPasswordResetEmail(email, passwordResetToken) {
        const isValid = validator.validate(email);
        if (!isValid) {
          return false;
        } 
        const passwordResetLink = this.#baseUri.concat(`password/reset/change`);
        const msg = this.#buildResetMsg(email, passwordResetLink)

        await this.#mailTransporter.sendMail(msg)
        return true;
    }

    async sendEmailToUsers(message, subject, emails) {
        const splittedEmails = emails.split(',');
        for (const email of splittedEmails) {
            const isValid = validator.validate(email)
            if (!isValid) {
                return false;
            }
        }
        const msg = this.#buildMsg(emails, subject, message)
        await this.#mailTransporter.sendMail(msg)
        return true;
    }

    #buildActivationMsg(email, activationLink) {
        const htmlText = `
            <p>Naciśnij poniższy link, aby aktywować konto w serwisie:</p>
            <p><a href="${activationLink}">${activationLink}</a></p>
        `
        const subject = 'Aktywacja konta'

        return this.#buildMsg(email, subject, htmlText);
    }

    #buildResetMsg(email, pwdResetLink) {
        const htmlText = `
            <p>Naciśnij poniższy link, aby przejść do resetowania hasła:</p>
            <p><a href="${pwdResetLink}">${pwdResetLink}</a></p>
        `
        const subject = 'Resetowanie hasła'

        return this.#buildMsg(email, subject, htmlText)
    }

    #buildMsg(email, subject, htmlText) {
        return {
            to: email,
            from: 'lwserwisyweb@gmail.com',
            subject: subject,
            html: htmlText
        }
    }
}

module.exports = EmailSender