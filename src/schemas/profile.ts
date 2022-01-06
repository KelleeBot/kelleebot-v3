import { Schema, model } from "mongoose";
import { prefabProfile } from "../prefab/schemas";

const user = new Schema({
  _id: String,
  prefab: prefabProfile,
  isBlacklisted: {
    default: false,
    type: Boolean
  }
});

export = model("userSchema", user);
