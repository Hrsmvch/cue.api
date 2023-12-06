
const router = require('express').Router();
const exchangesController = require('../controllers/exchanges.js') 
const { checkAuth } = require('../middleware/checkAuth.js');

router.use(checkAuth)
router.post('/', exchangesController.createExchanges);
   
module.exports = router;