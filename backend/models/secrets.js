import mongoose from "mongoose";
const SecretsSchema = new mongoose.Schema({
    emailid: { type: String, required: true },
    Label: { type: String, required: true },
    Username: { type: String, required: true },
    URL: { type: String, required: true },
    Note: { type: String, required: false },
    encodedPassword: { type: String, required: true },
});

// Compound unique index to allow multiple secrets per user
SecretsSchema.index({ emailid: 1, Label: 1 }, { unique: true });

export const Secrets = mongoose.model('Secrets', SecretsSchema);

