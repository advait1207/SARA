const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Get a free key at openweathermap.org
const PORT = 3000;

app.use(express.static(__dirname));

app.get('/weather', async (req, res) => {
    try {
        const city = req.query.city || 'London';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
        const response = await axios.get(url);
        res.json({
            temp: Math.round(response.data.main.temp),
            desc: response.data.weather[0].description,
            city: response.data.name
        });
    } catch (error) {
        res.status(500).json({ error: "Weather data unavailable" });
    }
});

app.listen(PORT, () => console.log(`🚀 NEXA SERVER: http://localhost:${PORT}`));
