import express, { Router } from 'express';
import User from './User.js';  // Corrected import statement
import sessionMiddleware from './Session.js';  // Adjust this path if necessary

const userRouter = Router();

// Use session middleware
userRouter.use(sessionMiddleware);

// Registration route
userRouter.post('/registerUser', async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ name, email, password, phone });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err); // Log the error
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});

// Login route
userRouter.post('/login', async (req, res) => {
    console.log('Received login request:', req.body); // Log incoming request
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }); // Look for user by email
        console.log('User found:', user); // Log the found user (should not be null)

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        req.session.userID = user._id; // Store user ID in session
        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error('Login error:', err); // Log the error
        res.status(500).json({ message: 'Internal Server Error', err });
    }
});

// Protected route example
userRouter.get('/protected', (req, res) => {
    if (!req.session.userID) {
        return res.status(401).json({ message: 'You must be logged in to access this resource' });
    }

    res.status(200).json({ message: 'You are authenticated and can access this resource' });
});

// Logout route
userRouter.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

export default userRouter;
