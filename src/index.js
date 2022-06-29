const express = require('express');

const usersRoutes = require('./routes/users');
const authenticationRoutes = require('./routes/authentication');

const app = express();

app.use(express.json());
app.use('/usuario', usersRoutes);
app.use('/login', authenticationRoutes);

app.listen(process.env.PORT);