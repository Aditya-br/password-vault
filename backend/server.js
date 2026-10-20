import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import { LoginDetails } from './models/logindetails.js'
import { Secrets } from './models/secrets.js'
import { timingSafeEqual, webcrypto } from "crypto";
const crypto = webcrypto;
dotenv.config()
const app = express()
const port = process.env.PORT || 5000
const CURRENT_KDF_ITERATIONS = 600000;
const LEGACY_KDF_ITERATIONS = 100000;
const loginChallenges = new Map();
const authenticatedSessions = new Map();
app.use(cors())
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err)
  })

app.get('/', (req, res) => {
  res.send('Hello World!')
})

function createSession(emailid) {
  const now = Date.now();
  for (const [token, session] of authenticatedSessions) {
    if (session.expiresAt <= now) authenticatedSessions.delete(token);
  }
  const token = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
  authenticatedSessions.set(token, {
    emailid,
    expiresAt: now + 60 * 60 * 1000
  });
  return token;
}

function requireAuth(req, res, next) {
  const authorization = req.get('Authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const session = authenticatedSessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    authenticatedSessions.delete(token);
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.authEmail = session.emailid;
  next();
}

app.post('/auth-challenge', async (req, res) => {
  try {
    const { emailid } = req.body;
    if (typeof emailid !== 'string' || !emailid.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await LoginDetails.findOne({ emailid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const challengeId = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
    const nonce = crypto.getRandomValues(new Uint8Array(32));
    const now = Date.now();
    for (const [id, challenge] of loginChallenges) {
      if (challenge.expiresAt <= now) loginChallenges.delete(id);
    }
    loginChallenges.set(challengeId, {
      emailid,
      nonce: Buffer.from(nonce).toString('base64'),
      expiresAt: now + 2 * 60 * 1000
    });

    res.status(200).json({
      challengeId,
      nonce: Buffer.from(nonce).toString('base64'),
      authSalt: user.authSalt,
      encSalt: user.encSalt,
      authIterations: user.authIterations || LEGACY_KDF_ITERATIONS,
      encIterations: user.encIterations || LEGACY_KDF_ITERATIONS
    });
  } catch (error) {
    console.error('Error creating login challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/removesecret', requireAuth, async (req, res) => {
  try {
    const { label } = req.body;
    const result = await Secrets.deleteOne({ emailid: req.authEmail, Label: label });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Secret not found' });
    }
    res.status(200).json({ message: 'Secret removed successfully' });
  } catch (error) {
    console.error('Error removing secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/showsecret', requireAuth, async (req, res) => {
  try {
    const secret = await Secrets.find({ emailid: req.authEmail });
    if (!secret) {
      return res.status(404).json({ error: 'Secret not found' });
    }
    res.status(200).json({ secrets: secret });
  } catch (error) {
    console.error('Error retrieving secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/getsecret', requireAuth, async (req, res) => {
  try {
    const { label } = req.body;
    const secret = await Secrets.findOne({ emailid: req.authEmail, Label: label });

    if (!secret) {
      return res.status(404).json({ error: 'Secret not found' });
    }

    // 🧠 FIX: Parse encodedPassword before sending
    const parsedPassword =
      typeof secret.encodedPassword === "string"
        ? JSON.parse(secret.encodedPassword)
        : secret.encodedPassword;

    res.status(200).json({
      encodedPassword: parsedPassword
    });
  } catch (error) {
    console.error("Error retrieving secret:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post('/generatepassword', requireAuth, async (req, res) => {
  try {
    const { label, username, url, note, encodedPassword } = req.body;
    if (!isValidSecretFields(req.authEmail, label, username, url) || !isValidEncryptedPassword(encodedPassword)) {
      return res.status(400).json({ error: 'Encrypted password is invalid' });
    }
    const newSecret = new Secrets({
      emailid: req.authEmail,
      Label: label,
      Username: username,
      URL: url,
      Note: note || "",
      encodedPassword: JSON.stringify(encodedPassword)
    });

    await newSecret.save();
    res.status(201).json({ message: 'Secret created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Secret already present' });
    }
    console.error('Error creating secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/createsecret', requireAuth, async (req, res) => {
  try {
    const { label, encodedPassword, note, username, url } = req.body;
    if (!isValidSecretFields(req.authEmail, label, username, url) || !isValidEncryptedPassword(encodedPassword)) {
      return res.status(400).json({ error: 'Encrypted password is invalid' });
    }
    const rec = await Secrets.findOne({ emailid: req.authEmail, Label: label });
    if (rec) {
      return res.status(409).json({ error: 'Secret already present' });
    }
    const newSecret = new Secrets({
      emailid: req.authEmail,
      Label: label,
      Username: username,
      URL: url,
      Note: note,
      encodedPassword: JSON.stringify(encodedPassword)
    });
    await newSecret.save();
    res.status(201).json({ message: 'Secret created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Secret already present' });
    }
    console.error('Error creating secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function isValidEncryptedPassword(cipher) {
  return cipher !== null &&
    typeof cipher === 'object' &&
    Array.isArray(cipher.iv) &&
    cipher.iv.length === 12 &&
    cipher.iv.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255) &&
    typeof cipher.data === 'string' &&
    cipher.data.length <= 1024 &&
    cipher.data.length > 0;
}

function isValidSecretFields(emailid, label, username, url) {
  return typeof emailid === 'string' &&
    emailid.length > 0 &&
    typeof label === 'string' &&
    label.trim().length > 0 &&
    typeof username === 'string' &&
    typeof url === 'string';
}

app.post('/signup', async (req, res) => {
  try {
    const { emailid, passwordHash, authSalt, encSalt, authIterations, encIterations } = req.body;
    if (
      typeof emailid !== 'string' ||
      !emailid.trim() ||
      typeof passwordHash !== 'string' ||
      !/^[A-Za-z0-9+/]{43}=$/.test(passwordHash) ||
      authIterations !== CURRENT_KDF_ITERATIONS ||
      encIterations !== CURRENT_KDF_ITERATIONS ||
      !Array.isArray(authSalt) ||
      authSalt.length !== 16 ||
      !authSalt.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255) ||
      !Array.isArray(encSalt) ||
      encSalt.length !== 16 ||
      !encSalt.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255)
    ) {
      return res.status(400).json({ error: 'Signup details are invalid' });
    }

    const newUser = new LoginDetails({
      emailid: emailid.trim(),
      passwordHash,
      authSalt,
      encSalt,
      authIterations,
      encIterations
    });
    await newUser.save();
    res.status(201).json({
      message: 'User created successfully',
      token: createSession(newUser.emailid)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'User already exists' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { emailid, challengeId, proof } = req.body;
    const challenge = loginChallenges.get(challengeId);
    loginChallenges.delete(challengeId);
    if (!challenge || challenge.emailid !== emailid || challenge.expiresAt <= Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired login challenge' });
    }

    const user = await LoginDetails.findOne({ emailid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const verifier = Buffer.from(user.passwordHash, 'base64');
    const suppliedProof = Buffer.from(typeof proof === 'string' ? proof : '', 'base64');
    const hmacKey = await crypto.subtle.importKey(
      'raw',
      verifier,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedProof = Buffer.from(await crypto.subtle.sign(
      'HMAC',
      hmacKey,
      Buffer.from(challenge.nonce, 'base64')
    ));
    if (suppliedProof.length !== expectedProof.length || !timingSafeEqual(suppliedProof, expectedProof)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.status(200).json({
      message: 'Login successful',
      token: createSession(user.emailid)
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
})
