const express = require('express');
const router = express.Router();
const entrepriseCtrl = require('../controllers/entrepriseController');

router.get('/', entrepriseCtrl.obtenirEntreprise);
router.put('/', entrepriseCtrl.modifierEntreprise);

module.exports = router;