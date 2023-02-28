import mongoose from "mongoose";
import { Stage } from "./Stage.js";

const TripSchema = new mongoose.Schema({
    ticker: { type: String, required: [true, "can't be blank"], unique: true, match: [/^[0-9]{6}-[A-Z]{4}$/, "is invalid"] },
    title: { type: String, required: [true, "can't be blank"] },
    description: { type: String, required: [true, "can't be blank"] },
    price: { type: Number, required: [true, "can't be blank"] },
    requirements: { type: [String], required: [true, "can't be blank"] },
    startDate: { type: Date, required: [true, "can't be blank"] },
    endDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: '{VALUE} must be after the start date'
        },
        required: [true, "can't be blank"]
    },
    pictures: { type: [Buffer], required: [true, "can't be blank"] },
    cancelled: { type: Boolean, default: false },
    cancelReason: { type: String },
    isPublished: { type: Boolean, default: false },
    stages: [Stage],
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
    sponsorships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sponsorship' }],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
}, { timestamps: true });

TripSchema.methods.cleanup = function () {
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
        isPublished: this.isPublished,
        stages: this.stages,
        manager: this.manager,
        sponsorships: this.sponsorships,
        applications: this.applications,
    };
}

TripSchema.index({ ticker: "text", title: "text", description: "text" }, { name: "trip_text_search_index", weights: { ticker: 10, title: 5, description: 1 } })

export default mongoose.model('Trip', TripSchema)
export const Trip = TripSchema;