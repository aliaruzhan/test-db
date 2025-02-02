const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const Measurement = require('./models/measurement'); // Import schema

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

mongoose.connect(
    process.env.MONGO_URI
).then(() => {
    console.log('Connection successful')
    app.listen( PORT , () => {
        console.log("Server is running on Port 3000")
    })
}).catch(() => {
    console.log('Connection failed')
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
})

app.get("/api/measurements", async (req, res) => {
    const { field, start_date, end_date } = req.query;

    if (!field || !start_date || !end_date) {
        return res.status(400).json({ error: "Field, start_date, and end_date are required" });
    }

    try {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        endDate.setUTCHours(23, 59, 59, 999);

        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);

        const data = await Measurement.find(
            { timestamp: { $gte: startDate, $lte: endDate } },
            { timestamp: 1, [field]: 1, _id: 0 }
        );

        console.log("Query Result:", data);

        if (data.length === 0) {
            return res.status(404).json({ message: "No data found for the given range" });
        }

        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get('/api/measurements/metrics', async (req, res) => {
    const { field } = req.query;

    if (!field || !['field1', 'field2', 'field3'].includes(field)) {
        return res.status(400).json({ error: 'Invalid or missing field parameter' });
    }

    try {
        const data = await Measurement.aggregate([
            {
                $group: {
                    _id: null,
                    avg: { $avg: `$${field}` },
                    min: { $min: `$${field}` },
                    max: { $max: `$${field}` },
                    stdDev: { $stdDevPop: `$${field}` },
                },
            },
        ]);

        res.json(data[0] || { avg: 0, min: 0, max: 0, stdDev: 0 });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});
