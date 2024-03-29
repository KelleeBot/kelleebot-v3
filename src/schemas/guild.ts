import { Schema, model } from "mongoose";
import { pointsToGive, defaultRafflePoints } from "../../config/config.json";
import { guildSettings } from "../prefab/schemas";

const guild = new Schema({
    _id: String,
    //settings: guildSettings,
    prefix: {
        default: "k!",
        type: String
    },
    announcementsChannel: {
        type: String
    },
    botLoggingChannel: {
        type: String
    },
    botChatChannel: {
        type: String
    },
    gambling: {
        gamblingChannel: String,
        gamblingLeaderboardChannel: String,
        monthlyPrize: String,
        dailyReward: {
            default: pointsToGive,
            type: Number
        },
        resetPointsMonthly: {
            default: false,
            type: Boolean
        },
        raffleChannel: String,
        rafflePoints: {
            default: defaultRafflePoints,
            type: Number
        },
        nitroLink: String,
        jackpotAmount: {
            default: 10000,
            type: Number
        }
    },
    genshinUID: {
        type: String
    },
    friendCode: {
        type: String
    },
    dreamAddress: {
        type: String
    },
    welcome: {
        channelID: String,
        text: String
    },
    streamerLive: {
        channelID: String,
        twitchChannel: String,
        message: String
    },
    tickets: {
        channelCategory: String,
        modRole: String
    },
    disabledCommands: Array,
    disabledChannels: Array,
    commandPerms: {},
    commandCooldowns: {},
    commandAlias: {}
});

export = model("guildSchema", guild);
