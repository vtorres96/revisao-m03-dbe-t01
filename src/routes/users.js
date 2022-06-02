const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { validateToken } = require('../middlewares/validateToken');

router.post('/', userController.create);

router.use(validateToken);

router.put('/', userController.update);

router.get('/', userController.index);

module.exports = router;