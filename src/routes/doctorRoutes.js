const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.post('/', doctorController.create);
router.get('/', doctorController.getAll);
router.get('/:id', doctorController.getOne);
router.put('/:id', doctorController.update);
router.delete('/:id', doctorController.deleteOne);

module.exports = router;