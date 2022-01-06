import { model, Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
};

const dailyRewards = new Schema(
    {
        guildID: reqString,
        userID: reqString
    },
    {
        timestamps: true
    }
);

export = model("daily-rewards", dailyRewards);