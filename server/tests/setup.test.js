import server from "../server.js";
import client from "../../client/server.js";
import admin from "firebase-admin";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Trip from "../models/Trip.js";
import Actor from "../models/Actor.js";
//import { populateDB } from "../populateDB.js";

// Environment setup
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/test";
dotenv.config({ path: ".env.test" });

// Check .env.test variables
if (!process.env.FIREBASE_CREDENTIALS || !process.env.JSON_GENERATOR_TOKEN) {
    console.log("Missing required environment variables");
    process.exit(1);
}

// Initialize Firebase
const firebaseConfig = JSON.parse(Buffer.from(process.env.FIREBASE_CREDENTIALS, 'base64').toString());
admin.initializeApp({credential: admin.credential.cert(firebaseConfig)})

// Connect to database
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL ?? 'mongodb://127.0.0.1:27017/default-db', {
    autoIndex: process.env.NODE_ENV === 'production' ? false : true
}).then(async () => {
    //await populateDB();

    // Create manager and trip 
    await Actor.create({
        _id:  "5f9f1b9b9b9b9b9b9b9b9b9a",
        name: "Manager",
        surname: "Manager",
        password: "test1234",
        email: "manager@gmail.com",
        role: "Manager",
        phone: "+34 123456780",
        address: "Calle test 123",
        banned: false,
        preferredLanguage: "English"})
    
    await Trip.create({
        _id: "5f9f1b9b9b9b9b9b9b9b9b9b",
        title: "Test trip",
        description: "Test description",
        requirements: [],
        startDate: new Date(new Date().getMilliseconds() + 1000000),
        endDate: new Date(new Date().getMilliseconds() + 5000000),
        pictures: [],
        cancelled: false,
        isPublished: true,
        stages: [],
    });
        
    // Cleans db after tests
    const oldExit = process.exit;
    process.exit = async (code) => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
        oldExit(code);
    };

    // Starts client
    await client.deploy().catch(err => { console.log(err); });

    // Starts server
    await server.deploy(process.env.NODE_ENV).catch(err => { console.log(err); });
});