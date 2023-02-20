import mongoose from "mongoose";
import Actor from "./models/Actor.js";
import Trip from "./models/Trip.js";
import Sponsorship from "./models/Sponsorship.js";
import Finder from "./models/Finder.js";
import Application from "./models/Application.js";

/* Connect to mongo and populate */
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL ?? 'mongodb://127.0.0.1:27017/default-db', {
    autoIndex: process.env.NODE_ENV === 'production' ? false : true 
}).then(() => {
    populateDB().then(() => mongoose.disconnect());
});

/* Populate function */
async function populateDB() {
    const headers = { Authorization: `Bearer ${process.env.JSON_GENERATOR_TOKEN}` };
    await Promise.all([
        fetch("https://api.json-generator.com/templates/NMbSBEZ0vfT2/data", {headers}).then(response => response.json()), // trips
        fetch("https://api.json-generator.com/templates/zpaja69w8gpf/data", {headers}).then(response => response.json()), // sponsorships
        fetch("https://api.json-generator.com/templates/Wb9UyHBnbleF/data", {headers}).then(response => response.json()), // finders
        fetch("https://api.json-generator.com/templates/eH5svFguaoXD/data", {headers}).then(response => response.json()), // applications
        fetch("https://api.json-generator.com/templates/ylKLloo6pMaH/data", {headers}).then(response => response.json()) // actors
    ])
    .then(async ([trips, sponsorships, finders, applications, actors]) => {
        // Create relationships
        actors.forEach((actor) => {
            if (actor.role === "Manager") {
                const shuffled = trips.sort(() => 0.5 - Math.random()).map(trip => trip._id);
                actor.managedTrips = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
                actor.managedTrips.forEach(tickerId => trips.find(trip => trip._id === tickerId).manager = actor._id);
            } else if (actor.role === "Explorer") {
                const shuffled = applications.sort(() => 0.5 - Math.random()).map(application => application._id);
                actor.applications = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
                actor.applications.forEach(applicationId => applications.find(application => application._id === applicationId).actor = actor._id);
                
                const shuffled2 = finders.sort(() => 0.5 - Math.random()).map(finder => finder._id);
                actor.finders = shuffled2.slice(0, Math.floor(Math.random() * 3) + 1);
                actor.finders.forEach(finderId => finders.find(finder => finder._id === finderId).actor = actor._id);
            } else if (actor.role === "Sponsor") {
                const shuffled = sponsorships.sort(() => 0.5 - Math.random()).map(sponsorship => sponsorship._id);
                actor.sponsorships = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
                actor.sponsorships.forEach(sponsorshipId => sponsorships.find(sponsorship => sponsorship._id === sponsorshipId).actor = actor._id);
            }
        });
    
        trips.forEach((trip) => {
            const shuffled = applications.filter(appl => appl.actor).sort(() => 0.5 - Math.random()).map(application => application._id);
            trip.applications = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
            trip.applications.forEach(applicationId => applications.find(application => application._id === applicationId).trip = trip._id);
    
            const shuffled2 = sponsorships.filter(sponsorship => sponsorship.actor).sort(() => 0.5 - Math.random()).map(sponsorship => sponsorship._id);
            trip.sponsorships = shuffled2.slice(0, Math.floor(Math.random() * 3) + 1);
            trip.sponsorships.forEach(sponsorshipId => sponsorships.find(sponsorship => sponsorship._id === sponsorshipId).trip = trip._id);
    
            const randomFinder = finders.filter(finder => finder.actor).sort(() => 0.5 - Math.random()).map(finder => finder._id)[0];
            finders.filter(finder => finder._id === randomFinder).forEach(finder => finder.trips = [...finder.trips, trip._id]);
        });
    
        // Exclude all entities with no relationships
        trips = trips.filter(trip => trip.applications.length !== 0 || trip.sponsorships.length !== 0 || !trip.manager);
        sponsorships = sponsorships.filter(sponsorship => sponsorship.trip && sponsorship.actor);
        finders = finders.filter(finder => finder.trips.length !== 0 && finder.actor);
        applications = applications.filter(application => application.trip && application.actor);
        actors = actors.filter(actor => actor.managedTrips.length !== 0 || actor.applications.length !== 0 || actor.sponsorships.length !== 0 || actor.finders.length !== 0);
        
        // Insert data
        await Promise.all([
            Actor.deleteMany({ _id: { $in: actors.map(a => a._id) }}).then(() => Actor.insertMany(actors)),
            Trip.deleteMany({ _id: { $in: trips.map(a => a._id) }}).then(() => Trip.insertMany(trips)),
            Sponsorship.deleteMany({ _id: { $in: sponsorships.map(a => a._id) }}).then(() => Sponsorship.insertMany(sponsorships)),
            Finder.deleteMany({ _id: { $in: finders.map(a => a._id) }}).then(() => Finder.insertMany(finders)),
            Application.deleteMany({ _id: { $in: applications.map(a => a._id) }}).then(() => Application.insertMany(applications))
        ]).then(() => console.log("Database populated successfully"))
        .catch(error => console.log("Could not populate database: " + error))
    })
    .catch(error => {
        console.log("Could not populate database: " + error)
    })
}