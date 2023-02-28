import { model, Schema } from "mongoose";

const youtubeNotifications = new Schema({
    videoID: { type: String, required: true },
    guildID: { type: String, required: true }
});

export = model("youtubeNotifications", youtubeNotifications);
