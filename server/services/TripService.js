import Application from "../models/Application.js";
import Trip from "../models/Trip.js";
import Question from "../models/Question.js";
import Reply from "../models/Reply.js";

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
    res.locals.oas.body.manager = res.locals.oas.security?.apikey.uid;
    Trip.create(res.locals.oas.body).then(async () => {
        res.status(201).send();
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
        if (trip.isPublished) {
            const applications = await Application.find({ trip: trip._id, status: "ACCEPTED" }) ?? [];
            if (new Date() < new Date(trip.startDate) || applications.length > 0) {
                return res.status(400).send({ message: "The trip has started or has applications accepted" });
            } else {
                return res.status(400).send({ message: "Trip cannot be modified after being published" });
            }
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
        if (trip.isPublished) return res.status(400).send({ message: "Trip cannot be modified after being published" });
        await trip.delete();
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function getQuestionsFromTrip(req, res) {
    Trip.findById(res.locals.oas.params.trip_id).then(async trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        res.send(trip.questions);
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function getQuestionsFromTripById(req, res) {
    Trip.findById(res.locals.oas.params.trip_id).then(async trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        const question = trip.questions.find(question => question._id == res.locals.oas.params.question_id);
        if (!question) return res.status(404).send({ message: "Question not found" });
        const actualQuestion = await Question.findById(question.toString());
        res.status(200).send(await actualQuestion.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function postQuestionFromTrip(req, res) {
    Trip.findById(res.locals.oas.params.trip_id).then(async trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });

        const question = new Question({
            owner: res.locals.oas.security?.apikey.uid || null,
            trip: trip._id,
            text: res.locals.oas.body.text
        })
        await question.save();
        trip.questions.push(question._id);
        await trip.save();
        res.status(204).send("Question added");
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function getQuestionsFromMyTrips(req, res) {
    console.log("TOKEN: " + es.locals.oas.security?.apikey.uid)
}

export function postReplyFromTrip(req, res) {
    Trip.findById(res.locals.oas.params.trip_id).then(async trip => {
        if (!res.locals.oas.security?.apikey.uid) return res.status(401).send({ message: "You must be logged in to reply questions" });
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        const question = trip.questions.find(question => question._id == res.locals.oas.params.question_id);
        if (!question) return res.status(404).send({ message: "Question not found" });
        const actualQuestion = await Question.findById(question.toString());
        const reply = new Reply({
            owner: res.locals.oas.security?.apikey.uid,
            text: req.body.text,
            question: actualQuestion._id.toString()
        });
        await reply.save();
        res.status(204).send("Reply added");
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export async function updateReplyFromTrip(req, res) {
    const token = res.locals.oas.security?.apikey.uid;
    const reply = await Reply.findById(res.locals.oas.params.reply_id)
    if (!reply) return res.status(404).send({ message: "Reply not found" });
    if (reply.owner != token) return res.status(401).send({ message: "You are not the owner of this reply" });
    reply.text = req.body.text;
    await reply.save();
    res.status(204).send("Reply updated");
}

export async function updateQuestionFromTrip(req, res) {
    const token = res.locals.oas.security?.apikey.uid;
    const question = await Question.findById(res.locals.oas.params.question_id)
    if (!question) return res.status(404).send({ message: "Question not found" });
    if (question.owner != token) return res.status(401).send({ message: "You are not the owner of this Question" });
    question.text = req.body.text;
    await question.save();
    res.status(204).send("Question updated");
}