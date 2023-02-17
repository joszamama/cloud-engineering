import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    status: { type: String, enum: ["PENDING", "REJECTED", "DUE", "ACCEPTED", "CANCELLED"], default: "PENDING" },
    rejectReason: { type: String },
    rejectComment: { type: String },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
}, {
    timestamps: true,
    statics: {
        getRatiosByStatus: function () {
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
    }
});

ApplicationSchema.methods.cleanup = function () {
    return {
        id: this._id,
        status: this.status,
        rejectReason: this.rejectReason,
        rejectComment: this.rejectComment,
        createdAt: this.createdAt,
        trip: this.trip,
        actor: this.actor
    };
}

export default mongoose.model('Application', ApplicationSchema)