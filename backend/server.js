import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import { generateKey, encryptText } from './pass-encdec.js'
import { hashPassword } from './hash.js'
import { LoginDetails } from './models/logindetails.js'
import { Secrets } from './models/secrets.js'
import { webcrypto } from "crypto";
const crypto = webcrypto;
dotenv.config()
const app = express()
const port = 5000
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

app.post('/removesecret', async (req, res) => {
  try {
    const { emailid, label } = req.body;
    const result = await Secrets.deleteOne({ emailid, Label: label });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Secret not found' });
    }
    res.status(200).json({ message: 'Secret removed successfully' });
  } catch (error) {
    console.error('Error removing secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/showsecret', async (req, res) => {
  try {
    const { emailid } = req.body;
    const secret = await Secrets.find({ emailid });
    if (!secret) {
      return res.status(404).json({ error: 'Secret not found' });
    }
    res.status(200).json({ secrets: secret });
  } catch (error) {
    console.error('Error retrieving secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/getsecret', async (req, res) => {
  try {
    const { emailid, label } = req.body;
    const salt = await LoginDetails.findOne({ emailid }, { encSalt: 1, _id: 0 });
    const secret = await Secrets.findOne({ emailid: emailid, Label: label });

    if (!secret) {
      return res.status(404).json({ error: 'Secret not found' });
    }

    // 🧠 FIX: Parse encodedPassword before sending
    const parsedPassword =
      typeof secret.encodedPassword === "string"
        ? JSON.parse(secret.encodedPassword)
        : secret.encodedPassword;

    res.status(200).json({
      encodedPassword: parsedPassword,
      salt: salt.encSalt
    });
  } catch (error) {
    console.error("Error retrieving secret:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


const generatePassword = (length, useUppercase, useLowercase, useNumbers, useSpecial, useLookAlikes) => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  let pass = "";
  let arr = []
  if (useUppercase) arr.push(uppercaseChars);
  if (useLowercase) arr.push(lowercaseChars);
  if (useNumbers) arr.push(numberChars);
  if (useSpecial) arr.push(specialChars);
  while (pass.length < length) {
    const idx = Math.floor(Math.random() * 4);
    const len = arr[idx].length;
    const element = Math.floor(Math.random() * len);
    pass += arr[idx][element];
  }
  return pass
}
app.post('/generatepassword', async (req, res) => {
  try {
    const { emailid, masterPassword, label, length, useUppercase, useLowercase, useNumbers, useSpecial, useLookAlikes,username,url,note } = req.body;
    let password = generatePassword(length, useUppercase, useLowercase, useNumbers, useSpecial, useLookAlikes);
    const stored = await Secrets.find({ emailid }, { encodedPassword: 1, _id: 0 });
    const user = await LoginDetails.findOne({ emailid });
    const salt = new Uint8Array(user.encSalt);
    const { key } = await generateKey(masterPassword, salt);
    while (encryptText(password, key) in stored) {
      password = generatePassword(length, useUppercase, useLowercase, useNumbers, useSpecial, useLookAlikes);
    }
    const encryptedPassword = await encryptText(password, key);
    const newSecret = new Secrets({
      emailid,
      Label: label,
      Username: username,
      URL: url,
      Note: note || "",
      encodedPassword: JSON.stringify(encryptedPassword)
    });

    await newSecret.save();
    res.status(201).json({ message: 'Secret created successfully', password });
  } catch (error) {
    console.error('Error creating secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/createsecret', async (req, res) => {
  try {
    const { emailid, label, password, masterPassword, note, username, url } = req.body;
    const user = await LoginDetails.findOne({ emailid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const rec = await Secrets.findOne({ emailid, label });
    if (rec) {
      return res.status(401).json({ error: 'Secret already present' });
    }
    const salt = new Uint8Array(user.encSalt);
    const { key } = await generateKey(masterPassword, salt);
    const encryptedPassword = await encryptText(password, key);
    const newSecret = new Secrets({
      emailid,
      Label: label,
      Username: username,
      URL: url,
      Note: note,
      encodedPassword: JSON.stringify(encryptedPassword)
    });
    await newSecret.save();
    res.status(201).json({ message: 'Secret created successfully' });
  } catch (error) {
    console.error('Error creating secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/signup', (req, res) => {
  const { emailid, password } = req.body
  console.log("Email:", emailid, " Password:", password);
  const loginsalt = crypto.getRandomValues(new Uint8Array(16));
  const encsalt = crypto.getRandomValues(new Uint8Array(16));
  LoginDetails.findOne({ emailid }).then(user => {
    if (user) {
      return res.status(409).json({ error: 'User already exists' });
    }
  });
  hashPassword(password, loginsalt).then(hash => {
    const newUser = new LoginDetails({
      emailid: emailid,
      passwordHash: hash,
      authSalt: Array.from(loginsalt),
      encSalt: Array.from(encsalt)
    });
    newUser.save().then(() => {
      res.status(201).json({ message: 'User created successfully' });
    }).catch(err => {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  });
})

app.post('/login', (req, res) => {
  const { emailid, password } = req.body
  LoginDetails.findOne({ emailid }).then(user => {
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    hashPassword(password, new Uint8Array(user.authSalt)).then(hash => {
      if (hash !== user.passwordHash) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      res.status(200).json({ message: 'Login successful' });
    });
  }).catch(err => {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  });
})

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
})
