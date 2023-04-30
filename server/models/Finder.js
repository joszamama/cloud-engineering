import mongoose from "mongoose";
import Actor from "./Actor.js";
import Sponsorship from "./Sponsorship.js";

/* Trip Schema */
const StageSchema = new mongoose.Schema({
    title: { type: String, required: [true, "can't be blank"] },
    description: { type: String, required: [true, "can't be blank"] },
    price: { type: Number, required: [true, "can't be blank"] }
}, { timestamps: true });

const TripSchema = new mongoose.Schema({
    ticker: { type: String, required: [true, "can't be blank"], match: [/^[0-9]{6}-[A-Z]{4}$/, "is invalid"] },
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
    stages: [StageSchema],
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
    sponsorships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sponsorship' }],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
}, { timestamps: true });

TripSchema.methods.cleanup = async function () {

    this.sponsorships = await Sponsorship.find({ _id: { $in: this.sponsorships }, isPaid: true }).exec();
    let randomIndex = Math.floor(Math.random() * this.sponsorships.length)
    this.sponsorships = this.sponsorships[randomIndex]

    return {
        id: this._id.toString(),
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
        applications: this.applications?.map(a => a.toString())
    };
}

/* Finder Schema */
const FinderSchema = new mongoose.Schema({
    keyword: { type: String },
    priceFrom: { type: Number },
    priceTo: { type: Number },
    dateFrom: { type: Date },
    dateTo: {
        type: Date,
        validate: {
            validator: function (value) {
                if (value !== null && this.dateFrom !== null) return value > this.dateFrom;
                else return true;
            },
            message: '{VALUE} must be after the start date'
        }
    },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
    result: [TripSchema]
}, { timestamps: true });

FinderSchema.methods.cleanup = async function () {
    return {
        actor: this.actor.toString(),
        id: this._id.toString(),
        keyword: this.keyword,
        priceFrom: this.priceFrom,
        priceTo: this.priceTo,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
        result: await Promise.all(this.result.map(t => t.cleanup()))
    };
}

FinderSchema.pre('save', async function (callback) {

    if (Object.keys(this.getChanges()?.["$set"] ?? {}).includes("createdAt")) {
        await Actor.findByIdAndUpdate(this.actor, { $push: { finders: this._id } }).exec();
    }

    const Trip = mongoose.model("Trip");
    const Configuration = mongoose.model("Configuration");

    let config = await Configuration.findOne();

    if (config) {
        const max_result = config.max_finder_result
        const regex = new RegExp(this.keyword, "i");
        const and = []
        const or = []

        if (this.keyword) {
            or.push({ ticker: { $regex: regex } })
            or.push({ title: { $regex: regex } })
            or.push({ description: { $regex: regex } })
            and.push({ $or: or })
        }

        if (this.dateFrom && this.dateTo) {
            and.push({
                startDate: {
                    $gte: new Date(this.dateFrom),
                    $lt: new Date(this.dateTo)
                },
                endDate: {
                    $gte: new Date(this.dateFrom),
                    $lt: new Date(this.dateTo)
                }
            })
        }

        if (this.priceFrom && this.priceTo) {
            and.push({
                price: {
                    $gte: this.priceFrom,
                    $lt: this.priceTo
                }
            })
        }

        const query = { $and: and }
        this.result = await Trip.find(query, null, { limit: max_result });
    }
})

FinderSchema.index({ keyword: "text" })

export default mongoose.model("Finder", FinderSchema);