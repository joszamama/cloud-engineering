import mongoose from "mongoose";

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
    result: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }]
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

FinderSchema.pre('save', function (callback) {
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

export default mongoose.model('Finder', FinderSchema)