require('dotenv').config();

const mysql = require('mysql2');
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_User,
        password: process.env.DB_PW,
        database: process.env.DB_Name
    },
    console.log('Connected to the employeetracker database')
);

module.exports = db;