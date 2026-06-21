const express = require('express');
const router = express.Router();
const vulnsCtrl = require('../controllers/vulnerabilitesController');

router.get('/', vulnsCtrl.listerToutesVulnerabilites);
router.post('/', vulnsCtrl.ajouterVulnerabilite);

module.exports = router;