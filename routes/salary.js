
const router = require('express').Router();
const salaryController = require('../controllers/salary.js') 
const { checkAuth } = require('../middleware/checkAuth.js');

router.use(checkAuth)
router.post('/', salaryController.addSalary);

module.exports = router;