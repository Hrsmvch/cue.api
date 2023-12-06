
const express = require('express')
const { checkAuth } = require('../middleware/checkAuth.js');
const router = express.Router()
const notesController = require('../controllers/notes') 

router.use(checkAuth)

router.get('/', notesController.getAll); 
router.get('/last', notesController.getLast); 
router.get('/:id', notesController.getOne); 
router.post('/', notesController.create); 
router.put('/:id', notesController.update); 
router.delete('/:id', notesController.remove); 

module.exports = router;