const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require('../../utils/inputCheck');

// Select all employees
router.get('/employee', (req,res)=> {
    const sql = `SELECT e.id, e.first_name, e.last_name, r.title, d.name 'department', r.salary, e.manager_id
                 FROM employee as e , role as r, department as d
                 Where e.role_id=r.id 
                 and r.department_id=d.id;`;
    
    // Select all employees
    db.query(sql, (err, rows)=>{
    console.table(rows);
    })

})

//Select all employees by department
router.get('/employee/:id'), (req, res)=> {
    const sql = `SELECT e.id, e.first_name, e.last_name, r.title, d.name 'department', r.salary, e.manager_id
    FROM employee as e , role as r, department as d
    Where e.role_id=r.id 
    and r.department_id=d.id
    and d.name = ?;`;
    const params = 'TestDept';
    
    db.query(sql, params    , (err, row) => {
    console.table(row);
    })
}


// Post a new employee
router.post('/employee', ({ body }, res)=>{
    // Data validation
    const errors = inputCheck(body, 'first_name', 'last_name');
    if (errors){
        res.status(400).json({ error: errors});
        return;
    }
    
    const sql = `INSERT INTO employee (first_name, last_name) VALUES(?, ?)`;
    const params = ['Mossy', 'Ross'];

    db.query(sql, params, (err, results) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: body  
        });
    });
});


// // Select all employees
// db.query(`SELECT * FROM employee`, (err, rows)=>{
//     console.log(rows);
// })

module.exports = router;