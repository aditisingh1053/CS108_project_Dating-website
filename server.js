const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname)));

app.post('/register', (req, res) => {
    const { username, password, secret_question, secret_answer } = req.body;

    // Read the existing data from login.json
    fs.readFile(path.join(__dirname, 'login.json'), (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading login data');
            return;
        }

        let loginData = JSON.parse(data);

        // Check if the username already exists
        const existingUser = loginData.find(user => user.username === username);
        if (existingUser) {
            // Username already exists, send a message to retry
            res.send(`<script>alert('Username already exists. Please retry.'); window.location.href = '/register.html';</script>`);
            return;
        }

        // Username does not exist, add the new user
        const newUser = {
            username,
            password,
            secret_question,
            secret_answer
        };
        loginData.push(newUser);

        // Write the updated data back to login.json
        fs.writeFile(path.join(__dirname, 'login.json'), JSON.stringify(loginData, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing login data');
                return;
            }
            // Registration successful, redirect to login.html
            res.send(`<script>alert('Registration successful.'); window.location.href = '/login.html';</script>`);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

