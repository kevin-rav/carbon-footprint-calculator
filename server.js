const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('leaderboard.db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (like stylesheets, scripts)
app.use(express.static(path.join(__dirname)));

// Serve homepage.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'homepage.html'));
});

// Serve calculator.html
app.get('/calculator', (req, res) => {
    res.sendFile(path.join(__dirname, 'calculator.html'));
});

// Serve leaderboard.html
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// Initialize the database table
db.run("CREATE TABLE IF NOT EXISTS leaderboard (username TEXT, emission FLOAT)");

// Handle data submission
app.post('/submit-data', (req, res) => {
    const { username, emission } = req.body;
    const stmt = db.prepare("INSERT INTO leaderboard (username, emission) VALUES (?, ?)");
    stmt.run(username, emission);
    stmt.finalize();
    res.send("Data submitted!");
});

// Retrieve leaderboard data
app.get('/get-leaderboard', (req, res) => {
    db.all("SELECT * FROM leaderboard ORDER BY emission ASC", [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
