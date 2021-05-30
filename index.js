const express = require('express');
const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection')
const mysql = require('mysql2');
const router = require('express').Router();
const apiRoutes = require('./routes/apiRoutes');
const { async } = require('rxjs');
const { param } = require('./routes/apiRoutes');

const PORT = process.env.PORT || 3001;
const app = express();



//express middleware
app.use(express.urlencoded({extended: false }));
app.use(express.json());

// Use apiRoutes
app.use(apiRoutes);

//question for users to select an action
const questions = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'View All Employees By Department', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'Remove Role']
        }
    ])
};

//function to initialize app
function init() {
    questions().then(data => {
        if (data.action === 'View All Employees'){
            console.log(data.action)
            const sql = `SELECT e.id, e.first_name, e.last_name, r.title, d.name 'department', r.salary, e.manager_id
            FROM employee as e , role as r, department as d
            Where e.role_id=r.id 
            and r.department_id=d.id;`;

            // Select all employees
            db.query(sql, (err, rows)=>{
            console.table(rows);
            })
            init();
        } 
        // complete code for view employees by department
        if (data.action === 'View All Employees By Department') {
            console.log(data.action)
            const sql ='SELECT Distinct d.name FROM department d'
            db.query(sql, (err, row)=> {
            console.log(row[0].name)
            let deptSelector = [];


            for (var i=0; i<row.length; i++){
                deptSelector.push(row[i].name);
            }
            console.log(deptSelector);

            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'department',
                    choices: deptSelector
                }
            ]).then(data =>{        
            const sql2 = 'SELECT e.* FROM employee e, department d WHERE d.name=?'
            const params = data.department;
    
            db.query(sql2, params, (err, row) => {
            console.table(row);
            })           
        })
        })
    }   
        //complete add employee code
        if (data.action === 'Add Employee') {
            console.log(data.action)
            let roleSelector = [];
            let managerSelector = [];

            //run query for role and role id
            const sql = 'SELECT DISTINCT CONCAT(r.id, "-",r.title) as id_title FROM role r'
            db.query(sql, (err, row)=> {
            for (var i=0; i<row.length; i++){
                roleSelector.push(row[i].id_title)
            }
            })

            const sqlMan = 'SELECT CONCAT(e.id,"-",e.first_name, " ", e.last_name) as name FROM employee e'
            db.query(sqlMan, (err, rows)=>{           
            for (var i=0; i<rows.length; i++){
                managerSelector.push(rows[i].name)
            }
                managerSelector.push('0-NULL');
            
            })

            return inquirer.prompt([
                {
                    type:'iput', 
                    name: 'first_name',
                    message: "What is the employee's first name?",
                    validate: firstNameInput => {
                        if (firstNameInput){
                            return true;
                        } else {
                            console.log('You need to provide a first name!')
                            return false;
                        }
                    }
                },
                {
                    type:'iput', 
                    name: 'last_name',
                    message: "What is the employee's last name?",
                    validate: lastNameInput => {
                        if (lastNameInput){
                            return true;
                        } else {
                            console.log('You need to provide a last name!')
                            return false;
                        }
                    }
                },
                {
                    type: 'list',
                    name: 'role',
                    choices: roleSelector
                },
                {
                    type: 'list',
                    name: 'manager',
                    choices: managerSelector
                }
            ]).then(data => {
            const roleID = data.role.split("-");
            const managerID = data.manager.split("-");
            const first_name = data.first_name;
            const last_name = data.last_name;
            const role = roleID[0];
            const manager = managerID[0];  
            
           const sqlAddEmployee = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);'
           const paramsAddEmployee = [first_name, last_name, role, manager]

           db.query(sqlAddEmployee, paramsAddEmployee, (err,result) => {
               if (err){
                   console.log(err);
               }
               console.log(`${first_name} ${last_name} has been added!`);
           })
        })
        }
        if (data.action === 'Remove Employee') {
            console.log(data.action)
            let employeeArr = [];

            const sqlEmp = 'SELECT CONCAT(e.id, "-", e.first_name," ", e.last_name) as nameID FROM employee e'

            db.query(sqlEmp, (err, results) => {
                
                for (var i=0; i<results.length; i++){
                    employeeArr.push(results[i].nameID)
                }
                console.log(employeeArr)
            })

            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    choices: employeeArr
                }
            ]).then(data => {
                console.log('post prompt')
            })
        }
        if (data.action === 'Update Employee Role') {
            console.log(data.action)
        }
        if (data.action === 'View All Roles') {
            console.log(data.action)

            const sqlRole = 'SELECT DISTINCT r.title FROM role r'

            db.query(sqlRole, (err, result) => {
                console.table(result)
            })
        }
        if (data.action === 'Add Role') {
            console.log(data.action)
            let deptSelector = [];
            const sqlDept = 'SELECT CONCAT (d.id,"-"d.name) as deptID FROM department d'
            db.query(sqlDept, (err, result) => {
                for (var i=0; i<result.length; i++){
                    deptSelector.push(result[i].deptID)
                }
            })


            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'What is the title for the role?',
                    validate: titleInput => {
                        if (titleInput){
                            return true;
                        } else {
                            console.log('You need to provide a title!')
                            return false;
                        }
                    }
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the salary for the role?',
                    validate: salaryInput => {
                        if (salaryInput){
                            return true;
                        } else {
                            console.log('You need to provide a salary!')
                            return false;
                        }
                    }
                },
                {
                    type: 'list',
                    name: 'department',
                    choices: departmentSelector
                }
            ]).then(data => {
            
            const sqlRoleAdd ='INSERT INTO role  (title, salary, department_id) VALUES (?, ?, ?)'
            const paramsRoleAdd = []

            db.query(sqlRoleAdd, paramsRoleAdd, (err, result) => {
                if (err){
                    console.log(err);
                }
                console.log(`${role} has been added!`);
            })
        })
        }
        if (data.action === 'Remove Role') {
            console.log(data.action)
            let roleSelector = [];
            const sqlRoleID = 'SELECT CONCAT(r.id,"-",r.title) as roleID FROM role r'
            db.query(sqlRoleID, (err, result) => {
                for (var i=0; i<result.length; i++){
                    roleSelector.push(result[i].roleID)
                }
            })

            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    choices: roleSelector
                }
            ]).then(data => {
                //setup remove query
            })
        }
    })
    
}


// Default response for any other request (NOT FOUND)
app.use((req,res) => {
    res.status(404).end();
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

// function call to initialize app
init();