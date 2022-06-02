const connection = require('../config/connection');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../secret');
const securePassword = require('secure-password');

const pwd = securePassword();

const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email) {
        return res.status(400).json({ 'mensagem': 'O campo email é obrigatório.' });
    }

    if (!senha) {
        return res.status(400).json({ 'mensagem': 'O campo senha é obrigatório.' });
    }

    try {
        const query = 'select * from usuarios where email = $1';
        const data = await connection.query(query, [email]);

        if (data.rowCount == 0) {
            return res.status(400).json({ 'mensagem': 'Email não encontrado.' });
        }

        let user = data.rows[0];

        const result = await pwd.verify(
            Buffer.from(senha),
            Buffer.from(user.senha, 'hex')
        );
        
        switch (result) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(400).json({ 'mensagem': 'Email ou senha incorretos.' });
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
                    const query = 'update usuarios set senha = $1 where email = $2';
                    await connection.query(query, [hash, email]);
                } catch {
                    return res.status(400).json({ 'mensagem': error.message });
                }
                break;
        }

        let { senha: password, ...userWithoutPassword } = user;

        const token = jwt.sign(
            {
                id: user.id,
                nome: user.nome,
                email: user.email
            },
            jwtSecret,
            {
                expiresIn: '2h'
            }
        );

        return res.status(200).json({
            user: userWithoutPassword,
            token: token
        });
    } catch (error) {
        return res.status(400).json({ 'mensagem': error.message });
    }
}

module.exports = {
    login
};