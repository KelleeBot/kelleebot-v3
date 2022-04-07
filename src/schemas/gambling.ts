import { model, Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
};

const gambling = new Schema({
    guildID: reqString,
    userID: reqString,
    points: {
        type: Number,
        required: true
    }
});

export = model("points", gambling);
