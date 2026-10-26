const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Frontend folder
app.use(express.static(path.join(__dirname, 'dist/Frontend')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Atlas connected successfully');

        app.listen(PORT, () => {
            console.log('Server running on port 3000');
        });
    })
    .catch((err) => {
        console.log('MongoDB connection failed:', err.message);
    });

// Employee schema
const employeeSchema = new mongoose.Schema({
    name: String,
    location: String,
    position: String,
    salary: String
});

const Employee = mongoose.model('Employee', employeeSchema);

// Get all employees
app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving employees' });
    }
});

// Get one employee
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving employee' });
    }
});

// Add an employee
app.post('/api/employeelist', async (req, res) => {
    try {
        const employee = new Employee(req.body);
        const savedEmployee = await employee.save();
        res.status(201).json(savedEmployee);
    } catch (err) {
        res.status(400).json({ message: 'Error adding employee' });
    }
});

// Delete an employee
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting employee' });
    }
});

// Update an employee
app.put('/api/employeelist', async (req, res) => {
    try {
        const { _id, name, location, position, salary } = req.body;

        if (!_id || !mongoose.isValidObjectId(_id)) {
            return res.status(400).json({ message: 'Valid employee ID required' });
        }

        const employee = await Employee.findByIdAndUpdate(
            _id,
            { name, location, position, salary },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: 'Error updating employee' });
    }
});

// Keep the frontend connection code
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist/Frontend/index.html'));
});


