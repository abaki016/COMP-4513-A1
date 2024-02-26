const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();
const supaUrl = 'https://mhoixsqyuksstwmrykeo.supabase.co';
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob2l4c3F5dWtzc3R3bXJ5a2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5NDc5NTIsImV4cCI6MjAyNDUyMzk1Mn0.2ThgHRyPdf_rSrPCvB8g73GJiqUSEJ58pmFr6TDuICk';
const supabase = supa.createClient(supaUrl, supaAnonKey);

// API routes

// Return all seasons
app.get('/f1/seasons', async (req, res) => {
    const { data, error } = await supabase
        .from('seasons')
        .select();
    if (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(data);
});

// Return all circuits
app.get('/f1/circuits', async (req, res) => {
    const { data, error } = await supabase
        .from('circuits')
        .select();
    if (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(data);
});

// Return details of a specific circuit by reference
app.get('/f1/circuits/:ref', async (req, res) => {
    const { data, error } = await supabase
        .from('circuits')
        .select()
        .eq('circuitRef', req.params.ref);
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Circuit not found' });
    }
    res.json(data);
});

// Return circuits used in a given season
app.get('/f1/circuits/season/:year', async (req, res) => {
    const { data, error } = await supabase
        .from('races')
        .select('circuitId')
        .eq('year', req.params.year)
        .order('round', { ascending: true });
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'No circuits found for the given season' });
    }
    const circuitIds = data.map(race => race.circuitId);
    const circuits = await supabase
        .from('circuits')
        .select()
        .in('circuitId', circuitIds);
    res.json(circuits.data);
});

// Return all constructors
app.get('/f1/constructors', async (req, res) => {
    const { data, error } = await supabase
        .from('constructors')
        .select();
    if (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(data);
});

// Return details of a specific constructor by reference
app.get('/f1/constructors/:ref', async (req, res) => {
    const { data, error } = await supabase
        .from('constructors')
        .select()
        .eq('constructorRef', req.params.ref);
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Constructor not found' });
    }
    res.json(data);
});

// Return all drivers
app.get('/f1/drivers', async (req, res) => {
    const { data, error } = await supabase
        .from('drivers')
        .select();
    if (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(data);
});

// Return details of a specific driver by reference
app.get('/f1/drivers/:ref', async (req, res) => {
    const { data, error } = await supabase
        .from('drivers')
        .select()
        .eq('driverRef', req.params.ref);
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(data);
});

// Search drivers by substring of their surname
app.get('/f1/drivers/search/:substring', async (req, res) => {
    const { data, error } = await supabase
        .from('drivers')
        .select()
        .ilike('surname', `${req.params.substring}%`);
    if (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(data);
});

// Return drivers within a given race
app.get('/f1/drivers/race/:raceId', async (req, res) => {
    const { data, error } = await supabase
        .from('results')
        .select('driverId')
        .eq('raceId', req.params.raceId);
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'No drivers found for the given race' });
    }
    const driverIds = data.map(result => result.driverId);
    const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select()
        .in('driverId', driverIds);
    if (driversError) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(driversData);
});

// Return details of a specific race
app.get('/f1/races/:raceId', async (req, res) => {
    const { data, error } = await supabase
        .from('races')
        .select('circuits(name)', 'location', 'country')
        .eq('raceId', req.params.raceId);
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Race not found' });
    }
    // Extract the circuit name from the nested object
    const { circuits, location, country } = data[0];
    const circuitName = circuits[0].name; // Assuming one circuit per race
    res.json({ circuitName, location, country });
});

// Return races within a given season
app.get('/f1/races/season/:year', async (req, res) => {
    const { data, error } = await supabase
        .from('races')
        .select()
        .eq('year', req.params.year)
        .order('round', { ascending: true });
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'No races found for the given season' });
    }
    res.json(data);
});

// Return a specific race within a given season and round number
app.get('/f1/races/season/:year/:round', async (req, res) => {
    const { data, error } = await supabase
        .from('races')
        .select()
        .eq('year', req.params.year)
        .eq('round', req.params.round);
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Race not found' });
    }
    res.json(data);
});

// Return all races for a given circuit
app.get('/f1/races/circuits/ref/:circuitRef', async (req, res) => {
    const { data, error } = await supabase
        .from('races')
        .select()
        .eq('circuitRef', req.params.circuitRef)
        .order('year', { ascending: true });
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'No races found for the given circuit' });
    }
    res.json(data);
});

// Return races for a given circuit between two years
app.get('/f1/races/circuits/ref/:circuitRef/season/:startYear/:endYear', async (req, res) => {
    const { data, error } = await supabase
        .from('races')
        .select()
        .eq('circuitRef', req.params.circuitRef)
        .gte('year', req.params.startYear)
        .lte('year', req.params.endYear)
        .order('year', { ascending: true });
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'No races found for the given circuit and years' });
    }
    res.json(data);
});

// Return results for the specified race
app.get('/f1/results/race/:raceId', async (req, res) => {
    const { data, error } = await supabase
        .from('results')
        .select(`
            driverId (driverRef, code, forename, surname),
            raceId (name, round, year, date),
            constructorId (name, constructorRef, nationality),
            positionOrder
        `)
        .eq('raceId', req.params.raceId)
        .order('positionOrder', { ascending: true });
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Results not found for the specified race' });
    }
    res.json(data);
});

// Return results for a given driver
app.get('/f1/results/driver/:ref', async (req, res) => {
    const { data, error } = await supabase
        .from('results')
        .select()
        .eq('driverId', req.params.ref);
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Results not found for the specified driver' });
    }
    res.json(data);
});

// Return results for a given driver between two years
app.get('/f1/results/driver/:ref/seasons/:startYear/:endYear', async (req, res) => {
    const { data, error } = await supabase
        .from('results')
        .select()
        .eq('driverId', req.params.ref)
        .gte('year', req.params.startYear)
        .lte('year', req.params.endYear);
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Results not found for the specified driver and years' });
    }
    res.json(data);
});

// Return qualifying results for the specified race
app.get('/f1/qualifying/:raceId', async (req, res) => {
    const { data, error } = await supabase
        .from('qualifying')
        .select()
        .eq('raceId', req.params.raceId)
        .order('position', { ascending: true });
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Qualifying results not found for the specified race' });
    }
    res.json(data);
});

// Return current season driver standings for the specified race
app.get('/f1/standings/:raceId/drivers', async (req, res) => {
    const { data, error } = await supabase
        .from('driver_standings')
        .select()
        .eq('raceId', req.params.raceId)
        .order('position', { ascending: true });
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Driver standings not found for the specified race' });
    }
    res.json(data);
});

// Return current season constructor standings for the specified race
app.get('/f1/standings/:raceId/constructors', async (req, res) => {
    const { data, error } = await supabase
        .from('constructor_standings')
        .select()
        .eq('raceId', req.params.raceId)
        .order('position', { ascending: true });
    if (error || data.length === 0) {
        return res.status(404).json({ error: 'Constructor standings not found for the specified race' });
    }
    res.json(data);
});

app.listen(8080, () => {
    console.log('listening on port 8080');
});

