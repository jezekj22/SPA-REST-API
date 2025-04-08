const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
require('dotenv').config();

const User = require('./user_model');
const Quote = require('./quote_model'); // Ještě budeš muset upravit, pokud taky používá JSON

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(session({
    secret: 'tajnyKlic',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// ✅ Inicializace tabulky při startu serveru
User.initDB();

const quotesPath = path.join(__dirname, 'quotes.json');
const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));

function getRandomQuote() {
    let firstQuote = quotes[Math.floor(Math.random() * quotes.length)];
    let secondQuote = quotes[Math.floor(Math.random() * quotes.length)];

    let firstPart = firstQuote.split('.').slice(0, 1)[0].trim() + ' -';
    let secondPart = secondQuote.split('.').slice(1).join('.').trim();
    secondPart = secondPart.charAt(0).toLowerCase() + secondPart.slice(1);

    return `${firstPart} ${secondPart}`;
}

app.get('/random-quote', (req, res) => {
    console.log('GET /random-quote');
    res.json({ quote: getRandomQuote() });
});


// 🔐 Login
app.post('/api/login', async (req, res) => {
    const { name, passwd } = req.body;

    try {
        const user = await User.findByUsername(name);
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(passwd, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        req.session.user = user.username;
        return res.json({ message: "Logged in" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});


// 📝 Registrace
app.post('/api/register', async (req, res) => {
    const { name, passwd, checkpasswd } = req.body;

    if (!name || !passwd || !checkpasswd) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (passwd !== checkpasswd) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const newUser = await User.create({
            username: name,
            password: passwd,
            displayName: name,
            generatedQuotes: 0,
            favoritedQuotes: 0
        });

        return res.status(201).json({ message: "User registered successfully", user: newUser });

    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
});


// 🚪 Logout
app.get('/api/logout', (req, res) => {
    try {
        req.session.destroy();
        return res.status(201).json({ message: "LoggedOut" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Logout unsuccessful" });
    }
});


// ⭐ Uložení citátu – bude třeba přepsat i Quote třídu, pokud používá JSON
app.post('/api/save-quote', (req, res) => {
    try {
        const { text } = req.body;
        if (req.session.user) {
            const quote = new Quote(req.session.user, text);
            console.log("zkouší to uložit");
            let message = quote.addFavoriteQuote(); // ← TODO: předělat na async s SQL
            if (!message.success) {
                return res.status(400).json({ error: message.message });
            }
            return res.status(201).json({ message: "Quote Saved" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error occurred during saving" });
    }
});


// 👤 Profil uživatele
app.get('/api/profile', (req, res) => {
    try {
        if (req.session.user) {
            const quote = new Quote(req.session.user, "");
            let favoriteQuotes = quote.getFavoriteQuotes(req.session.user); // ← TODO: předělat na async s SQL
            let username = req.session.user;
            console.log("úspěšně se načetl profil");
            return res.status(200).json({ quotes: favoriteQuotes, username: username });

        } else {
            return res.status(401).json({ error: "Unauthorized" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error occurred during loading profile" });
    }
});


module.exports = app;
