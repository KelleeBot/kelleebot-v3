import { model, Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
};

const reqObject = {
    type: [Object],
    required: true
};

const memberInfo = new Schema({
    guildID: reqString,
    userID: reqString,
    warnings: reqObject,
    mutes: reqObject,
    kicks: reqObject,
    softbans: reqObject,
    bans: reqObject,
    unbans: reqObject
});

export = model("member-info", memberInfo);