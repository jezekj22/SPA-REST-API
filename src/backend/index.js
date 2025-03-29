const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const JSONdb = require('simple-json-db');
const bcrypt = require('bcryptjs');

const User = require('./user_model');
const Quote = require('./quote_model');

const app = express();
app.use(express.json());

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend'))); // Přidá statické soubory


const session = require('express-session');

app.use(session({
    secret: 'tajnyKlic', // Změň na bezpečný klíč
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Pokud běžíš na HTTPS, nastav na true
}));


const quotesPath = path.join(__dirname, 'quotes.json');
const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));

function getRandomQuote() {
    let firstQuote = quotes[Math.floor(Math.random() * quotes.length)];
    let secondQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Rozdělení prvního citátu
    let firstPart = firstQuote.split('.').slice(0, 1)[0].trim() + ' -';
    // Rozdělení druhého citátu a odstranění prázdných mezer
    let secondPart = secondQuote.split('.').slice(1).join('.').trim();

    // Převod první části druhého citátu na malé písmeno
    secondPart = secondPart.charAt(0).toLowerCase() + secondPart.slice(1);

    return `${firstPart} ${secondPart}`;
}

app.get('/random-quote', (req, res) => {
    console.log('GET /random-quote');
    res.json({ quote: getRandomQuote() });
});








app.post('/api/login', async (req, res) => {
    const { name, passwd } = req.body;

    const userDb = new User();
    const user = userDb.FindUserbyName(name);

    if (!user) {
        return res.status(400).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(passwd, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: "Invalid username or password" });
    }
    req.session.user =  user.username ;
    return res.json({ message: "Logged in" });
});

app.post('/api/register', async (req, res) => {
    const { name, passwd, checkpasswd } = req.body;

    if (!name || !passwd || !checkpasswd) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (passwd !== checkpasswd) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const userDb = new User(); 
        if (userDb.FindUserbyName(name)) {
            return res.status(400).json({ error: "User already exists" });
        }

        const newUser = userDb.create({
            username: name,
            password: passwd
        });

        return res.status(201).json({ message: "User registered successfully", user: newUser });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


app.get('/api/logout', function(req, res) {
    try {
        req.session.destroy();


        return res.status(201).json({ message: "LoggedOut" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Logout unsuccesful" });
    }
});

app.post('/api/save-quote', function(req, res) {
    try {
        const { text } = req.body;
        if(req.session.user){
            const quote = new Quote(req.session.user, text);
            console.log("zkouší to uložit");
            let message = quote.addFavoriteQuote();
            quote.addFavoriteQuote();
            if (!message.success) {
                return res.status(400).json({ error: message.message });
            }
            return res.status(201).json({ message: "Quote Saved" });
        }
        

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error occured during saving" });
    }
});








module.exports = app;
