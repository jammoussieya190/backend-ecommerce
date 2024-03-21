const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.use(express.json());

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, avatar } = req.body;

        // Validation des données d'entrée
        if (!name || !email || !password || !role || !avatar) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        // Vérification si l'utilisateur existe déjà
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).send({ success: false, message: "Account already exists" });
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, password: hash, role, avatar });

        // Enregistrer l'utilisateur dans la base de données
        await newUser.save();

        return res.status(201).send({ success: true, message: "Account created successfully", user: newUser });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Generate Token
const generateToken = (user) => {
    return jwt.sign({ user }, process.env.TOKEN, { expiresIn: '6ms' });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign({ user }, process.env.REFRESH_TOKEN, { expiresIn: '6y' });
};

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation des données d'entrée
        if (!email || !password) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        // Trouver l'utilisateur dans la base de données par email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, message: "Account doesn't exists" });
        }

        // Comparer le mot de passe hashé
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Please verify your credentials" });
        }

        // Générer le token JWT et le token de rafraîchissement, puis les renvoyer avec les informations de l'utilisateur
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        return res.status(200).json({ success: true, token, refreshToken, user });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Refresh Token
router.post('/refreshToken', async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.status(404).json({ success: false, message: 'Token Not Found' });
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
            if (err) {
                return res.status(406).json({ success: false, message: 'Unauthorized Access' });
            } else {
                const token = generateToken(user);
                const newRefreshToken = generateRefreshToken(user);
                res.status(200).json({ token, refreshToken: newRefreshToken });
            }
        });
    }
});

module.exports = router;
