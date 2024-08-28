const express = require('express');
const path = require('path');
const turf = require('@turf/turf');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/distance', (req, res) => {
    const points = req.body.points;

    if (!Array.isArray(points) || points.length < 2) {
        return res.status(400).send('Insufficient points');
    }

    const line = turf.lineString(points.map(p => [p.lng, p.lat]));
    const options = { units: 'kilometers' };
    const distance = turf.length(line, options);
    console.log(distance)
    res.json({ distance: distance, units: options.units });
});

// app.get('/geojson', (req, res) => {
//     const geojsonPath = path.join(__dirname, 'data', 'large-data.geojson');
//     const stream = fs.createReadStream(geojsonPath, { encoding: 'utf8' });
//     res.type('application/json');
//     stream.pipe(res);
// });


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
