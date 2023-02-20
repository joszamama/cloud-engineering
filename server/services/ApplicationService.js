import Application from '../models/Application.js';

export function getApplication(req, res) {
    Application.find().then(applications => {
        res.send(applications.map(application => application.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function addApplication(req, res) {
    Application.create(req.body).then(application => {
        res.send(application.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findApplicationBy_id(req, res) {
    Application.findOne({ _id: req.params._id }).then(application => {
        if (!application) return res.status(404).send({ message: "Application not found" });
        res.send(application.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateApplication(req, res) {
    Application.findByIdAndUpdate(req.params.applicationId, req.body, { new: true }).then(application => {
        if (!application) return res.status(404).send({ message: "Application Not Found" });
        res.send(application.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteApplication(req, res) {
    Application.findByIdAndRemove(req.params._id).then(application => {
        if (!application) return res.status(404).send({ message: "Application Not Found" });
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}