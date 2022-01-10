import { Client } from "../../util/client";
import { giveawayReactEmoji } from "../../../config/config.json";
import { TextChannel } from "discord.js";
import ms from "ms";
import cron from "cron";

export default (client: Client) => {
    new cron.CronJob(
        "00 00 9-22/4 * * *",
        () => execute(client),
        null,
        true,
        "America/Denver"
    );
};

const execute = async (client: Client) => {
    client.guilds.cache.forEach(async (guild) => {
        let guildInfo = await client.guildInfo.get(guild.id);
        if (!guildInfo.gambling) return;

        const { gamblingChannel, raffleChannel, rafflePoints } = guildInfo.gambling;
        const gamblingChan = client.channels.cache.get(gamblingChannel) as TextChannel;
        const raffleChan = client.channels.cache.get(raffleChannel) as TextChannel;

        if (!gamblingChan || !raffleChan) return;

        const giveawayDuration = "30m";
        const giveawayNumberWinners = 1;
        const giveawayPrize = `${rafflePoints} Points`;

        client.giveaways.start(raffleChan, {
            duration: ms(giveawayDuration),
            prize: giveawayPrize,
            winnerCount: giveawayNumberWinners,
            hostedBy: client.user!,
            lastChance: {
                enabled: true,
                content: "⚠️ **LAST CHANCE TO ENTER !** ⚠️",
                threshold: 1000 * 60 * 5,
                embedColor: "#FF0000"
            },
            messages: {
                giveaway: `${giveawayReactEmoji}${giveawayReactEmoji} **RAFFLE** ${giveawayReactEmoji}${giveawayReactEmoji}`,
                giveawayEnded: `${giveawayReactEmoji}${giveawayReactEmoji} **RAFFLE ENDED** ${giveawayReactEmoji}${giveawayReactEmoji}`,
                drawing: "Raffle ends **{timestamp}**",
                inviteToParticipate: `React with ${giveawayReactEmoji} to participate!`,
                winMessage: "Congratulations, {winners}! You won **{this.prize}**! I have automatically added the points to your account. Happy gambling! 🥳🥳",
                embedFooter: "Raffles",
                noWinner: "Raffle cancelled, no valid participants.",
                hostedBy: "Hosted by: {this.hostedBy}",
                winners: `${client.utils.pluralize(giveawayNumberWinners, "Winner")}:`,
                endedAt: "Ended at"
            }
        });
        await gamblingChan.send({ content: `A raffle has started in ${raffleChan}!` });
    });
};
