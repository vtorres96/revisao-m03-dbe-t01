const connection = require('../config/connection');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../secret');

const validateToken = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization){
        res.status(401).json({ 'mensagem': 'O usuário deve estar logado' });
    }

    try {
        let token = authorization.replace('Bearer ', "").trim();
        let user = jwt.verify(token, jwtSecret);
        
        let { rows } = await connection.query('select * from usuarios where id = $1',[user.id]);
        user = rows[0];
        
        if (user.length === 0){
            return res.status(404).json({ 'mensagem': 'Usuario não encontrado' });
        }

        let { senha: password, ...userWithoutPassword } = user;
        req.loggedUser = userWithoutPassword;

        next();
    } catch (error) {
        return res.status(400).json({ 'mensagem': error.message });
    }
}

module.exports = {
    validateToken
}