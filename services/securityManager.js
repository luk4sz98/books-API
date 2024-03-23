const crypto = require('crypto');
const bcrypt = require('bcrypt');

class SecurityManager {
    #saltRounds = 10;
    #size = 20;
    
    async hashString(string) {
        return await bcrypt.hash(string, this.#saltRounds);
    }

    generateToken() {
        return crypto.randomBytes(this.#size).toString('hex');
    }

    async compareStringWithHash(string, hash) {
        return await bcrypt.compare(string, hash);
    }

    getTokenAccessKey() {
        return process.env.ACCESS_TOKEN_SECRET;
    }

    getRefreshTokenKey() {
        return process.env.REFRESH_TOKEN_SECRET;
    }
}

module.exports = SecurityManager;