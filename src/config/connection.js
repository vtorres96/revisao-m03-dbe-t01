const { Pool } = require('pg');

const pool = new Pool({
    user: 'wntenayefznoce',
    host: 'ec2-18-204-142-254.compute-1.amazonaws.com',
    database: 'd2v7m3caj5hvnd',
    password: '517ef3a2428bf4075fb3b3b5c185b9a6e578d5e6c0ac0a342eeaaf37b0a603b8',
    port: 5432
});

const query = (text, param) => {
    return pool.query(text, param);
}

module.exports = {
    query
}