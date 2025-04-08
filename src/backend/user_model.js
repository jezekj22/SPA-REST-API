const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Připojení k PostgreSQL (Render connection string)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

class User {
  constructor(id, username, password, displayName, generatedQuotes, favoritedQuotes) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.displayName = displayName;
    this.generatedQuotes = generatedQuotes;
    this.favoritedQuotes = favoritedQuotes;
  }

  // ✅ Vytvoření tabulky (pouze pokud neexistuje)
  static async initDB() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        display_name VARCHAR(255),
        generated_quotes INTEGER DEFAULT 0,
        favorited_quotes INTEGER DEFAULT 0
      );
    `;

    try {
      await pool.query(createTableQuery);
      console.log("✅ Tabulka 'users' připravena");
    } catch (err) {
      console.error("❌ Chyba při vytváření tabulky:", err);
    }
  }

  // 🔍 Najdi uživatele podle jména
  static async findByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return new User(
      user.id,
      user.username,
      user.password,
      user.display_name,
      user.generated_quotes,
      user.favorited_quotes
    );
  }

  // ➕ Vytvoř nového uživatele (s kontrolou duplicity)
  static async create(user) {
    const existingUser = await this.findByUsername(user.username);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    try {
      const result = await pool.query(
        `INSERT INTO users (username, password, display_name, generated_quotes, favorited_quotes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          user.username,
          hashedPassword,
          user.displayName,
          user.generatedQuotes || 0,
          user.favoritedQuotes || 0
        ]
      );

      const newUser = result.rows[0];

      return new User(
        newUser.id,
        newUser.username,
        newUser.password,
        newUser.display_name,
        newUser.generated_quotes,
        newUser.favorited_quotes
      );
    } catch (err) {
      if (err.code === '23505') {
        // 23505 = UNIQUE violation
        throw new Error("User with this username already exists (DB check)");
      } else {
        throw err;
      }
    }
  }
}

module.exports = User;
