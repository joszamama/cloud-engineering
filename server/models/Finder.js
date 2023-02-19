import mongoose from "mongoose";

const FinderSchema = new mongoose.Schema({
    keyword: { type: String },
    priceFrom: { type: Number },
    priceTo: { type: Number },
    dateFrom: { type: Date },
    dateTo: { type: Date },
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

FinderSchema.index({ keyword: "text" })

export default mongoose.model('Finder', FinderSchema)