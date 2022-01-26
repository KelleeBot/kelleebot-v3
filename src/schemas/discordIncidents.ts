
import { model, Schema } from "mongoose";

const discordIncidents = new Schema({
    _id: String,
    lastUpdate: Date,
    messageID: String,
    resolved: Boolean
});

export = model("discordIncident", discordIncidents);