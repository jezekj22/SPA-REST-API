const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');


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



app.post('/api/login',(req,res) =>{
    const { name, passwd } = req.body;
    console.log(name + " " + passwd);
});

app.post('/api/register',(req,res) =>{
    const { name, passwd, checkpasswd } = req.body;
    console.log(name + " " + passwd + " " + checkpasswd);
});











module.exports = app;
