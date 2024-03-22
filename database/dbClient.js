const mongoose = require('mongoose');

class DbClient {
    constructor(dbPath) {
        this.dbPath = dbPath || 'mongodb://localhost:27017/booksDB';
    }

    createConnection() {
        mongoose.connect(this.dbPath);
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'Błąd połączenia z MongoDB:'));
        db.once('open', function () {
            console.log('Połączono z bazą danych MongoDB');
        });
        return db;
    }

    closeConnection() {
        mongoose.connection.close();
        console.log('Zamknięto połączenie z bazą danych MongoDB');
    }
}

module.exports = DbClient;