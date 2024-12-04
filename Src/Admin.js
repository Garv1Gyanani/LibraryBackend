import express, { Router } from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import Admin from './AdminModel.js';
import sessionMiddleware from './Session.js';

const AdminRouter = Router();
AdminRouter.use(sessionMiddleware);

AdminRouter.post('/registerAdmin', async (req, res) => {
    const { AdminName, email, password, phone } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const admin = new Admin({ AdminName, email, password, phone: String(phone) }); // Convert phone to string
        await admin.save();
        res.status(201).json({ message: 'Admin registered successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});

AdminRouter.post('/loginAdmin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Admin does not exist' }); // Fixed grammar
        }
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        req.session.adminID = admin._id;
        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

AdminRouter.get('/authenticatedAdmin', async (req, res) => {
    if (!req.session.adminID) {
        return res.status(401).json({ message: 'This admin is not authenticated' }); // Fixed grammar
    }
    res.status(200).json({ message: 'You are authenticated and can access this resource' });
});

AdminRouter.post('/AdminLogout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out', error: err.message });
        }
        res.status(200).json({ message: 'Successfully logged out' });
    });
});

export default AdminRouter;
