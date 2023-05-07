import Actor from "./models/Actor.js";
import Trip from "./models/Trip.js";
import Sponsorship from "./models/Sponsorship.js";
import Finder from "./models/Finder.js";
import Application from "./models/Application.js";

/* Populate function */
export async function populateDB() {
    const headers = { Authorization: `Bearer ${process.env.JSON_GENERATOR_TOKEN}` };
    await Promise.all([
        fetch("https://api.json-generator.com/templates/NMbSBEZ0vfT2/data", { headers }).then(response => response.json()), // trips
        fetch("https://api.json-generator.com/templates/zpaja69w8gpf/data", { headers }).then(response => response.json()), // sponsorships
        fetch("https://api.json-generator.com/templates/Wb9UyHBnbleF/data", { headers }).then(response => response.json()), // finders
        fetch("https://api.json-generator.com/templates/eH5svFguaoXD/data", { headers }).then(response => response.json()), // applications
        fetch("https://api.json-generator.com/templates/ylKLloo6pMaH/data", { headers }).then(response => response.json()) // actors
    ])
    .then(async ([trips, sponsorships, finders, applications, actors]) => {
        // Create relationships
        actors.forEach((actor) => {
            if (actor.role === "Manager") {
                actor.managedTrips = trips.map(trip => trip._id);
            } else if (actor.role === "Explorer") {
                actors.applications = applications.map(application => application._id);
                actor.finders = finders.map(finder => finder._id);
            } else if (actor.role === "Sponsor") {
                actor.sponsorships = sponsorships.map(sponsorship => sponsorship._id);
            }
        });

        trips.forEach((trip, idx) => {
            trip.manager = actors.find(actor => actor.role === "Manager")._id;
            trip.applications = applications.slice(idx * 5, idx * 5 + 5).map(application => application._id);
            trip.sponsorships = sponsorships.slice(idx * 5, idx * 5 + 5).map(sponsorship => sponsorship._id);
        });

        applications.forEach((application) => {
            application.actor = actors.find(actor => actor.role === "Explorer")._id;
            application.trip = trips.find(trip => trip.applications.includes(application._id))._id;
        });

        sponsorships.forEach((sponsorship) => {
            sponsorship.actor = actors.find(actor => actor.role === "Sponsor")._id;
            sponsorship.trip = trips.find(trip => trip.sponsorships.includes(sponsorship._id))._id;
        });

        finders.forEach((finder) => {
            finder.actor = actors.find(actor => actor.role === "Explorer")._id;
            finder.result = trips.filter(trip => {
                return (finder.keyword ? (trip.title.toLowerCase().includes(finder.keyword.toLowerCase()) || trip.description.toLowerCase().includes(finder.keyword.toLowerCase())) : true)
                && ((finder.priceFrom ? trip.price >= finder.priceFrom : true) && (finder.priceTo ? trip.price <= finder.priceTo : true))
                && ((finder.dateFrom ? new Date(trip.startDate) >= new Date(finder.dateFrom) : true) && (finder.dateTo ? new Date(trip.startDate) <= new Date(finder.dateTo) : true))
            })
        });

        // Insert data
        await Promise.all([
            Actor.deleteMany().then(() => Actor.insertMany(actors)),
            Trip.deleteMany().then(() => Trip.insertMany(trips)),
            Sponsorship.deleteMany().then(() => Sponsorship.insertMany(sponsorships)),
            Finder.deleteMany().then(() => Finder.insertMany(finders, { ordered: false })),
            Application.deleteMany().then(() => Application.insertMany(applications))
        ]).then(() => console.log("Database populated successfully"))
            .catch(error => console.log("Could not populate database: " + error))
    })
}