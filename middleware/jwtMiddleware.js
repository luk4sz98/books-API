const jwt = require('jsonwebtoken');

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

module.exports = {
    authenticateToken
}