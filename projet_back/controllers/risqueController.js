const database = require('../config/database');

exports.calculerRisque = async (req, res) => {
    try {
        const [actifs] = await database.query('SELECT * FROM actifs');
        const [vulns] = await database.query('SELECT * FROM vulnerabilites');

        let scoreCriticite = 0;
        let multiplicateurExposition = 1;

        vulns.forEach(v => {
            if (v.criticite === 'Élevé') scoreCriticite += 5;
            else if (v.criticite === 'Moyen') scoreCriticite += 3;
            else scoreCriticite += 1;
        });

        actifs.forEach(actif => {
            const possèdeDesFailles = vulns.some(v => v.actif_id === actif.id);
            if (actif.expose_internet && possèdeDesFailles) {
                multiplicateurExposition += 0.25;
            }
        });

        let scoreGlobal = Math.round((actifs.length * 2 + scoreCriticite) * multiplicateurExposition);
        if (scoreGlobal > 100) scoreGlobal = 100;

        let recommandations = [
            "Maintenir à jour l'inventaire des actifs.",
            "Activer les correctifs de sécurité Windows/Linux automatiquement."
        ];

        if (scoreGlobal >= 35 && scoreGlobal < 65) {
            recommandations.push("Mettre en place une politique stricte de mots de passe (MFA).", "Sensibiliser le personnel aux e-mails de Phishing.");
        } else if (scoreGlobal >= 65) {
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
};