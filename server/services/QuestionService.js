import Actor from "../models/Actor.js";
import Trip from "../models/Trip.js";
import Application from "../models/Application.js";
import Question from "../models/Question.js";

export function getQuestion(req, res) {
    let role = res.locals.oas.security?.apikey?.role

    if (role === "Anonymous") {
        if (!req.query.trip) return res.status(400).send({ message: "TripId is required" });

        Question.find({ trip: req.query.trip }).then(questions => {
            let questionsPromises = questions.map(async question => await question.cleanup());
            Promise.all(questionsPromises).then(questions => {
                res.send(questions);
            });
        }).catch(err => {
            res.status(500).send({
                message: err.message
            });
        });
    } else if (role === "Explorer") {
        Actor.findById(res.locals.oas.security?.apikey.uid).then(actor => {
            Application.find({ actor: actor._id }).then(applications => {
                Trip.find({ _id: { $in: applications.map(application => application.trip) } }).then(applicatedTrips => {
                    Question.find({ trip: { $in: applicatedTrips }, ...(res.locals.oas.params.trip ? { trip: res.locals.oas.params.trip } : {}) }).then(questions => {
                        let questionsPromises = questions.map(async question => await question.cleanup());
                        Promise.all(questionsPromises).then(questions => {
                            res.send(questions);
                        });
                    }).catch(err => {
                        console.log("Error 1: ", err.message)
                        res.status(500).send({
                            message: err.message
                        });
                    });
                }).catch(err => {
                    console.log("Error 2: ", err.message)
                    res.status(500).send({
                        message: err.message
                    });
                });
            }).catch(err => {
                console.log("Error 3: ", err.message)
                res.status(500).send({
                    message: err.message
                });
            });
        });
    }
}

export function addQuestion(req, res) {
    res.locals.oas.body.author = res.locals.oas.security?.apikey.uid;
    Question.create(res.locals.oas.body).then(async () => {
        res.status(201).send();
    }).catch(err => {
        console.log(err.message)
        res.status(500).send({
            message: err.message
        });
    });
}

export function updateQuestion(req, res) {

    Question.findById(res.locals.oas.params._id).then(async question => {
        if (!question) return res.status(404).send({ message: "Question not found" });
        Object.keys(res.locals.oas.body).forEach(key => question[key] = res.locals.oas.body[key]);

        question.save().then(async () => {
            res.status(204).send();
        }).catch(err => {
            return res.status(500).send({
                message: err.message
            });
        });
    }).catch(err => {
        return res.status(500).send({
            message: err.message
        });
    });
}

export function banQuestion(req, res) {
    Question.findById(res.locals.oas.params._id).then(async question => {
        if (!question) return res.status(404).send({ message: "Question not found" });
        question.banned = true;

        question.save().then(async () => {
            res.status(204).send();
        }).catch(err => {
            return res.status(500).send({
                message: err.message
            });
        });
    }).catch(err => {
        return res.status(500).send({
            message: err.message
        });
    });
}