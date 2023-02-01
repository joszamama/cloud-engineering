import mongoose from "mongoose";

const FinderSchema = new mongoose.Schema({
    keyword: {type: String},
    priceFrom: {type: Number},
    priceTo: {type: Number},
    dateFrom: {type: Date},
    dateTo: {type: Date}
}, {timestamps: true});

FinderSchema.methods.cleanup = function() {
    return {
        id: this._id,
        keyword: this.keyword,
        priceFrom: this.priceFrom,
        priceTo: this.priceTo,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
}

module.exports = mongoose.model('Finder', FinderSchema)