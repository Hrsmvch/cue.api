const express = require('express')
const { checkAuth } = require('../middleware/checkAuth.js');
const router = express.Router()
const eventsController = require('../controllers/events') 

router.use(checkAuth)
 
router.get('/upcoming', eventsController.getUpcoming); 
router.get('/', eventsController.getAll); 
router.get('/:id', eventsController.getOne); 
router.post('/',  eventsController.create); 
router.put('/:id', eventsController.update); 
router.delete('/:id', eventsController.remove); 

module.exports = router;