const AccountStatus = require('../models/accountStatus');
const UserModel = require('../models/user');
const UserRole = require('../models/userRole');

const checkStatus = async (req, res, next) => {
    try {
        const email = req.body.email;
        const user = await UserModel.findOne({ email: email });
    
        if (!user) {
            return res.status(400).json({ message: 'Nieprawidłowy adresz email lub hasło.' });
        }

        if (user.status == AccountStatus.INACTIVE) {
            return res.status(401).json({ message: 'Konto nie zostało potwierdzone.'});
        }

        next();
    } catch (error) {
        return next(error)
    }
}

const isAdminRole = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.role === UserRole.STANDARD) {
            return res.sendStatus(403);
        }
        next();
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    checkStatus,
    isAdminRole
};