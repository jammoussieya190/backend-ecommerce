const express = require('express');
const router = express.Router();
const SCategorie = require("../models/scategorie");
router.use(express.json());

// Afficher la liste des sous-catégories
router.get('/', async (req, res) => {
    try {
        const scat = await SCategorie.find({}, null, { sort: { '_id': -1 } }).populate("categorieID");
        res.status(200).json(scat);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Créer une nouvelle sous-catégorie
router.post('/', async (req, res) => {
    try {
        const { nomscategorie, imagescategorie, categorieID } = req.body;

        if (!nomscategorie || !imagescategorie || !categorieID) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        const newSCategorie = new SCategorie({ nomscategorie, imagescategorie, categorieID });
        await newSCategorie.save();
        res.status(201).json(newSCategorie);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Chercher une sous-catégorie par ID
router.get('/:scategorieId', async (req, res) => {
    try {
        const scat = await SCategorie.findById(req.params.scategorieId);
        res.status(200).json(scat);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Modifier une sous-catégorie
router.put('/:scategorieId', async (req, res) => {
    try {
        const scat1 = await SCategorie.findByIdAndUpdate(
            req.params.scategorieId,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(scat1);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Supprimer une sous-catégorie
router.delete('/:scategorieId', async (req, res) => {
    try {
        const id = req.params.scategorieId;
        await SCategorie.findByIdAndDelete(id);
        res.json({ message: "Sous-catégorie supprimée avec succès." });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Chercher une sous-catégorie par catégorie
router.get('/cat/:categorieID', async (req, res) => {
    try {
        const scat = await SCategorie.find({ categorieID: req.params.categorieID }).exec();
        res.status(200).json(scat);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;
