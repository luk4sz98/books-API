const jwt = require('jsonwebtoken');
const SecurityManager = require('../services/securityManager');

const authenticateToken = (req, res, next) => {
    const token = getToken(req.headers.authorization);
    if (!token) {
        return res.status(400).json({ message: 'Nieprawidłowy format.' });
    }
    
    let securityManager = new SecurityManager();
    const payload = securityManager.verifyAccessToken(token);
    if (!payload) {
        return res.sendStatus(403);
    }
    req.user = payload;
    next();
}

const checkPwdResetToken = (req, res, next) => {
    const token = getToken(req.headers.authorization);
    if (!token) {
        return res.status(400).json({ message: 'Nieprawidłowy format.' });
    }

    let securityManager = new SecurityManager();
    const payload = securityManager.verifyPasswordResetToken(token);
    if (!payload) {
        return res.sendStatus(403);
    }
    req.payload = payload;
    next();
}

const getToken = (authHeader) => {
    if (!authHeader) {
        return null;
    }

    const token = authHeader.split(' ')[1] // Beaer jwt_token
    if (!token) {
        return null;
    }

    return token;
}

module.exports = {
    authenticateToken,
    checkPwdResetToken
}