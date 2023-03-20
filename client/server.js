const express = require('express');
const firebase = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');

const app = express();
module.exports.deploy = async () => {
        
    // Initialize Firebase
    firebase.initializeApp({
        apiKey: "AIzaSyDD6MCXdo5xl_tDeMrmTP5HAbG8Tqt1GGo" // Apikey only identifies firebase app with google servers, not a security risk
    });

    app.use(express.json());

    app.post('/login', (req, res) => {
        signInWithCustomToken(getAuth(), req.body.token).then(user => {
            res.status(201).send(user);
        }).catch(err => {
            res.status(500).send({
                message: err.message
            });
        });
    });

    // Expose server in port 8081
    app.listen(8081, () => {
        console.log('Server listening on port 8081');
    });
}