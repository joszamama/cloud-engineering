import mongoose from "mongoose";

const FinderSchema = new mongoose.Schema({
    keyword: {type: String},
    priceFrom: {type: Number},
    priceTo: {type: Number},
    dateFrom: {type: Date},
    dateTo: {type: Date},
    actor: {type: mongoose.Schema.Types.ObjectId, ref: 'Actor'},
    trips: [{type: mongoose.Schema.Types.ObjectId, ref: 'Trip'}]
}, {timestamps: true});

FinderSchema.methods.cleanup = function() {
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