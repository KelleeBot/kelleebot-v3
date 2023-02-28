import { model, Schema } from "mongoose";

const scams = new Schema(
    {
        _id: String
    },
    { strict: false }
);

export = model("scamLinks", scams);
