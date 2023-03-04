import Sponsorship from '../models/Sponsorship.js';

export function getSponsorship(req, res) {
    Sponsorship.find().then(sponsorships => {
        res.send(sponsorships.map(sponsorship => sponsorship.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function addSponsorship(req, res) {
    res.locals.oas.body.actor = res.locals.oas.security?.apikey.uid;

    Sponsorship.create(req.body).then(sponsorship => {
        res.send(sponsorship.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findSponsorshipBy_id(req, res) {
    Sponsorship.findOne({ _id: req.params._id }).then(sponsorship => {
        if (!sponsorship) return res.status(404).send({ message: "Sponsorship not found" });
        res.send(sponsorship.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateSponsorship(req, res) {
    Sponsorship.findById(req.params._id).then(sponsorship => {
        if (!sponsorship) return res.status(404).send({ message: "Sponsorship Not Found" });

        delete res.locals.oas.body.actor;
        delete res.locals.oas.body.trip;
        Object.keys(res.locals.oas.body).forEach(key => sponsorship[key] = res.locals.oas.body[key]);

        sponsorship.save();
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteSponsorship(req, res) {
    Sponsorship.findByIdAndRemove(req.params._id).then(sponsorship => {
        if (!sponsorship) return res.status(404).send({ message: "Sponsorship Not Found" });
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}
