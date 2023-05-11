import Application from "../models/Application.js";
import Trip from "../models/Trip.js";

export function getTrip(req, res) {
    if (res.locals.oas.params.search) {
        const regex = new RegExp(res.locals.oas.params.search, "i");

        if (res.locals.oas.params.exactMatch) {
            Trip.find({ $text: { $search: regex, $language: "none" }, startDate: {$gte: new Date()} }, { score: { $meta: "textScore" } })
                .sort({ score: { $meta: 'textScore' } }).exec()
                .then(async trips => {
                    let tripsPromises = trips.map(async trip => await trip.cleanup());
                    Promise.all(tripsPromises).then(trips => {
                        res.send(trips);
                    });
                }).catch(err => {
                    res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                        message: err.message
                    });
                });
        } else {
            Trip.find({ $or: [{ ticker: { $regex: regex } }, { title: { $regex: regex } }, { description: { $regex: regex } }], startDate: {$gte: new Date()}}).then(async trips => {
                let tripsPromises = trips.map(async trip => await trip.cleanup());
                Promise.all(tripsPromises).then(trips => {
                    res.send(trips);
                });
            }).catch(err => {
                res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                    message: err.message
                });
            });
        }
    } else {
        Trip.find({startDate: {$gte: new Date()}}).then(trips => {
            let tripsPromises = trips.map(async trip => await trip.cleanup());
            Promise.all(tripsPromises).then(trips => {
                res.send(trips);
            });
        }).catch(err => {
            res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                message: err.message
            });
        });
    }
}

export function addTrip(req, res) {
    res.locals.oas.body.manager = res.locals.oas.security?.apikey.uid;
    Trip.create(res.locals.oas.body).then(async (trip) => {
        res.status(201).send(await trip.cleanup());
    }).catch(err => {
        console.log(err.message)
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findById(req, res) {
    Trip.findOne({ _id: res.locals.oas.params._id }).then(async trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        res.send(await trip.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateTrip(req, res) {
    
    Trip.findById(res.locals.oas.params._id).then(async trip => {
        
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        
        if (new Date() >= new Date(trip.startDate)) {
            return res.status(400).send({ message: "The trip has started" });
        } 
        
        delete res.locals.oas.body.ticker;
        delete res.locals.oas.body.manager;
        Object.keys(res.locals.oas.body).forEach(key => trip[key] = res.locals.oas.body[key]);

        await trip.save();

        res.status(204).send();
    }).catch(err => {
        console.log(err)
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteTrip(req, res) {
    Trip.findById(res.locals.oas.params._id).then(async trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        await trip.delete();
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}
