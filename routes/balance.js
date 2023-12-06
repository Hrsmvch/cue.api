
const router = require('express').Router(); 
const financeController = require('../controllers/finances.js') 
const { checkAuth } = require('../middleware/checkAuth.js');

router.use(checkAuth)

router.get('/', financeController.getBalance);
router.get('/current', financeController.getBalanceByMonth);
router.post('/update', financeController.updateBalance);   
router.put('/major-currency', financeController.setMajorCurrency);   

module.exports = router;