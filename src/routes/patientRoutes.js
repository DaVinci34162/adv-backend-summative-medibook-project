const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/', patientController.create);
router.get('/', patientController.getAll);
router.get('/:id', patientController.getOne);
router.put('/:id', patientController.update);
router.delete('/:id', patientController.deleteOne);

module.exports = router;