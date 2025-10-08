import mongoose from "mongoose";
const LoginDetailsSchema = new mongoose.Schema({
    emailid: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    authSalt: { type: [Number], required: true },
    encSalt: { type: [Number], required: true }
});
export const LoginDetails = mongoose.model('LoginDetails', LoginDetailsSchema);
