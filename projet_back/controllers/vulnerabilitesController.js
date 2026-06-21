const database = require('../config/database');

exports.listerToutesVulnerabilites = async (req, res) => {
    try {
        const [vulns] = await database.query('SELECT * FROM vulnerabilites');
        res.json(vulns);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
};

exports.ajouterVulnerabilite = async (req, res) => {
    const { actifId, nomVulnerabilite, criticite } = req.body;
    if (!actifId || !nomVulnerabilite || !criticite) return res.status(400).json({ erreur: "Tous les champs sont requis." });

    try {
        const [resultat] = await database.query(
            'INSERT INTO vulnerabilites (actif_id, nom_vulnerabilite, criticite) VALUES (?, ?, ?)',
            [actifId, nomVulnerabilite, criticite]
        );
        res.status(201).json({ id: resultat.insertId, actifId, nomVulnerabilite, criticite });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
};