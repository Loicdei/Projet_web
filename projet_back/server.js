// Chargement des variables d'environnement du fichier .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Autorise le Vue.js de ton binôme à interroger ton API
app.use(cors());
// Permet à Express de lire le format JSON envoyé par le Frontend
app.use(express.json());

// ⚙️ Configuration de la connexion à MySQL via le fichier .env
const configurationBDD = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Variable globale pour stocker la connexion
let baseDeDonnees;

// Connexion asynchrone à MySQL
async function connecterBDD() {
    try {
        baseDeDonnees = await mysql.createPool(configurationBDD);
        console.log(`Serveur démarré sur le port ${process.env.PORT}`);
    } catch (erreur) {
        console.error("Erreur de connexion à MySQL :", erreur.message);
    }
}
connecterBDD();

// ==========================================================
// 3.1 ENDPOINTS : GESTION DE L'ENTREPRISE
// ==========================================================

// GET /company -> Récupérer la fiche descriptive de la PME
app.get('/company', async (req, res) => {
    try {
        const [lignes] = await baseDeDonnees.query('SELECT * FROM entreprise WHERE id = 1');
        if (lignes.length === 0) {
            return res.status(404).json({ erreur: "Aucune entreprise configurée" });
        }
        
        const entreprise = lignes[0];
        // On transforme la chaîne "HTTPS, VPN" en tableau pour le Frontend
        entreprise.servicesExposes = entreprise.services_exposes ? entreprise.services_exposes.split(', ') : [];
        res.json(entreprise);
    } catch (err) {
        res.status(500).json({ erreur: "Erreur serveur : " + err.message });
    }
});

// PUT /company -> Modifier les informations de l'entreprise
app.put('/company', async (req, res) => {
    const { nom, secteur, nombreEmployes, nombreServeurs, nombrePostes, servicesExposes } = req.body;
    // On transforme le tableau du front en chaîne de caractères pour MySQL
    const chaineServices = Array.isArray(servicesExposes) ? servicesExposes.join(', ') : '';

    try {
        await baseDeDonnees.query(
            `UPDATE entreprise SET nom = ?, secteur = ?, nombre_employes = ?, nombre_serveurs = ?, nombre_postes = ?, services_exposes = ? WHERE id = 1`,
            [nom, secteur, parseInt(nombreEmployes) || 0, parseInt(nombreServeurs) || 0, parseInt(nombrePostes) || 0, chaineServices]
        );
        res.json({ message: "Entreprise mise à jour avec succès dans MySQL !" });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// ==========================================================
// 3.2 & 3.3 ENDPOINTS : GESTION DES ACTIFS & VULNÉRABILITÉS
// ==========================================================

// GET /assets -> Consulter la liste complète des actifs avec leurs vulnérabilités
app.get('/assets', async (req, res) => {
    try {
        // 1. On récupère tous les actifs
        const [actifs] = await baseDeDonnees.query('SELECT * FROM actifs');
        
        // 2. Pour chaque actif, on va chercher ses vulnérabilités liées
        for (let actif of actifs) {
            const [vulns] = await baseDeDonnees.query('SELECT id, nom_vulnerabilite, criticite FROM vulnerabilites WHERE actif_id = ?', [actif.id]);
            actif.vulnerabilites = vulns;
            actif.exposeInternet = !!actif.expose_internet; // Convertit 0 ou 1 en faux ou vrai
        }
        
        res.json(actifs);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// POST /assets -> Ajouter un actif
app.post('/assets', async (req, res) => {
    const { nom, type, exposeInternet } = req.body;
    if (!nom || !type) return res.status(400).json({ erreur: "Le nom et le type d'actif sont obligatoires." });

    try {
        const [resultat] = await baseDeDonnees.query(
            'INSERT INTO actifs (nom, type, expose_internet) VALUES (?, ?, ?)',
            [nom, type, exposeInternet ? 1 : 0]
        );
        res.status(201).json({ id: resultat.insertId, nom, type, exposeInternet, vulnerabilites: [] });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// PUT /assets/:id -> Modifier un actif existant
app.put('/assets/:id', async (req, res) => {
    const { nom, type, exposeInternet } = req.body;
    const { id } = req.params;

    try {
        const [resultat] = await baseDeDonnees.query(
            'UPDATE actifs SET nom = ?, type = ?, expose_internet = ? WHERE id = ?',
            [nom, type, exposeInternet ? 1 : 0, id]
        );
        if (resultat.affectedRows === 0) return res.status(404).json({ erreur: "Actif non trouvé" });
        res.json({ message: "Actif modifié avec succès." });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// DELETE /assets/:id -> Supprimer un actif
app.delete('/assets/:id', async (req, res) => {
    try {
        // Grâce au "ON DELETE CASCADE" en SQL, supprimer l'actif supprimera aussi ses vulnérabilités automatiquement
        const [resultat] = await baseDeDonnees.query('DELETE FROM actifs WHERE id = ?', [req.params.id]);
        if (resultat.affectedRows === 0) return res.status(404).json({ erreur: "Actif non trouvé" });
        res.json({ message: "Actif supprimé avec succès." });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// GET /vulnerabilities -> Consulter toutes les vulnérabilités de la base
app.get('/vulnerabilities', async (req, res) => {
    try {
        const [vulns] = await baseDeDonnees.query('SELECT * FROM vulnerabilites');
        res.json(vulns);
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// POST /vulnerabilities -> Associer une vulnérabilité à un actif
app.post('/vulnerabilities', async (req, res) => {
    const { actifId, nomVulnerabilite, criticite } = req.body;
    if (!actifId || !nomVulnerabilite || !criticite) return res.status(400).json({ erreur: "Tous les champs sont requis." });

    try {
        const [resultat] = await baseDeDonnees.query(
            'INSERT INTO vulnerabilites (actif_id, nom_vulnerabilite, criticite) VALUES (?, ?, ?)',
            [actifId, nomVulnerabilite, criticite]
        );
        res.status(201).json({ id: resultat.insertId, actifId, nomVulnerabilite, criticite });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// ==========================================================
// 3.4 ENDPOINT : MOTEUR DE CALCUL DU RISQUE CYBER
// ==========================================================
app.post('/risk/calculate', async (req, res) => {
    try {
        const [actifs] = await baseDeDonnees.query('SELECT * FROM actifs');
        const [vulns] = await baseDeDonnees.query('SELECT * FROM vulnerabilites');

        let scoreCriticite = 0;
        let multiplicateurExposition = 1;

        // On calcule des points selon le niveau de criticité des vulnérabilités
        vulns.forEach(v => {
            if (v.criticite === 'Élevé') scoreCriticite += 5;
            else if (v.criticite === 'Moyen') scoreCriticite += 3;
            else scoreCriticite += 1; // Faible
        });

        // On aggrave le risque si un actif est exposé sur Internet ET a au moins une vulnérabilité
        actifs.forEach(actif => {
            const possèdeDesFailles = vulns.some(v => v.actif_id === actif.id);
            if (actif.expose_internet && possèdeDesFailles) {
                multiplicateurExposition += 0.25; // +25% de risque par actif vulnérable exposé
            }
        });

        // Formule de calcul du score final (bloqué à un maximum de 100)
        let scoreGlobal = Math.round((actifs.length * 2 + scoreCriticite) * multiplicateurExposition);
        if (scoreGlobal > 100) scoreGlobal = 100;

        // Rendu sémantique du niveau de risque et génération automatique des recommandations
        let niveau = "Faible";
        let recommandations = [
            "Maintenir à jour l'inventaire des actifs.",
            "Activer les correctifs de sécurité Windows/Linux automatiquement."
        ];

        if (scoreGlobal >= 35 && scoreGlobal < 65) {
            level = "Moyen"; // On garde la variable demandée par l'énoncé pour le front
            recommandations.push("Mettre en place une politique stricte de mots de passe (MFA).", "Sensibiliser le personnel aux e-mails de Phishing.");
        } else if (scoreGlobal >= 65) {
            level = "Élevé";
            recommandations.push("URGENT : Couper ou restreindre les accès internet des actifs vulnérables.", "Sauvegarder immédiatement les bases de données sur un support déconnecté.", "Déployer un pare-feu pour isoler les réseaux métiers.");
        }

        res.json({
            totalAssets: actifs.length,
            totalVulnerabilities: vulns.length,
            score: scoreGlobal,
            level: scoreGlobal >= 65 ? "Élevé" : (scoreGlobal >= 35 ? "Moyen" : "Faible"),
            recommendations: recommandations
        });
    } catch (err) {
        res.status(500).json({ erreur: err.message });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur CyberTwin démarré sur http://localhost:${PORT}`);
});