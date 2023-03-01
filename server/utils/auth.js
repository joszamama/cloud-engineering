import { SecurityError } from "@oas-tools/commons";
import admin from "firebase-admin";
import Actor from "../models/Actor.js";
import Application from "../models/Application.js";
import Trip from "../models/Trip.js";

/* Security handler for Firebase IdToken verification */
export async function verifyIdToken(token) {
    const regex = /^Bearer\s/;
    if (regex.test(token)) {
        if (token === "Bearer anonymous") return { role: "Anonymous" };
        return await admin.auth().verifyIdToken(token.replace(regex, ""))
            .then(decodedToken => decodedToken)
            .catch(error => { throw new SecurityError(error) });
    } else {
        throw new SecurityError("Invalid token provided");
    }
}

/* Check ownership function */
export async function checkOwnership(decoded, paramName, paramValue) {
    switch (paramName) {
        case "actorId":
            return await Actor.findById(paramValue).then(actor => actor?.email === decoded?.email) ?? false;
        case "applicationActor":
            return await Actor.findOne({ email: decoded?.email }).then(actor => paramValue === actor?._id) ?? false;
        case "applicationId":
            if (decoded?.role === "Explorer") {
                return await Application.findById(paramValue).then(application => application?.actor?.email === decoded?.email) ?? false;
            } else if (decoded?.role === "Manager") {
                return await Actor.findOne({ email: decoded?.email }).then(actor => actor.trips.includes(paramValue)) ?? false;
            }
        case "ticker":
            return await Trip.findById(paramValue).then(trip => trip?.manager?.email === decoded?.email) ?? false;
        case "finderId":
            return await Actor.findOne({ email: decoded?.email }).then(actor => actor.finders.includes(paramValue)) ?? false;
        case "sponsorshipId":
            return await Actor.findOne({ email: decoded?.email }).then(actor => actor.sponsorships.includes(paramValue)) ?? false;
        default:
            return false;
    }
}