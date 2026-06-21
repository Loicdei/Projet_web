const database = require('../config/database');

exports.obtenirEntreprise = async (req, res) => {
    try {
        const [lignes] = await database.query('SELECT * FROM entreprise WHERE id = 1');
        if (lignes.length === 0) return res.status(404).json({ erreur: "Aucune entreprise configurée" });
        
        const entreprise = lignes[0];
        entreprise.servicesExposes = entreprise.services_exposes ? entreprise.services_exposes.split(', ') : [];
        res.json(entreprise);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
};

exports.modifierEntreprise = async (req, res) => {
    const { nom, secteur, nombreEmployes, nombreServeurs, nombrePostes, servicesExposes } = req.body;
    const chaineServices = Array.isArray(servicesExposes) ? servicesExposes.join(', ') : '';

    try {
        await database.query(
            `UPDATE entreprise SET nom = ?, secteur = ?, nombre_employes = ?, nombre_serveurs = ?, nombre_postes = ?, services_exposes = ? WHERE id = 1`,
            [nom, secteur, parseInt(nombreEmployes) || 0, parseInt(nombreServeurs) || 0, parseInt(nombrePostes) || 0, chaineServices]
        );
        res.json({ message: "Entreprise mise à jour avec succès dans MySQL !" });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
};