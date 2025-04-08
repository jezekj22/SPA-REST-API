const bcrypt = require('bcryptjs');
const JSONdb = require('simple-json-db');
const db = new JSONdb('../../data/users.json');
const path = require('path');


class Quote {
    
    constructor( username, quote) {
        this.id ;
        this.username = username;
        this.quote = quote;
        this.db = new JSONdb(path.join(__dirname, '../../data/favorite.json'));
        
        if (!this.db.has('next_id')) {
            this.db.set('next_id', 1);
        }

        if (!this.db.has('quotes')) {
            this.db.set('quotes', []);
        }
    }
        
    getNextId() {
        return this.db.get('next_id');
    }


    isDuplicateQuote(username, quote) {
        const quotes = this.db.get('quotes') || [];
        const userQuotes = quotes.filter(q => q.username === username);
        return userQuotes.some(q => q.quote === quote);
    }

    addFavoriteQuote() {
        const quotes = this.db.get('quotes') || [];

        if (this.isDuplicateQuote(this.username, this.quote)) {
            console.log("duplicita")
            return { success: false, message: "Quote already exists in favorites" };
        }

        quotes.push({
            id: this.getNextId(),
            username: this.username,
            quote: this.quote
        });

        this.db.set('quotes', quotes);
        this.db.set('next_id', this.getNextId() + 1);
        this.db.sync();

        return { success: true, message: "Quote added to favorites" };
    }

    getFavoriteQuotes(username) {
        const quotes = this.db.get('quotes') || [];
        return quotes
            .filter(q => q.username === username) 
            .map(q => q.quote); 
    }
    
}

module.exports = Quote;
