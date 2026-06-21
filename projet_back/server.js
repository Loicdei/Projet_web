require('dotenv').config();

const express = require('express');
const cors = require('cors');

const entrepriseRoutes = require('./routes/entrepriseRoutes');
const actifsRoutes = require('./routes/actifsRoutes');
const vulnerabilitesRoutes = require('./routes/vulnerabilitesRoutes');
const risqueRoutes = require('./routes/risqueRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/company', entrepriseRoutes);
app.use('/assets', actifsRoutes);
app.use('/vulnerabilities', vulnerabilitesRoutes);
app.use('/risk', risqueRoutes);

app.listen(PORT, () => {
    console.log(`Serveur CyberTwin démarré sur http://localhost:${PORT}`);
    console.log(`Routes disponibles : /company, /assets, /vulnerabilities, /risk/calculate`);
});