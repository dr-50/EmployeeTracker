const express = require('express');
const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection')
const mysql = require('mysql2');
const PORT = process.env.PORT || 3001;
const app = express();

//greeting for initial run
const greeting = () => {
    console.table( `===========================
WELCOME TO EMPLOYEE TRACKER
===========================`);
init();
}

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
            const sql = `SELECT e.id, e.first_name, e.last_name, r.title, d.name 'department', 
            r.salary, CONCAT(e2.first_name," ", e2.last_name) as 'Manager'
            FROM employee as e 
            LEFT JOIN role r on r.id=e.role_id
            LEFT JOIN department d on d.id=r.department_id
            LEFT JOIN employee e2 on e2.id = e.manager_id`;

            // Select all employees
            db.query(sql, (err, rows)=>{
            console.log(`
            `)
            console.table(rows);
            });
            init();
        } 
        // complete code for view employees by department
        if (data.action === 'View All Employees By Department') {
            const sql ='SELECT Distinct d.name FROM department d'
            db.query(sql, (err, rowEmpDept)=> {
            let deptSelector = [];

            for (var i=0; i<rowEmpDept.length; i++){
                deptSelector.push(rowEmpDept[i].name);
            }
            
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'department',
                    choices: deptSelector
                }
            ]).then(data =>{    
            const sql2 = 'SELECT e.first_name, e.last_name FROM employee e, role r, department d WHERE e.role_id=r.id and r.department_id=d.id and d.name=?'
            const params = data.department;
    
            db.query(sql2, params, (err, rowDept) => {
            console.log(`
            `);
            console.table(rowDept);
            })        
            
            console.log(`
            `);
            init();
        });

        });

    }   
        //complete add employee code
        if (data.action === 'Add Employee') {
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
           });
           console.log(`
           `);
           init();
        });
        }
        if (data.action === 'Remove Employee') {

            let employeeArr = [];

            const sqlEmp = 'SELECT CONCAT(e.id, "-", e.first_name," ", e.last_name) as nameID FROM employee e'

            db.query(sqlEmp, (err, results) => {
                
                for (var i=0; i<results.length; i++){
                    employeeArr.push(results[i].nameID)
                }
                return inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    choices: employeeArr
                }
            ]).then(data => {
                const employeeIDObj = data.employee.split("-");
                const employeeID = employeeIDObj[0]

                db.query('DELETE FROM employee e where e.id = ?', [employeeID], (err, resultEmpDel) => {
                    if(err){
                        console.log(err)
                    }
                    console.log(`employee - ${employeeIDObj[1]} - deleted`);
                })

                console.log(`
                `);
                init();
            })
        })
        }
        if (data.action === 'Update Employee Role') {
            
        }
        if (data.action === 'View All Roles') {
            const sqlRole = 'SELECT DISTINCT r.title FROM role r'

            db.query(sqlRole, (err, resultRole) => {
                console.table(resultRole)
                console.log(`
                `);
                init();
            })

        }
        if (data.action === 'Add Role') {
            let deptSelector = [];
            
            const sqlDept = 'SELECT CONCAT (d.id,"-", d.name) as deptID FROM department d'
            db.query(sqlDept, (err, resultDept) => {
                for (var i=0; i<resultDept.length; i++){
                    deptSelector.push(resultDept[i].deptID)
                }
            
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
                    choices: deptSelector
                }
            ]).then(data => {
            const deptIDObj = data.department.split("-");
            const deptID = deptIDObj[0];
            const sqlRoleAdd ='INSERT INTO role  (title, salary, department_id) VALUES (?, ?, ?)'
            const paramsRoleAdd = [data.title, data.salary, deptID];

            db.query(sqlRoleAdd, paramsRoleAdd, (err, result) => {
                if (err){
                    console.log(err);
                }
                console.log(`${data.title} has been added!`);
                
                });
                console.log(`
                `);
                init();
            });
        })

        }
        //Remove Role
        if (data.action === 'Remove Role') {
            let roleSelector = [];

            db.query('SELECT CONCAT(r.id,"-",r.title) as roleID FROM role r', (err, resultRow) => {
                for (var i=0; i<resultRow.length; i++){
                    roleSelector.push(resultRow[i].roleID);
                }

            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'role_selection',
                    choices: roleSelector
                }
            ]).then(data => {
                //setup remove query
                const deletedRowObj = data.role_selection.split("-")
                const deletedRow = deletedRowObj[0];

                db.query('DELETE FROM role WHERE id = ?', deletedRow, (err, resultDelete) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(`${deletedRowObj[1]} has been deleted`);
                })
            })
        })
        console.log(`
        `);
        init();
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
greeting();