const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  field1: { type: Number, required: true }, // Example: temperature, sales
  field2: { type: Number, required: true }, // Example: humidity, satisfaction
  field3: { type: Number, required: true }, // Example: CO2 levels, traffic
});

const Measurement = mongoose.model('Measurement', measurementSchema);

module.exports = Measurement;
