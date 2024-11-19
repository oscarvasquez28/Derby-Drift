import mysql from 'mysql2';

export default class Database {
    static db = null;

    static initConnection(connectionSettings) {
        if (this.db != null) {
            throw new Error('Database connection already initialized');
        }
        this.db = mysql.createPool(connectionSettings);
        return this.db;
    }

    static getDb() {
        if (this.db == null) {
            throw new Error('Database connection not initialized');
        }
        return this.db;
    }
}