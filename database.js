const sqlite3 = require('sqlite3').verbose()
const path = require('path')

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'chat.db'))
        this.init()
    }

    init() {
        this.db.serialize(() => {
            
            this.db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                telegram_id INTEGER UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`)

            this.db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                text TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`)

            this.db.run(`CREATE TABLE IF NOT EXISTS summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id INTEGER NOT NULL,
                summary TEXT NOT NULL,
                message_id INTEGER NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (requester_id) REFERENCES users (id),
                FOREIGN KEY (message_id) REFERENCES messages (id)
            )`)
        })
    }

    saveUser(username, telegramId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR IGNORE INTO users (username, telegram_id) VALUES (?, ?)',
                [username, telegramId],
                function(err) {
                    if (err) reject(err)
                    else resolve(this.lastID)
                }
            )
        })
    }

    getUserId(telegramId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT id FROM users WHERE telegram_id = ?',
                [telegramId],
                (err, row) => {
                    if (err) reject(err)
                    else resolve(row ? row.id : null)
                }
            )
        })
    }

    saveMessage(userId, text) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO messages (user_id, text) VALUES (?, ?)',
                [userId, text],
                function(err) {
                    if (err) reject(err)
                    else resolve(this.lastID)
                }
            )
        })
    }

    saveSummary(requesterId, summary, messageId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO summaries (requester_id, summary, message_id) VALUES (?, ?, ?)',
                [requesterId, summary, messageId],
                function(err) {
                    if (err) reject(err)
                    else resolve(this.lastID)
                }
            )
        })
    }

    getLastSummaryMessageId() {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT message_id FROM summaries ORDER BY timestamp DESC LIMIT 1',
                (err, row) => {
                    if (err) reject(err)
                    else resolve(row ? row.message_id : 0)
                }
            )
        })
    }

    getMessageCountSince(messageId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT COUNT(*) as count FROM messages WHERE id > ?',
                [messageId],
                (err, row) => {
                    if (err) reject(err)
                    else resolve(row.count)
                }
            )
        })
    }

    getRecentMessages(limit = 50) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT m.id, m.text, u.username, m.timestamp 
                 FROM messages m 
                 JOIN users u ON m.user_id = u.id 
                 ORDER BY m.timestamp DESC 
                 LIMIT ?`,
                [limit],
                (err, rows) => {
                    if (err) reject(err)
                    else resolve(rows)
                }
            )
        })
    }

    async getLastNMessagesFormatted(n) {
        const messages = await this.getRecentMessages(n)
        return messages.reverse().map(msg => 
            `${msg.timestamp} ${msg.username}: ${msg.text}`
        ).join('\n')
    }

    getAllSummaries() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT id, timestamp FROM summaries ORDER BY timestamp DESC',
                (err, rows) => {
                    if (err) reject(err)
                    else resolve(rows)
                }
            )
        })
    }

    getSummaryById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT summary FROM summaries WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) reject(err)
                    else resolve(row ? row.summary : null)
                }
            )
        })
    }

    getLastSummary() {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT summary FROM summaries ORDER BY timestamp DESC LIMIT 1',
                (err, row) => {
                    if (err) reject(err)
                    else resolve(row ? row.summary : null)
                }
            )
        })
    }

    close() {
        this.db.close()
    }
}

module.exports = Database