import Actor from '../models/Actor.js';
import Trip from '../models/Trip.js';
import admin from 'firebase-admin';
import mongoose from 'mongoose';

export function login(_req, res) {
    const { email, password } = res.locals.oas?.body;
    Actor.findOne({ email }).then(async actor => {
        if (!actor) return res.status(404).send({ message: "Actor not found" });
        if (!actor.authenticate(password)) return res.status(401).send({ message: "Invalid password" });
        if (actor.banned) return res.status(401).send({ message: "This account has been banned." });
        admin.auth().createCustomToken(actor._id.toString(), { role: actor.role, language: actor.preferredLanguage }).then(token => {
            res.status(201).send(token);
        })
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function getActor(req, res) {
    Actor.find().then(actors => {
        res.send(actors.map(actor => actor.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function addActor(req, res) {
    let role = res.locals.oas.security?.apikey?.role

    if (![ "Anonymous", "Administrator" ].includes(role)) return res.status(403).send({ message: "Forbidden" });
    if (role === "Anonymous" && ![ "Explorer", "Sponsor" ].includes(res.locals.oas.body.role)) return res.status(403).send({ message: "Forbidden" });
    if (role === "Administrator" && ![ "Manager", "Administrator" ].includes(res.locals.oas.body.role)) return res.status(403).send({ message: "Forbidden" });
    
    Actor.create({ ...res.locals.oas.body, banned: false }).then((actor) => {
        res.status(201).send(actor.cleanup());
    }).catch(err => {
        if (err.message?.includes("duplicate key")) return res.status(409).send({ message: "Actor already exists" });
        else res.status(500).send({ message: err.message });
    });
}

export function findBy_id(req, res) {
    Actor.findOne({ _id: res.locals.oas.params._id }).then(async actor => {
        if (!actor) return res.status(404).send({ message: "Actor not found" });
        res.send(actor.cleanup());
    }).catch(async err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateActor(req, res) {
    if (res.locals.oas.security?.apikey?.role !== "Administrator") {delete res.locals.oas.body.banned; delete res.locals.oas.body.role}
    Actor.findByIdAndUpdate(res.locals.oas.params._id, res.locals.oas.body, { new: true }).then(async actor => {
        if (!actor) return res.status(404).send({ message: "Actor Not Found" });
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteActor(req, res) {
    Actor.findByIdAndRemove(res.locals.oas.params._id).then(actor => {
        if (!actor) return res.status(404).send({ message: "Actor Not Found" });
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteByEmail(req, res) {
    Actor.findOneAndDelete({ email: res.locals.oas.params.email }).then(actor => {
        if (!actor) return res.status(404).send({ message: "Actor Not Found" });
        res.status(204).send();
    }).catch(err => {
        console.log("Error: ", err);
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function moneyInPeriod(req, res) {
    let { _id, startDate, endDate } = res.locals.oas.params;

    Trip.aggregate([
        {
            $lookup: {
                from: "applications",
                localField: "applications",
                foreignField: "_id",
                as: "applications",
            },
        },
        {
            $match: {
                "applications.actor": mongoose.Types.ObjectId(_id),
                "applications.status": "ACCEPTED",
                "applications.updatedAt": {
                    $gte: new Date(startDate),
                    $lt: new Date(endDate),
                },
            },
        },
        {
            $group: {
                _id: 0,
                sum: { $sum: "$price" },
            },
        },
    ]).then(result => {
        res.send(result?.[0]?.sum || 0);
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function explorersInPeriod(req, res) {
    let { money, comparison, startDate, endDate } = res.locals.oas.params;
    let comp = {}

    if (comparison == '<') {
        comp["$lt"] = money
    } else if (comparison == '>') {
        comp["$gt"] = money
    } else if (comparison == '<=') {
        comp["$lte"] = money
    } else if (comparison == '>=') {
        comp["$gte"] = money
    } else if (comparison == '==') {
        comp["$eq"] = money
    } else if (comparison == '!=') {
        comp["$ne"] = money
    }

    Actor.aggregate([
        {
            $lookup: {
                from: 'applications',
                localField: 'applications',
                foreignField: '_id',
                as: 'applications'
            }
        },
        {
            $unwind: {
                path: "$applications",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'trips',
                localField: 'applications.trip',
                foreignField: '_id',
                as: 'applications.trip'
            }
        },
        {
            $match: {
                'applications.status': 'ACCEPTED',
                'applications.updatedAt': {
                    $gte: new Date(startDate),
                    $lt: new Date(endDate)
                }
            }
        },
        {
            $unwind: {
                path: "$applications.trip",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                sum: { $sum: '$applications.trip.price' }
            }
        },
        {
            $match: {
                sum: comp
            }
        }
    ]).then(result => {
        res.send(result);
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}