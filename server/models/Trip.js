import mongoose from "mongoose";
import { Stage } from "./Stage.js";

const TripSchema = new mongoose.Schema({
    ticker: {type: String, required: [true, "can't be blank"], unique: true, match: [/^[0-9]{6}-[A-Z]{4}$/, "is invalid"]},
    title: {type: String, required: [true, "can't be blank"]},
    description: {type: String, required: [true, "can't be blank"]},
    price: {type: Number, required: [true, "can't be blank"]},
    requirements: {type: [String], required: [true, "can't be blank"]},
    startDate: {type: Date, required: [true, "can't be blank"]},
    endDate: {type: Date, required: [true, "can't be blank"]},
    pictures: {type: [Buffer], required: [true, "can't be blank"]},
    cancelled: {type: Boolean, default: false},
    cancelReason: {type: String},
    stages: [Stage],
    manager: {type: mongoose.Schema.Types.ObjectId, ref: 'Actor'},
    finder: {type: mongoose.Schema.Types.ObjectId, ref: 'Finder'},
    sponsorships: [{type: mongoose.Schema.Types.ObjectId, ref: 'Sponsorship'}],
    applications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Application'}]

}, {timestamps: true});

TripSchema.methods.cleanup = function() {
    return {
        ticker: this.ticker,
        title: this.title,
        description: this.description,
        price: this.price,
        requirements: this.requirements,
        startDate: this.startDate,
        endDate: this.endDate,
        pictures: this.pictures,
        cancelled: this.cancelled,
        cancelReason: this.cancelReason,
        stages: this.stages,
        manager: this.manager,
        finder: this.finder,
        sponsorships: this.sponsorships,
        applications: this.applications
    };
}

export default mongoose.model('Trip', TripSchema)