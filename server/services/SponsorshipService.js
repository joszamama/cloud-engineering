import Sponsorship from '../models/Sponsorship.js';

export function getSponsorship(req, res) {
    Sponsorship.find(res.locals.oas.params.actor ? {actor: res.locals.oas.params?.actor} : {}).then(sponsorships => {
        res.send(sponsorships.map(sponsorship => sponsorship.cleanup()));
    }).catch(err => {
        console.log(err);
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function addSponsorship(req, res) {
    res.locals.oas.body.actor = res.locals.oas.security?.apikey.uid;
    delete res.locals.oas.body.isPaid;

    Sponsorship.create(res.locals.oas.body).then(() => {
        res.status(201).send();
    }).catch(err => {
        console.log(err);
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findSponsorshipBy_id(req, res) {
    Sponsorship.findOne({ _id: res.locals.oas.params._id }).then(sponsorship => {
        if (!sponsorship) return res.status(404).send({ message: "Sponsorship not found" });
        res.send(sponsorship.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateSponsorship(req, res) {
    Sponsorship.findById(res.locals.oas.params._id).then(sponsorship => {
        if (!sponsorship) return res.status(404).send({ message: "Sponsorship Not Found" });

        delete res.locals.oas.body.actor;
        delete res.locals.oas.body.trip;
        delete res.locals.oas.body.isPaid;
        Object.keys(res.locals.oas.body).forEach(key => sponsorship[key] = res.locals.oas.body[key]);

        sponsorship.save();
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function paySponsorship(req, res) {
    Sponsorship.findByIdAndUpdate(res.locals.oas.params._id, { isPaid: true }).then(sponsorship => {
        if (!sponsorship) return res.status(404).send({ message: "Sponsorship Not Found" });
        res.status(204).send();
    }).catch(err => {
        if (err.message === "Invalid sponsorship update") return res.status(400).send({ message: err.message });
        else return res.status(500).send({ message: err.message });
    });
}

export function deleteSponsorship(req, res) {
    Sponsorship.findByIdAndRemove(res.locals.oas.params._id).then(sponsorship => {
        if (!sponsorship) return res.status(404).send({ message: "Sponsorship Not Found" });
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}
