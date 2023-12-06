const express = require('express')
const { checkAuth } = require('../middleware/checkAuth.js');
const router = express.Router()
const usersController = require('../controllers/users') 

router.route('/me').post(usersController.getUser)

router.get('/', usersController.getAllUsers);   
router.post('/', usersController.createUser); 
router.put('/', checkAuth, usersController.updateUser); 
router.delete('/', checkAuth, usersController.removeUser); 


module.exports = router