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
                return value > this.startDate;
            },
            message: '{VALUE} must be after the start date'
        }
    },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
    trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }]
}, {
    timestamps: true, statics: {
        getDashboardMetrics: function () {
            return this.aggregate([
                {
                    $facet: {
                        avgPriceStats: [
                            {
                                $group: {
                                    _id: 0,
                                    avgMinPrice: {
                                        $avg: "$priceFrom",
                                    },
                                    avgMaxPrice: {
                                        $avg: "$priceTo",
                                    },
                                    avgPriceRange: {
                                        $avg: {
                                            $subtract: [
                                                "$priceTo",
                                                "$priceFrom",
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                        top10Keywords: [
                            {
                                $sortByCount: "$keyword",
                            },
                            { $limit: 10 },
                        ],
                    },
                },
            ]);
        }
    }
});

FinderSchema.methods.cleanup = function () {
    return {
        id: this._id,
        keyword: this.keyword,
        priceFrom: this.priceFrom,
        priceTo: this.priceTo,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
        trips: this.trips,
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

            if (finder.date_from && finder.date_to) {
                and.push({
                    startDate: {
                        $gte: new Date(finder.date_from),
                        $lt: new Date(finder.date_to)
                    },
                    endDate: {
                        $gte: new Date(finder.date_from),
                        $lt: new Date(finder.date_to)
                    }
                })
            }

            if (finder.price_from && finder.price_to) {
                and.push({
                    price: {
                        $gte: finder.price_from,
                        $lt: finder.price_to
                    }
                })
            }

            const query = { $and: and }

            Trip.find(query, null, { limit: max_result },
                (err, trips) => {
                    if (trips) {
                        finder.trips = trips
                        callback()
                    }
                }
            )
        }
    })
})

FinderSchema.index({ keyword: "text" })

export default mongoose.model('Finder', FinderSchema)