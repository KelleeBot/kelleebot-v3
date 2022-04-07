import { Schema, model } from "mongoose";
//import { userProfile } from "../prefab/schemas";

const user = new Schema({
    _id: String,
    language: {
        default: "english",
        type: String
    },
    embedColor: {
        default: "DEFAULT",
        type: String
    },
    isBlacklisted: {
        default: false,
        type: Boolean
    }
});

export = model("userSchema", user);
