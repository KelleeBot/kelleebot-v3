import { Giveaway } from "discord-giveaways";
import { GuildMember, MessageReaction } from "discord.js";
import { Client } from "../../util/client";
import { defaultRafflePoints } from "../../../config/config.json";
import { addPoints } from "../../util";

export default async (client: Client) => {
    client.giveaways.on("giveawayReactionAdded", (giveaway: Giveaway, member: GuildMember, reaction: MessageReaction) => {
        client.utils.log("WARNING", "INFO", `${member.user.tag} entered to giveaway #${giveaway.messageId} (${reaction.emoji.name})`);
    });

    client.giveaways.on("giveawayReactionRemoved", (giveaway: Giveaway, member: GuildMember, reaction: MessageReaction) => {
        client.utils.log("WARNING", "INFO", `${member.user.tag} unreacted to giveaway #${giveaway.messageId} (${reaction.emoji.name})`);
    });

    client.giveaways.on("giveawayEnded", (giveaway: Giveaway, winners: Array<GuildMember>) => {
        winners.forEach(async (winner) => {
            // Raffles
            if (giveaway.messages.giveaway?.includes("RAFFLE")) {
                const guildInfo = await client.guildInfo.get(winner.guild.id);
                const { gambling } = guildInfo;

                const newPoints = await addPoints(winner.guild.id, winner.id, gambling ? gambling.rafflePoints : defaultRafflePoints);
                client.utils.log(
                    "SUCCESS",
                    "INFO",
                    `${gambling ? gambling.rafflePoints : defaultRafflePoints} points have been given to ${
                        winner.user.tag
                    } and they now have ${newPoints}.`
                );
            }
        });
    });
};
