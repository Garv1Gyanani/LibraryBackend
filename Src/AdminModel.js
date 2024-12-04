import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
    AdminName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String }, // Changed to String for phone
});

AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

AdminSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;
