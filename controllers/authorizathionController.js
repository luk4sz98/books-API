const UserModel = require('../models/user');
const jwt = require('jsonwebtoken');
const EmailSender = require('../services/emailSender');
const AccountStatus = require('../models/accountStatus');
const SecurityManager = require('../services/securityManager');

class AuthController {
    #invalidDataMsg = 'Nieprawidłowy email lub hasło.';
    #emailSender;
    #securityManager;

    constructor() {
        this.#emailSender = new EmailSender()
        this.#securityManager = new SecurityManager()
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await UserModel.findOne({ email: email });
            const passwordMatch = await this.#securityManager
                .compareStringWithHash(password, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ message: this.#invalidDataMsg });
            }
    
            // Generowanie tokena JWT
            const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '4h' });
            const result = await UserModel.updateOne({ _id: user._id }, { $set: { jwtToken: token } });

            if (result.modifiedCount == 1) {
                res.cookie('token', token, { httpOnly: true, maxAge: 4 * 60 * 60 * 1000 })
                   .status(200)
                   .json({ token: token }); 
            } else {
                throw new Error('Wystąpił błąd')
            }
        } catch (error) {
            next(error)
        }
    }

    async registration(req, res, next) {
        try {
            const { firstName, lastName, email, password } = req.body;
            const userExist = await UserModel.findOne({ email: email });
            if (userExist) {
                return res.status(400).json({ message: this.#invalidDataMsg})
            }

            const newUser = await this.#createUser(firstName, lastName, email, password);
            const result = await this.#emailSender
                .sendActivationEmail(newUser.email, newUser.activationToken);

            if (result) {
                await newUser.save();
                res.status(200)
                   .json({ message: 'Użytkownik został pomyślnie zarejestrowany. Link aktywacyjny został przesłany na konto' });
            } else {
                res.status(500).json({ message: 'Wystąpił błąd podczas wysyłania wiadomości e-mail. Konto nie zostało utworzone' });
            }
        } catch (error) {
            next(error)
        }
    }

    async activate(req, res) {
        const token = req.params.token;
        const user = await UserModel.findOne({ activationToken: token });
        if (user) {
            if (user.status == AccountStatus.ACTIVE) {
                return res.status(400).json({ message: 'Konto już zostało aktywowane.' });
            }
            user.status = AccountStatus.ACTIVE;
            await user.save();
            res.status(200).
                json({ message: 'Konto aktywowane pomyślnie.' });
        } else {
            res.status(404).
                send({ message: 'Nieprawidłowy token aktywacyjny.' });
        }
    }


    async resetPassword(req, res, next) {
        try {
            const email = req.body.email;
            const user = await UserModel.findOne({ email: email });

            if (!user) {
                return res.status(400).json({ message: 'Nieprawidłowy adres email.' });
            }

            const token = this.#securityManager.generateToken();
            const result = await this.#emailSender.sendPasswordResetEmail(email, token);

            if (result) {
                res.cookie('pwdReset', token, { httpOnly: true, maxAge: 30 * 60 * 1000}) // 30min
                   .status(200)
                   .json({ message: 'Rozpoczęto proces resetowania hasła. '})
            } else {
                res.status(500).json({ message: 'Wystąpił błąd podczas wysyłania wiadomości e-mail. Konto nie zostało utworzone' });
            }
        } catch (error) {
            next(error);
        }
    }

    async setNewPassword(req, res, next) {
        try {
            const token = req.cookies.pwdReset;
            if (!token || token.length == 0) {
                return res.status(401).json({ message: 'Token wygasł.' });
            }

            const email = req.body.email;
            const newPassword = req.body.newPassword;
            const user = await UserModel.findOne({ email: email });
            if (!user) {
                return res.status(400).json({ message: 'Nieprawidłowy adres email' })
            }

            const passwordMatch = await this.#securityManager.compareStringWithHash(newPassword, user.password);
            if (passwordMatch) {
                return res.status(400).json({ message: 'Te same hasła' })
            }

            user.password = await this.#securityManager.hashString(newPassword);
            await user.save();

            return res.clearCookie('token')
                .status(200)
                .json({ message: 'Zaaktualizowano hasła' });
        } catch (error) {
            next(error)
        }
    }

    async #createUser(firstName, lastName, email, password) {
        const hashedPassword = await this.#securityManager.hashString(password);
        const activationToken = this.#securityManager.generateToken();

        return new UserModel({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            activationToken: activationToken
        })
    }
}


module.exports = AuthController