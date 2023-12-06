
const router = require('express').Router();
const { create, update, getAll, remove } = require('../controllers/expensesCategories.js');
const { checkAuth } = require('../middleware/checkAuth.js');

router.use(checkAuth)

router.get('/', getAll); 
router.post('/', create); 
router.put('/', update); 
router.delete('/:id', remove); 

module.exports = router;