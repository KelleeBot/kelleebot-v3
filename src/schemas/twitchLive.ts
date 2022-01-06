import { model, Schema } from "mongoose";

const twitchLive = new Schema({
    //Guild ID
    _id: String,
    messageID: String,
    liveChannels: Array
});

export = model("twitchLive", twitchLive, "twitchLive");