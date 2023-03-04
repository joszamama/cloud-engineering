import mongoose from "mongoose";
import Actor from "./Actor.js";

const StageSchema = new mongoose.Schema({
    title: {type: String, required: [true, "can't be blank"]},
    description: {type: String, required: [true, "can't be blank"]},
    price: {type: Number, required: [true, "can't be blank"]}
}, {timestamps: true});

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

FinderSchema.methods.cleanup = function () {
    return {
        id: this._id,
        keyword: this.keyword,
        priceFrom: this.priceFrom,
        priceTo: this.priceTo,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
        result: this.result,
        actor: this.actor
    };
}

FinderSchema.pre('save', async function (callback) {

    await Actor.findByIdAndUpdate(this.actor, { $push: { finders: this._id } }).exec();

    const Trip = mongoose.model("Trip");
    const Configuration = mongoose.model("Configuration");

    const finder = this

    Configuration.find({}, function (err, configurations) {
        if (configurations) {
            const max_result = configurations[0].max_finder_result

            const regex = new RegExp(finder.keyword, "i");

            const and = []
            const or = []

            if (finder.keyword) {
                or.push({ ticker: { $regex: regex } })
                or.push({ title: { $regex: regex } })
                or.push({ description: { $regex: regex } })
                and.push({ $or: or })
            }

            if (finder.dateFrom && finder.dateTo) {
                and.push({
                    startDate: {
                        $gte: new Date(finder.dateFrom),
                        $lt: new Date(finder.dateTo)
                    },
                    endDate: {
                        $gte: new Date(finder.dateFrom),
                        $lt: new Date(finder.dateTo)
                    }
                })
            }

            if (finder.priceFrom && finder.priceTo) {
                and.push({
                    price: {
                        $gte: finder.priceFrom,
                        $lt: finder.priceTo
                    }
                })
            }

            const query = { $and: and }

            Trip.find(query, null, { limit: max_result },
                (err, trips) => {
                    if (trips) {
                        finder.result = trips
                        callback()
                    }
                }
            )
        }
    })
})

FinderSchema.index({ keyword: "text" })

export default mongoose.model("Finder", FinderSchema);