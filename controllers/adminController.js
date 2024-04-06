const UserModel = require('../models/user');
const mongoose = require('mongoose');
const SecurityManager = require('../services/securityManager');
const EmailSender = require('../services/emailSender');

class AdminController {
    #securityManager;
    #emailSender;

    constructor() {
        this.#securityManager = new SecurityManager()
        this.#emailSender = new EmailSender();
    }

    async getUsers(req, res, next) {
        try {
            const user = req.user;
            const users = await UserModel.find({ email: { $ne: user.email } });
            return res.status(200).json(users.map(x => x.toDto()));
        } catch (error) {
            next(error)
        }
    }

    async deleteUser(req, res, next) {
        try {
            const id = req.params.id;
            if (mongoose.Types.ObjectId.isValid(id)) {
                const result = await UserModel.deleteOne({ _id: id });
                if (result.deletedCount === 1) {
                    return res.sendStatus(204);
                } 
                return res.status(404).json({ message: "Nie można znaleźć użytkownika o podanym identyfikatorze." });
            } else {
                return res.status(400).json({ message: "Niepoprawne id" })
            }
        } catch (error) {
            next(error);
        }
    }

    async changeUserRole(req, res, next) {
        try {
            const id = req.params.id;
            const userRole = req.body.userRole;
            if (!userRole) {
                return res.status(404).json({ message: 'Brak podanej roli użytkownika.' });
            }

            if (isNaN(userRole) || (userRole != 1 && userRole != 0)) {
                return res.status(404).json({ message: 'Rola musi być liczbą całkowitą z przedziału 0-1' });
            }

            if (mongoose.Types.ObjectId.isValid(id)) {
                const result = await UserModel.updateOne({ _id: id }, { $set: { role: userRole } });
                if (result.modifiedCount === 1) {
                    return res.sendStatus(204); 
                }
                if (result.matchedCount === 1) {
                    return res.status(200).json({ message: 'Dany user już ma te rolę.' });
                }
                return res.status(404).json({ message: "Nie można znaleźć użytkownika o podanym identyfikatorze." });
            } else {
                return res.status(400).json({ message: "Niepoprawne id" })
            }
        } catch (error) {
            next(error)
        }
    }

    async createUser(req, res, next) {
        try {
            const { firstName, lastName, email } = req.body;
            const userExist = await UserModel.findOne({ email: email });
            if (userExist) {
                return res.status(400).json({ message: 'Istnieje konto z podanym mailem.' });
            }

            const tempPassword = this.#securityManager.generateRandomString(8); // tymczasowe hasło
            const hashedTempPassword = await this.#securityManager.hashString(tempPassword);

            const user = UserModel.createUser(firstName, lastName, email, hashedTempPassword);
            const activationToken = this.#securityManager.createActivationToken({ email: user.email });
            const additionalMsg = `Twoje tymczasowe hasło to ${tempPassword} Zmień je zaraz po zalogowaniu.`;
            const result = await this.#emailSender.sendActivationEmail(user.email, activationToken, additionalMsg);
            if (result) {
                await user.save();
                res.status(200).json({ activationToken: activationToken });
            } else {
                res.status(500).json({ message: 'Wystąpił błąd podczas wysyłania wiadomości e-mail. Konto nie zostało utworzone' });
            }
        } catch (error) {
            next(error)
        }
    }

    async sendEmailToUsers(req, res, next) {
        try {
            const emails = req.body.emails;
            for (const email of emails.split(',')) {
                const user = await UserModel.findOne({ email: email })
                if (!user) {
                    return res.status(400).json({ message: `Nie istnieje user o podanym adresie email: ${email}` });
                }
            }
            const msg = req.body.msg;
            const subject = req.body.subject;
            if (!emails || !msg || !subject) {
                return res.status(400).json({ message: 'Brak danych' });
            }
            const result = await this.#emailSender.sendEmailToUsers(msg, subject, emails)
            return result 
                ? res.sendStatus(204)
                : res.status(400).json({ message: 'Wystąpił błąd, sprawdź czy adresy email są prawidłowe' })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = AdminController