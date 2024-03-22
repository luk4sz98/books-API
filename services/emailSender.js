const nodemailer = require('nodemailer');

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
        const activationLink = this.#baseUri.concat(`activate/${activationToken}`)
        const msg = this.#buildActivationMsg(email, activationLink);
        
        await this.#mailTransporter.sendMail(msg);
        return true;
    }

    async sendPasswordResetEmail(email, passwordResetToken) {
        const passwordResetLink = this.#baseUri.concat(`password/reset/${passwordResetToken}`);
        const msg = this.#buildResetMsg(email, passwordResetLink)

        await this.#mailTransporter.sendMail(msg)
        return true;
    }

    #buildActivationMsg(email, activationLink) {
        const htmlText = `
            <p>Naciśnij poniższy link, aby aktywować konto w serwisie:</p>
            <p><a href="${activationLink}">${activationLink}</a></p>
        `
        const subject = 'Aktywacja konta'

        return this.#buildMsg(email, subject, activationLink, htmlText);
    }

    #buildResetMsg(email, pwdResetLink) {
        const htmlText = `
            <p>Naciśnij poniższy link, aby przejść do resetowania hasła:</p>
            <p><a href="${pwdResetLink}">${pwdResetLink}</a></p>
        `
        const subject = 'Resetowanie hasła'

        return this.#buildMsg(email, subject, pwdResetLink, htmlText)
    }

    #buildMsg(email, subject, link, htmlText) {
        return {
            to: email,
            from: 'lwserwisyweb@gmail.com',
            subject: subject,
            html: htmlText
        }
    }
}

module.exports = EmailSender