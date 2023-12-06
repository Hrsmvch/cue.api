
const router = require('express').Router();
const { create, update, getAll, getOne, remove } = require('../controllers/notesCategories.js');
const { checkAuth } = require('../middleware/checkAuth.js');

router.get('/', checkAuth, getAll); 
router.get('/:id', checkAuth, getOne); 
router.post('/', checkAuth, create); 
router.put('/:id', checkAuth, update); 
router.delete('/:id', checkAuth, remove); 

module.exports = router;