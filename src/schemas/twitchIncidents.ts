import { model, Schema } from "mongoose";

const twitchIncidents = new Schema({
    _id: String,
    lastUpdate: Date,
    messageID: String,
    resolved: Boolean
});

export = model("twitchIncident", twitchIncidents);
