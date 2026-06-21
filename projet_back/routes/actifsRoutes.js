const express = require('express');
const router = express.Router();
const actifsCtrl = require('../controllers/actifsController');

router.get('/', actifsCtrl.listerActifs);
router.post('/', actifsCtrl.ajouterActif);
router.put('/:id', actifsCtrl.modifierActif);
router.delete('/:id', actifsCtrl.supprimerActif);

module.exports = router;