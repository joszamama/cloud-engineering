import mongoose from "mongoose";

const DashboardSchema = new mongoose.Schema({
    trip_average: { type: Number, required: true },
    trip_minium: { type: Number, required: true },
    trip_maximum: { type: Number, required: true },
    trip_deviation: { type: Number, required: true },
    application_average: { type: Number, required: true },
    application_minium: { type: Number, required: true },
    application_maximum: { type: Number, required: true },
    application_deviation: { type: Number, required: true },
    trip_price_average: { type: Number, required: true },
    trip_price_minium: { type: Number, required: true },
    trip_price_maximum: { type: Number, required: true },
    trip_price_deviation: { type: Number, required: true },
    ratio_by_status: { type: Number, required: true }
}, {
    timestamps: true,
    statics: { getApplicationMetrics, getTripMetrics, getPriceMetrics }
});

DashboardSchema.methods.cleanup = function() {
    return {
        id: this._id,
        trip_average: this.trip_average,
        trip_minium: this.trip_minium,
        trip_maximum: this.trip_maximum,
        trip_deviation: this.trip_deviation,
        application_average: this.application_average,
        application_minium: this.application_minium,
        application_maximum: this.application_maximum,
        application_deviation: this.application_deviation,
        trip_price_average: this.trip_price_average,
        trip_price_minium: this.trip_price_minium,
        trip_price_maximum: this.trip_price_maximum,
        trip_price_deviation: this.trip_price_deviation,
        ratio_by_status: this.ratio_by_status,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
}

export default mongoose.model('Dashboard', DashboardSchema);


/* Aggregation functions for dashboards */
function getApplicationMetrics() {
    return this.aggregate([
        {
            $facet: {
                totalCount: [
                    {
                        $group: {
                            _id: 0,
                            count: {
                                $count: {},
                            },
                        },
                    },
                ],
                groupCount: [
                    {
                        $group: {
                            _id: "$status",
                            count: { $count: {} },
                        },
                    },
                ],
            },
        },
        {
            $project: {
                ids: "$groupCount._id",
                ratios: {
                    $map: {
                        input: "$groupCount.count",
                        as: "group",
                        in: { $divide: ["$$group", { $first: "$totalCount.count" }] }
                    },
                },
            },
        },
    ]);
}

function getTripMetrics() {
    return this.aggregate({
        managedTrips: [
            {
                $group: {
                    _id: "$manager",
                    count: {
                        $count: {},
                    },
                },
            },
            {
                $group: {
                    _id: 0,
                    avg: {
                        $avg: "$count",
                    },
                    min: {
                        $min: "$count",
                    },
                    max: {
                        $max: "$count",
                    },
                    std: {
                        $stdDevSamp: "$count",
                    },
                },
            },
        ],
        tripsApplications: [
            {
                $group: {
                    _id: "$applications",
                    count: {
                        $count: {},
                    },
                },
            },
            {
                $group: {
                    _id: 0,
                    avg: {
                        $avg: "$count",
                    },
                    min: {
                        $min: "$count",
                    },
                    max: {
                        $max: "$count",
                    },
                    std: {
                        $stdDevSamp: "$count",
                    },
                },
            },
        ],
        tripsPrice: [
            {
                $group: {
                    _id: 0,
                    avg: {
                        $avg: "$price",
                    },
                    min: {
                        $min: "$price",
                    },
                    max: {
                        $max: "$price",
                    },
                    std: {
                        $stdDevSamp: "$price",
                    },
                },
            },
        ],
    })
}

function getPriceMetrics () {
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

