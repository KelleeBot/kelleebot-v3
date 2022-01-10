import { Client } from "../../util/client";
import { giveawayReactEmoji } from "../../../config/config.json";
import { CommandInteraction } from "discord.js";
import ms from "ms";

export const start = async (client: Client, interaction: CommandInteraction) => {
    const duration = interaction.options.getString("duration")!;
    const winners = interaction.options.getNumber("winners")!;
    const prize = interaction.options.getString("prize")!;
    const channel = interaction.options.getChannel("channel") ?? interaction.channel;

    if (isNaN(ms(duration)))
        return interaction.reply({ content: `"${duration}" is not a valid duration.`, ephemeral: true });

    if (channel?.type !== "GUILD_TEXT")
        return interaction.reply({ content: "You can only hold giveaways in text channels.", ephemeral: true });

    client.giveaways.start(channel, {
        duration: ms(duration),
        prize,
        winnerCount: winners,
        hostedBy: interaction.user,
        lastChance: {
            enabled: true,
            content: "⚠️ **LAST CHANCE TO ENTER !** ⚠️",
            threshold: 1000 * 60 * 5,
            embedColor: "#FF0000"
        },
        messages: {
            giveaway: `${giveawayReactEmoji}${giveawayReactEmoji} **GIVEAWAY** ${giveawayReactEmoji}${giveawayReactEmoji}`,
            giveawayEnded: `${giveawayReactEmoji}${giveawayReactEmoji} **GIVEAWAY ENDED** ${giveawayReactEmoji}${giveawayReactEmoji}`,
            drawing: "Giveaway ends **{timestamp}**",
            inviteToParticipate: `React with ${giveawayReactEmoji} to participate!`,
            winMessage: "Congratulations, {winners}! You won **{this.prize}**!",
            embedFooter: "Giveaways",
            noWinner: "Giveaway cancelled, no valid participants.",
            hostedBy: "Hosted by: {this.hostedBy}",
            winners: `${client.utils.pluralize(winners, "Winner")}:`,
            endedAt: "Ended at"
        }
    });
    return interaction.reply({ content: `Started a giveaway in ${channel}.`, ephemeral: true });
};