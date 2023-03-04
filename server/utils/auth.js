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
            return await Actor.findById(paramValue).then(actor => actor?._id.toString() === decoded?.uid) ?? false;
        case "applicationActor":
            return await Actor.findById(decoded?.uid).then(actor => paramValue === actor?._id.toString()) ?? false;
        case "applicationId":
            if (decoded?.role === "Explorer") {
                return await Application.findById(paramValue).then(application => application?.actor?._id.toString() === decoded?.uid) ?? false;
            } else if (decoded?.role === "Manager") {
                const tripId = await Application.findById(paramValue).then(application => application?.trip?._id.toString());
                return await Actor.findById(decoded?.uid).then(actor => actor.managedTrips?.map(mt => mt.toString()).includes(tripId)) ?? false;
            }
        case "tripId":
            return await Trip.findById(paramValue).then(trip => trip.manager?.toString() === decoded?.uid) ?? false;
        case "finderId":
            return await Actor.findById(decoded?.uid).then(actor => actor.finders.includes(paramValue)) ?? false;
        case "sponsorshipId":
            return await Actor.findById(decoded?.uid).then(actor => actor.sponsorships.includes(paramValue)) ?? false;
        default:
            return false;
    }
}