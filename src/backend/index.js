const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const JSONdb = require('simple-json-db');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend'))); // Přidá statické soubory

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
    res.json({ quote: getRandomQuote() });
});


class User {
    /**
     * Constructor method
     * @param { int } id 
     * @param { string } username 
     * @param { string } password 
     * @param { string } displayName
     * @param { int } generatedQuotes
     * @param { int } favoritedQuotes
     */  
    constructor(id, username, password) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.db = new JSONdb(path.join(__dirname, '../data/users.json'));
        
        if (!this.db.has('next_id')) {
            this.db.set('next_id', 1);
        }

        if (!this.db.has('users')) {
            this.db.set('users', []);
        }
    }
        
    getNextId() {
        return this.db.get('next_id');
    }

    FindUserbyName(username){
        let users = this.db.get('users') || [];
        let userData = users.find(user => user.username === username); 
        console.log(username)
        if(!userData){
            return false
        }
        return  new User(userData.id, userData.username, userData.password); 
    }

    async create(user) {
        const users = this.db.get('users') || [];
        if(this.FindUserbyName(user.username)){
            throw new Error("User already exists");
 
        }
        const hashedPassword = await bcrypt.hash(user.password, 15);
        users.push({
            id: this.getNextId(),
            username: user.username,
            password: hashedPassword,
            displayName: user.displayName,
            generatedQuotes: user.generatedQuotes,
            favoritedQuotes: user.favoritedQuotes
        });
    
        this.db.set('users', users);
        this.db.set('next_id', this.getNextId() + 1);
        this.db.sync();
        return user;
    }
}





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

    res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
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











module.exports = app;
