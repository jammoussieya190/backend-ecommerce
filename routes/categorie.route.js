const express = require('express');
const router = express.Router();
const Categorie = require('../models/categorie');

// Middleware pour parser les requêtes JSON et URL encodées
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Afficher la liste des catégories
const auth = require( "../middleware/auth.js"); 
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Categorie.find({}, null, { sort: { '_id': -1 } });
        res.status(200).json(categories);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});
// Créer une nouvelle catégorie
router.post('/', async (req, res) => {
    try {
        // Vérifier si le champ nomcategorie est fourni dans le corps de la requête
        if (!req.body.nomcategorie) {
            return res.status(400).json({ message: "Le champ 'nomcategorie' est requis." });
        }

        const { nomcategorie, imagecategorie } = req.body;
        const newCategorie = new Categorie({ nomcategorie, imagecategorie });
        await newCategorie.save();
        res.status(201).json(newCategorie); // Utilisation du code de statut 201 (Created) pour une nouvelle création réussie
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de la catégorie.", error: error.message });
    }
});


// Chercher une catégorie par ID
router.get('/:categorieId', async (req, res) => {
    try {
        const categorie = await Categorie.findById(req.params.categorieId);
        res.status(200).json(categorie);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Modifier une catégorie
router.put('/:categorieId', async (req, res) => {
    try {
        const updatedCategorie = await Categorie.findByIdAndUpdate(
            req.params.categorieId,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedCategorie);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Supprimer une catégorie
router.delete('/:categorieId', async (req, res) => {
    try {
        const id = req.params.categorieId;
        await Categorie.findByIdAndDelete(id);
        res.json({ message: "Categorie deleted successfully." });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;
