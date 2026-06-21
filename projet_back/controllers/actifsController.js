const database = require('../config/database');

exports.listerActifs = async (req, res) => {
    try {
        const [actifs] = await database.query('SELECT * FROM actifs');
        for (let actif of actifs) {
            const [vulns] = await database.query('SELECT id, nom_vulnerabilite, criticite FROM vulnerabilites WHERE actif_id = ?', [actif.id]);
            actif.vulnerabilites = vulns;
            actif.exposeInternet = !!actif.expose_internet;
        }
        res.json(actifs);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
};

exports.ajouterActif = async (req, res) => {
    const { nom, type, exposeInternet } = req.body;
    if (!nom || !type) return res.status(400).json({ erreur: "Nom et type obligatoires." });

    try {
        const [resultat] = await database.query(
            'INSERT INTO actifs (nom, type, expose_internet) VALUES (?, ?, ?)',
            [nom, type, exposeInternet ? 1 : 0]
        );
        res.status(201).json({ id: resultat.insertId, nom, type, exposeInternet, vulnerabilites: [] });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
};

exports.modifierActif = async (req, res) => {
    const { nom, type, exposeInternet } = req.body;
    const { id } = req.params;
    try {
        const [resultat] = await database.query(
            'UPDATE actifs SET nom = ?, type = ?, expose_internet = ? WHERE id = ?',
            [nom, type, exposeInternet ? 1 : 0, id]
        );
        if (resultat.affectedRows === 0) return res.status(404).json({ erreur: "Actif non trouvé" });
        res.json({ message: "Actif modifié avec succès." });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
};

exports.supprimerActif = async (req, res) => {
    try {
        const [resultat] = await database.query('DELETE FROM actifs WHERE id = ?', [req.params.id]);
        if (resultat.affectedRows === 0) return res.status(404).json({ erreur: "Actif non trouvé" });
        res.json({ message: "Actif supprimé avec succès." });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
};

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