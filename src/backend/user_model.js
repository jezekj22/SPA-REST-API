const bcrypt = require('bcryptjs');
const JSONdb = require('simple-json-db');
const db = new JSONdb('../data/users.json');
const path = require('path');


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
            return null;
        }
        return  new User(userData.id, userData.username, userData.password); 
    }

    async create(user) {
        const users = this.db.get('users') || [];
        if(this.FindUserbyName(user.username)){
            throw new Error("User already exists");
 
        }
        const hashedPassword = await bcrypt.hash(user.password, 10);
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

module.exports = User;
