import * as service from '../services/ConfigurationService.js';
import Configuration from '../models/Configuration.js';
import Finder from '../models/Finder.js';

let intervalFnc;
let intervalId;

export function getConfig(req, res) {
    service.getConfig(req, res);
}

export function updateConfig(req, res) {
    service.updateConfig(req, res).then((newCfg) => {
        clearInterval(intervalId);
        intervalId = setInterval(intervalFnc, newCfg.flush_period * 3600 * 1000)
    });
}

/* Flush results after config.flush_period hours */
Configuration.findOne().then(config => {
    const flushPeriod = config?.flush_period * 3600 * 1000 || 3600 * 1000;

    intervalFnc = async () => {
        console.log("Flushing results...");
        let finders = await Finder.find({ createdAt: { $lt: new Date(new Date() - flushPeriod) } });
        Finder.updateMany({ _id: { $in: finders } }, { $set: { trips: [] } }).then(() => console.log("Results flushed"));
    }

    intervalId = setInterval(intervalFnc, flushPeriod);
});