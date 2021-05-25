const express = require('express');
const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection')
const mysql = require('mysql2');
const apiRoutes = require('./routes/apiRoutes');
const router = require('./routes/apiRoutes/departmentRoutes');

const PORT = process.env.PORT || 3001;
const app = express();



//express middleware
app.use(express.urlencoded({extended: false }));
app.use(express.json());

// Use apiRoutes
app.use('/api', apiRoutes);


// // Select all employees
// db.query(`SELECT * FROM employee`, (err, rows)=>{
//     console.log(rows);
// })


// // Select all tables for all employees
// db.query(`SELECT * 
// FROM employee, role, department
// Where employee.role_id=role.id 
// and role.department_id=department.id;`, (err,row)=>{
//     console.log(row);
// })



// Default response for any other request (NOT FOUND)
app.use((req,res) => {
    res.status(404).end();
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})


