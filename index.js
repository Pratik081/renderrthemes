const express = require('express');
const cors = require('cors'); // Import the cors module
const fs = require('fs');
const path = require('path');
const { check, validationResult } = require('express-validator');

const app = express();
const port = 4172;
const router = express.Router();




app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
   // res.sendFile(path.join(__dirname, 'public', 'index.html'));
    const themes = readThemes();
    res.json(themes);// Corrected 'res.sendDate' to 'res.send("Welcome to the server")'
});

const themesFilePath = path.join(__dirname, 'themes.json');

const readThemes = () => {
    try {
        const data = fs.readFileSync(themesFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return [];
        } else {
            throw err;
        }
    }
};

const writeThemes = (themes) => {
    fs.writeFileSync(themesFilePath, JSON.stringify(themes, null, 2));
};

app.post('/bot/add-theme', [
    check('title').isLength({ min: 1 }).withMessage('Title is required'),
    check('image').isURL().withMessage('Invalid download link'),
    check('description').isLength({ min: 1 }).withMessage('Description is required'),
    check('downloadLink').isURL().withMessage('Invalid download link')
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }, (req, res) => {
    const { title, description, downloadLink } = req.body;
   
    const themes = readThemes();
    themes.push({ title, description, downloadLink });
    writeThemes(themes);
    console.log('Received data:', req.body);
    res.json({ message: 'Theme added successfully' });
  });

app.delete('/bot/delete-theme/:title', (req, res) => {
    const title = req.params.title;
    const themes = readThemes();
    const newThemes = themes.filter(theme => theme.title !== title);
    writeThemes(newThemes);
    res.json({ message: 'Theme deleted successfully' });
});

app.get('/get-themes', (req, res) => {
    const themes = readThemes();
    res.json(themes);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
