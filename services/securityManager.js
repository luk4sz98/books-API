const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class SecurityManager {
    #saltRounds = 10;
    #size = 20;
    
    async hashString(string) {
        return await bcrypt.hash(string, this.#saltRounds);
    }

    createJwtToken(payload, isActivationToken = false) {
        const accessKey = isActivationToken ? this.#getActivationTokenKey() : this.#getTokenAccessKey();
        return jwt.sign(payload, accessKey, {
            expiresIn: 600
        });
    }

    verifyJwtToken(token, isActivationToken = false) {
        let result = null;
        const accessKey = isActivationToken ? this.#getActivationTokenKey() : this.#getTokenAccessKey();
        jwt.verify(token, accessKey, (err, payload) => {
            if (err) {
                return null;
            }
            result = payload
        });
        return result;
    }

    generateToken() {
        return crypto.randomBytes(this.#size).toString('hex');
    }

    async compareStringWithHash(string, hash) {
        return await bcrypt.compare(string, hash);
    }

    #getTokenAccessKey() {
        return process.env.ACCESS_TOKEN_SECRET;
    }

    #getRefreshTokenKey() {
        return process.env.REFRESH_TOKEN_SECRET;
    }

    #getActivationTokenKey() {
        return process.env.ACTIVATION_TOKEN_SECRET;
    }
}

module.exports = SecurityManager;