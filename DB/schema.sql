CREATE DATABASE IF NOT EXISTS mycompany;

USE mycompany;

CREATE TABLE departments (
dept_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
dept_name VARCHAR(255)  NOT NULL
);

CREATE TABLE employees (
emp_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
first_name VARCHAR(100)  NOT NULL,
last_name VARCHAR(100)  NOT NULL,
dept_id INT  NOT NULL,
birth_date DATE,
salary FLOAT,
hire_date TIMESTAMP  NOT NULL,
  FOREIGN KEY (dept_id) REFERENCES departments (dept_id)
);

CREATE TABLE Consensus_Node_Log (
id SERIAL PRIMARY KEY,
command TEXT NOT NULL
);
