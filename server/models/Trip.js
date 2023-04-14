import mongoose from "mongoose";
import Actor from "./Actor.js";
import Application from "./Application.js";
import Sponsorship from "./Sponsorship.js";
import { Stage } from "./Stage.js";

const TripSchema = new mongoose.Schema({
    ticker: { type: String, unique: true, match: [/^[0-9]{6}-[A-Z]{4}$/, "is invalid"] },
    title: { type: String, required: [true, "can't be blank"] },
    description: { type: String, required: [true, "can't be blank"] },
    price: Number,
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
    pictures: [Buffer],
    cancelled: { type: Boolean, default: false },
    cancelReason: { type: String },
    isPublished: { type: Boolean, default: false },
    stages: [Stage],
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
    sponsorships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sponsorship' }],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

TripSchema.methods.cleanup = async function () {

    this.sponsorships = await Sponsorship.find({ _id: { $in: this.sponsorships }, isPaid: true }).exec();
    let randomIndex = Math.floor(Math.random() * this.sponsorships.length)
    this.sponsorships = this.sponsorships[randomIndex]

    return {
        ticker: this.ticker,
        title: this.title,
        description: this.description,
        price: this.price,
        requirements: this.requirements,
        startDate: this.startDate?.toISOString(),
        endDate: this.endDate?.toISOString(),
        pictures: this.pictures?.map(b => b.toJSON()),
        cancelled: this.cancelled,
        cancelReason: this.cancelReason,
        isPublished: this.isPublished,
        stages: this.stages,
        manager: this.manager?.toString(),
        sponsorships: this.sponsorships?.map(s => s.toString()),
        applications: this.applications?.map(a => a.toString()),
        questions: this.questions?.map(q => q.toString()),
    };
}

TripSchema.pre('save', async function () {

    if (this.cancelled && !this.cancelReason) throw new Error("Cancel reason is required when cancelling a trip")
    if (!this.cancelled && this.cancelReason) this.cancelReason = undefined

    if (this.cancelled) await Application.updateMany({ trip: this._id }, { status: "CANCELLED" }).exec();

    this.price = this.stages?.reduce((acc, stage) => acc + stage.price, 0);

    const date = new Date()
    this.ticker = this.ticker ?? `${date.getFullYear().toString().substr(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4).toUpperCase()}`

    if (Object.keys(this.getChanges()?.["$set"] ?? {}).includes("createdAt")) {
        await Actor.findByIdAndUpdate(this.manager, { $push: { managedTrips: this._id } }).exec();
    }
});

TripSchema.index({ ticker: "text", title: "text", description: "text" }, { name: "trip_text_search_index", weights: { ticker: 10, title: 5, description: 1 } })

export default mongoose.model('Trip', TripSchema)
export const Trip = TripSchema;