const express = require('express');
const inquirer = require('inquirer');
const cTable = require('console.table');

const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({extended: false }));
app.use(express.json());

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employeetracker'
    },
    console.log('Connected to the employeetracker database')
);

db.query('SELECT * FROM employee', function (err, results) {
    console.log(results);
});

app.use((req, res)=> {
    res.status(404).end();
});