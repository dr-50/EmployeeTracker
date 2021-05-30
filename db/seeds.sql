USE employeetracker;

INSERT INTO department
    (name)
VALUES
    ('Executive Board'),
    ('Sales'),
    ('Accounting'),
    ('Office Management') ;

INSERT INTO role
    (title, salary, department_id)
VALUES
    ('CEO', 150000, 1),
    ('President', 175000,1),
    ('Accountant', 70000, 2),
    ('Office Manager', 40000, 3),
    ('Sales Rep', 60000, 4);


INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Mossy', 'Ross', 1, NULL),
    ('Moss', 'McRoss', 2, NULL),
    ('Mo', 'Rossy', 3, 2),
    ('Rick', 'Ross', 4, 3),
    ('Bob', 'Ross', 5, 1);
