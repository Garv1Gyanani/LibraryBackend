import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose'; // Ensure mongoose is imported

// Connect to MongoDB without deprecated options
mongoose.connect('mongodb://localhost:27017/hmm')
    .then(() => {
        console.log('Connected to MongoDB for session storage');
    })
    .catch(err => {
        console.error('MongoDB connection error for sessions:', err);
    });

const sessionMiddleware = session({
    secret: 'default-secret-key', // Replace with a strong secret key
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/hmm', // Change to your MongoDB connection string
        ttl: 7 * 24 * 60 * 60, // Session expiration time in seconds (7 days)
    }),
    cookie: {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time in milliseconds (7 days)
    },
});

export default sessionMiddleware;
