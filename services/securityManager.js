const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TokenType = require('../helpers/tokenType');

class SecurityManager {
    #saltRounds = 10;
    #size = 20;
    
    async hashString(string) {
        return await bcrypt.hash(string, this.#saltRounds);
    }

    createAccessToken(payload) {
        return this.#createJwtToken(payload, this.#getTokenSecretKey(TokenType.ACCESS))
    }

    createActivationToken(payload) {
        return this.#createJwtToken(payload, this.#getTokenSecretKey(TokenType.ACTIVATION))
    }

    createRefreshToken(payload) {
        return this.#createJwtToken(payload, this.#getTokenSecretKey(TokenType.REFRESH), '30d')
    }

    verifyAccessToken(token) {
        return this.#verifyJwtToken(token, this.#getTokenSecretKey(TokenType.ACCESS));
    }

    verifyActivationToken(token) {
        return this.#verifyJwtToken(token, this.#getTokenSecretKey(TokenType.ACTIVATION));
    }

    verifyRefreshToken(token) {
        return this.#verifyJwtToken(token, this.#getTokenSecretKey(TokenType.REFRESH));
    }

    generateToken() {
        return crypto.randomBytes(this.#size).toString('hex');
    }

    async compareStringWithHash(string, hash) {
        return await bcrypt.compare(string, hash);
    }

    generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters.charAt(randomIndex);
        }
        return randomString;
    }

    #createJwtToken(payload, secretKey, expiresIn = null) {
        return jwt.sign(payload, secretKey, {
            expiresIn: expiresIn == null ? '10m' : expiresIn
        });
    }

    #verifyJwtToken(token, secretKey) {
        let result = null;
        jwt.verify(token, secretKey, (err, payload) => {
            if (err) {
                return null;
            }
            result = payload
        });
        return result;
    }

    #getTokenSecretKey(tokenType) {
        switch (tokenType) {
            case TokenType.ACCESS:
                return process.env.ACCESS_TOKEN_SECRET;
            case TokenType.ACTIVATION:
                return process.env.ACTIVATION_TOKEN_SECRET;
            case TokenType.REFRESH:
                return process.env.REFRESH_TOKEN_SECRET;
            default:
                throw new Error("Nieobsługiwany typ tokenu.");
        }
    }
}

module.exports = SecurityManager;