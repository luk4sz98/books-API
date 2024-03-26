const UserModel = require('../models/user');
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
    
            const userDto = user.toDto();
            const token = this.#securityManager.createAccessToken(userDto);
            const refreshToken = this.#securityManager.createRefreshToken(userDto);
            user.refreshToken = refreshToken;
            await user.save();
            
            res.status(200).json({ accessToken: token, refreshToken: refreshToken});
        } catch (error) {
            next(error)
        }
    }

    async logout(req, res, next) {
        try {
            const refreshToken = req.body.refreshToken;
            const payload = this.#securityManager.verifyRefreshToken(refreshToken);
            if (!payload) {
                return res.status(400).json({ message: 'Nieprawidłowy token.' });
            }
            const user = await UserModel.findOne({ email: payload.email, refreshToken: refreshToken});
            if (!user) {
                return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
            }
            user.refreshToken = null;
            await user.save();

            return res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    async registration(req, res, next) {
        try {
            const { firstName, lastName, email, password } = req.body;
            const userExist = await UserModel.findOne({ email: email });
            if (userExist) {
                return res.status(400).json({ message: this.#invalidDataMsg})
            }

            const newUser = await this.#createUser(firstName, lastName, email, password)
            const activationToken = this.#securityManager.createActivationToken({ email: newUser.email });
            const result = await this.#emailSender
                .sendActivationEmail(newUser.email, activationToken);

            if (result) {
                await newUser.save();
                res.status(200)
                   .json({ activationToken: activationToken });
            } else {
                res.status(500).json({ message: 'Wystąpił błąd podczas wysyłania wiadomości e-mail. Konto nie zostało utworzone' });
            }
        } catch (error) {
            next(error)
        }
    }

    async activate(req, res) {
        const token = req.params.token;
        const payload = this.#securityManager.verifyActivationToken(token, true);
        if (!payload) {
            return res.status(400).json({ message: 'Nieprawidłowy token aktywacyjny' });
        }
        const user = await UserModel.findOne({ email: payload.email });
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

    async reactivate(req, res, next) {
        try {
            const email = req.body.email;
            const user = await UserModel.findOne({ email: email, status: AccountStatus.INACTIVE});
            if (!user) {
                return res.status(404).json({ message: 'Nieprawidłowy adres email lub konto zostało już aktywowane.'});
            }

            const activationToken = this.#securityManager.createActivationToken({ email: user.email }, true);
            const result = await this.#emailSender
                .sendActivationEmail(user.email, activationToken);
            if (result) {
                res.status(200).json({ activationToken: activationToken });
            } else {
                res.status(500).json({ message: 'Wystąpił błąd podczas wysyłania wiadomości e-mail. Konto nie zostało utworzone' });
            }
        } catch (error) {
            next(error);
        }
    }


    async resetPassword(req, res, next) {
        try {
            const email = req.body.email;
            const user = await UserModel.findOne({ email: email });

            if (!user) {
                return res.status(404).json({ message: 'Nieprawidłowy adres email.' });
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

    async refreshToken(req, res, next) {
        try {
            const token = req.body.refreshToken;
            const payload = this.#securityManager.verifyRefreshToken(token);
            if (!payload) {
                return res.status(403).json({ message: 'Token wygasł lub jest nieprawidłowy.' });
            }
            
            const user = await UserModel.findOne({ email: payload.email });
            if (!user) {
                return res.status(404).json({ message: 'Nieprawidłowy adres email.' });
            }

            if (token !== user.refreshToken) {
                return res.sendStatus(403);
            }

            const accessToken = this.#securityManager.createAccessToken(user.toDto());
            res.status(200).json({ accessToken: accessToken});
        } catch (error) {
            next(error);
        }
    }

    async #createUser(firstName, lastName, email, password) {
        const hashedPassword = await this.#securityManager.hashString(password);

        return new UserModel({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
        })
    }
}


module.exports = AuthController