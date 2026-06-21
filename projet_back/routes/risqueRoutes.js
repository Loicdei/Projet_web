const express = require('express');
const router = express.Router();
const risqueCtrl = require('../controllers/risqueController');

const actifsCtrl = require('../controllers/actifsController'); 
router.get('/vulnerabilities', actifsCtrl.listerToutesVulnerabilites);
router.post('/vulnerabilities', actifsCtrl.ajouterVulnerabilite);

router.post('/calculate', risqueCtrl.calculerRisque);

module.exports = router;