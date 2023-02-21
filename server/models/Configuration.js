import mongoose from "mongoose";

const ConfigurationSchema = new mongoose.Schema({
    flat_rate: {type: Number, min: 0, max: 100},
    flush_period: {type: Number, default: 24, min: 0, max: 24},
    max_finder_result: {type: Number, default: 100, min: 1, max: 100},
}, {timestamps: true});

ConfigurationSchema.methods.cleanup = function() {
    return {
        flat_rate: this.flat_rate,
        flush_period: this.flush_period,
        max_finder_result: this.max_finder_result
    };
}

export default mongoose.model('Configuration', ConfigurationSchema)