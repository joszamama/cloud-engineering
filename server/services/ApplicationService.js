import Application from '../models/Application.js';
import Trip from '../models/Trip.js';
import Actor from '../models/Actor.js';

export function getApplication(req, res) {
    if (res.locals.oas.security?.apikey.role === "Manager") {
        Actor.findById(res.locals.oas.security?.apikey.uid).then(actor => {
            Trip.find({ manager: actor._id }, null, { sort: { startDate: 1 } }).then(trips => {
                const managedTrips = trips.map(trip => trip._id);
                Application.find({ trip: { $in: managedTrips }, ...(res.locals.oas.params?.actor ? { actor: res.locals.oas.params.actor } : {}) }, null, { sort: { actor: 1, status: 1 } }).then(applications => {
                    res.send(applications.map(application => application.cleanup()));
                }).catch(err => {
                    res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                        message: err.message
                    });
                });
            }).catch(err => {
                res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                    message: err.message
                });
            });
        });
    } else {
        Application.find(res.locals.oas.params?.actor ? { actor: res.locals.oas.params.actor } : {}, null, { sort: { actor: 1, status: 1 } }).then(applications => {
            res.send(applications.map(application => application.cleanup()));
        }).catch(err => {
            res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                message: err.message
            });
        });
    }
}

export async function addApplication(req, res) {
    delete res.locals.oas.body.status;
    res.locals.oas.body.actor = res.locals.oas.security?.apikey.uid;
    const trip = await Trip.findById(res.locals.oas.body?.trip);
    let duplicatedApplication = await Application.findOne({ actor: res.locals.oas.security?.apikey.uid, trip: res.locals.oas.body?.trip, status: {$in: ["PENDING", "DUE", "ACCEPTED"]} })
    
    if (duplicatedApplication) return res.status(400).send({ message: "You have already applied to this trip" });
    if (!trip?.isPublished) return res.status(400).send({ message: "The trip you are trying to apply to is not published yet" });
    if (trip.startDate < new Date()) return res.status(400).send({ message: "The trip you are trying to apply to has already started" });
    if (trip.cancelled) return res.status(400).send({ message: "The trip you are trying to apply to has been cancelled" });

    Application.create(res.locals.oas.body).then((app) => {
        res.status(201).send(app.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findApplicationBy_id(req, res) {
    Application.findOne({ _id: res.locals.oas.params._id }).then(application => {
        if (!application) return res.status(404).send({ message: "Application not found" });
        res.send(application.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateApplication(req, res) {
    Application.findById(res.locals.oas.params._id).then(application => {
        if (!application) return res.status(404).send({ message: "Application Not Found" });

        delete res.locals.oas.body.actor;
        delete res.locals.oas.body.trip;
        Object.keys(res.locals.oas.body).forEach(key => application[key] = res.locals.oas.body[key]);

        application.save();
        res.status(204).send();
    }).catch(err => {
        if (err.message === "Invalid application update") return res.status(400).send({ message: err.message });
        else return res.status(500).send({ message: err.message });
    });
}

export function payApplication(req, res) {
    Application.findByIdAndUpdate(res.locals.oas.params._id, { status: "ACCEPTED" }).then(application => {
        if (!application) return res.status(404).send({ message: "Application Not Found" });
        res.status(204).send();
    }).catch(err => {
        if (err.message === "Invalid application update") return res.status(400).send({ message: err.message });
        else return res.status(500).send({ message: err.message });
    });
}

export function cancelApplication(req, res) {
    Application.findByIdAndUpdate(res.locals.oas.params._id, { status: "CANCELLED" }).then(application => {
        if (!application) return res.status(404).send({ message: "Application Not Found" });
        res.status(204).send();
    }).catch(err => {
        if (err.message === "Invalid application update") return res.status(400).send({ message: err.message });
        else return res.status(500).send({ message: err.message });
    });
}

export function deleteApplication(req, res) {
    Application.findByIdAndRemove(res.locals.oas.params._id).then(application => {
        if (!application) return res.status(404).send({ message: "Application Not Found" });
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}