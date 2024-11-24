const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const SECRET_KEY = "your-secret-key";

const { encrypt, decrypt } = require('./public/encryption');
const ENCRYPTION_KEY = 'secretkey';

const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error connecting to the database', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Создание таблицы пользователей
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`);

// Создание таблицы заметок
db.run(`
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`, (err) => {
    if (err) {
        console.error('Error creating notes table:', err.message);
    } else {
        console.log('Notes table created or already exists');
    }
});

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ message: "User already exists or error inserting user." });
        }
        res.status(201).json({ message: "User registered successfully." });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

app.get('/user', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: "Token is required." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }
        res.json({ message: `Welcome, ${decoded.username}!` });
    });
});

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Token is required." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }
        req.userId = decoded.id;
        next();
    });
};

app.get('/notes', authenticate, (req, res) => {
    const userId = req.userId;
    const query = 'SELECT * FROM notes WHERE user_id = ?';
    db.all(query, [userId], (err, notes) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch notes' });
        }
        const decryptedNotes = notes.map(note => ({
            ...note,
            content: decrypt(note.content, ENCRYPTION_KEY)
        }));
        res.json(decryptedNotes);
    });
});

app.post('/notes', authenticate, (req, res) => {
    const { content } = req.body;
    const userId = req.userId;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const encryptedContent = encrypt(content, ENCRYPTION_KEY);

    const query = `INSERT INTO notes (user_id, content) VALUES (?, ?)`;
    db.run(query, [userId, encryptedContent], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create note' });
        }
        res.status(201).json({ id: this.lastID, content });
    });
});

app.delete('/notes/:id', authenticate, (req, res) => {
    const noteId = req.params.id;
    const userId = req.userId;

    const query = 'DELETE FROM notes WHERE id = ? AND user_id = ?';
    db.run(query, [noteId, userId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete note' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Note not found or not authorized to delete' });
        }
        res.json({ message: 'Note deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});