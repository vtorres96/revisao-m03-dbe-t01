const connection = require('../config/connection');
const securePassword = require('secure-password');

const pwd = securePassword();

const index = async (req, res) => {
    let { loggedUser } = req;

    if (!loggedUser){
        return res.status(401).json({ 'mensagem': 'Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    }

    try {
        return res.status(200).json(loggedUser);
    } catch (error) {
        return res.status(400).json({ 'mensagem': error.message });
    }
}

const create = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ 'mensagem': 'O campo nome é obrigatório.' });
    }

    if (!email) {
        return res.status(400).json({ 'mensagem': 'O campo email é obrigatório.' });
    }

    if (!senha) {
        return res.status(400).json({ 'mensagem': 'O campo senha é obrigatório.' });
    }

    try {
        const query = 'select * from usuarios where email = $1';
        const data = await connection.query(query, [email]);

        if (data.rowCount > 0) {
            return res.status(400).json({ 'mensagem': 'Este email já foi cadastrado.' });
        }
    } catch (error) {
        return res.status(400).json({ 'mensagem': error.message });
    }

    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const query = 'insert into usuarios (nome, email, senha) values ($1, $2, $3) RETURNING *';
        const data = await connection.query(query, [nome, email, hash]);
        
        if (data.rowCount === 0) {
            return res.status(400).json({ 'mensagem': 'Não foi possivel cadastrar o usuário' });
        }

        const user = data.rows[0];
        let { senha: password, ...userWithoutPassword } = user;

        return res.status(201).json(userWithoutPassword);
    } catch (error) {
        return res.status(400).json({ 'mensagem': error.message });
    }
}

const update = async (req, res) => {
    let { nome, email, senha } = req.body;
    let { loggedUser } = req;

    if (!nome || !email || !senha){
        return res.status(404).json({ 'mensagem': 'Nome, email ou senha não foram informados.' });
    }

    try {
        let data = await connection.query('select * from usuarios where email = $1',[email]);

        let user = data.rows[0];

        if (user && (user.id !== loggedUser.id)) {
            return res.status(403).json({ 'mensagem': 'O e-mail informado já está sendo utilizado.' });
        }

        let hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        data = await connection.query(
            'update usuarios set nome = $1, email = $2, senha = $3 where id = $4 RETURNING *',
            [nome, email, hash, loggedUser.id]
        );
    
        const updatedUser = data.rows[0];
        let { senha: password, ...userWithoutPassword } = updatedUser;

        return res.status(200).json(userWithoutPassword);
    } catch (error) {
        return res.status(400).json({ 'mensagem': error.message });
    }
}

module.exports = {
    index,
    create,
    update
};