const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ message: 'Brak tokenu.' });
    }

    const token = authHeader.split(' ')[1] // Beaer jwt_token

    if (!token) {
        return res.status(400).json({ message: 'Nieprawidłowy format.' });
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    })
}

const checkToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token || token.length == 0) {
            return next(); // brak tokenu, przechodzi do logowania
        }
        
        const decodedToken = jwt.decode(token, 'secretKey');
        const email = req.body.email;
        const user = await UserModel.findOne({ email: email });
        if (user.id !== decodedToken.userId) {
            return res.status(400).json({ message: 'Nieprawidłowe dane.'})
        }

        if (user.jwtToken !== token) {
            return next() ;
        }

        const expirationDate = new Date(decodedToken.exp * 1000);
        const now = new Date();
        return now > expirationDate 
            ? next()
            : res.status(200).json({ token: token });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authenticateToken,
    checkToken
}