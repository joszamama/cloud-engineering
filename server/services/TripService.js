import Application from "../models/Application.js";
import Trip from "../models/Trip.js";

export function getTrip(req, res) {
    if (res.locals.oas.params.search) {
        const regex = new RegExp(res.locals.oas.params.search, "i");

        if (res.locals.oas.params.exactMatch) {
            Trip.find({ $text: { $search: regex, $language: "none" } }, { score: { $meta: "textScore" } })
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
            Trip.find({ $or: [{ ticker: { $regex: regex } }, { title: { $regex: regex } }, { description: { $regex: regex } }] },).then(async trips => {
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
        Trip.find().then(trips => {
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
    req.body.manager = res.locals.oas.security?.apikey.uid;
    Trip.create(req.body).then(async trip => {
        res.status(201).send();
    }).catch(err => {
        console.log(err.message)
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findById(req, res) {
    Trip.findOne({ _id: req.params._id }).then(async trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        res.send(await trip.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateTrip(req, res) {
    Trip.findById(req.params._id).then(async trip => {

        if (!trip) return res.status(404).send({ message: "Trip not found" });
        if (trip.isPublished) {
            const applications = await Application.find({ trip: trip._id, status: "ACCEPTED" }) ?? [];
            if (new Date() < new Date(trip.startDate) || applications.length > 0) {
                return res.status(400).send({ message: "The trip has started or has applications accepted" });
            } else {
                return res.status(400).send({ message: "Trip cannot be modified after being published" });
            }
        }
        
        Object.keys(res.locals.oas.body).forEach(key => trip[key] = res.locals.oas.body[key]);

        await trip.save();

        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteTrip(req, res) {
    Trip.findById(req.params._id).then(async trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        if (trip.isPublished) return res.status(400).send({ message: "Trip cannot be modified after being published" });
        await trip.delete();
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}