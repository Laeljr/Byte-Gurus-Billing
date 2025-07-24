const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD',
  database: 'YOUR_DATABASE'
});

// Test connection
db.connect(err => {
  if (err) {
    console.error('DB connection failed:', err);
    return;
  }
  console.log('Connected to MySQL DB');
});

// Example API route
app.get('/api/clients', (req, res) => {
  db.query('SELECT * FROM clients', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// Example POST
app.post('/api/clients', (req, res) => {
  const { name, email } = req.body;
  db.query('INSERT INTO clients (name, email) VALUES (?, ?)', [name, email], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name, email });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
