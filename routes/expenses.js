
const router = require('express').Router();
const expensesController = require('../controllers/expenses.js') 
const { checkAuth } = require('../middleware/checkAuth.js');

router.use(checkAuth)

router.get('/last', expensesController.getLast);
router.get('/last-week', expensesController.lastWeek)  
router.get('/:year/:id', expensesController.getByCatOfYear) 
router.get('/', expensesController.getByCats);   
router.post('/', expensesController.create);  
router.put('/:id', expensesController.update); 
router.delete('/:id', expensesController.remove); 

module.exports = router;