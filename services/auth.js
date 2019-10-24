const jwt = require('jsonwebtoken');
const models = require('../models');
const bcrypt = require('bcryptjs');

var authService = {
    signUser: function (user) {
        const token = jwt.sign({
            Username: user.Username,
            UserId: user.UserId,
            Admin: user.Admin
        }, 'secretKey',
            {
                expiresIn: '1h'
            });
        return token
    },
    verifyUser: function (token) {
        try {
            let decoded = jwt.verify(token, 'secretKey');
            return models.users.findByPk(decoded.UserId);
        } catch (err) {
            console.log(err);
            return null;
        }
    },
    hashPassword: function (plaintextPassword) {
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(plaintextPassword, salt);
        return hash;
    },
    comparePasswords: function (plaintextPassword, hashPassword) {
        return bcrypt.compareSync(plaintextPassword, hashPassword)
    }
}

module.exports = authService;