import Discord, { MessageEmbed, Snowflake, TextChannel } from "discord.js";
import cron from "cron";
import gambling from "../../schemas/gambling";
import { Client } from "../../util/client";
import { stripIndents } from "common-tags";
import { timeZone } from "../../../config/config.json";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import { Guild } from "../../types/guild";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);

export default (client: Client) => {
    new cron.CronJob(
        "00 00 00 1 * *",
        () => execute(client),
        null,
        true,
        timeZone
    );
};

const execute = async (client: Client) => {
    const guildId = "707103910686621758"; // Lunar Circle
    const channelId = "724484131643457650";
    const masterGamblerRoleID = "795356217978388511";

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    try {
        const guildInfo = await client.guildInfo.get(guildId);
        if (!guildInfo.gambling) return;

        const { monthlyPrize } = guildInfo.gambling;
        const channel = client.channels.cache.get(channelId) as TextChannel;
        if (!channel) return;

        const winner = await fetchWinner(guildId);
        if (!winner) return;

        const { userID, points } = winner;
        const month = dayjs().tz(timeZone).subtract(1, "months").format("MMMM");

        channel.send({
            content: `Congrats to <@${userID}> for having the most points (${points.toLocaleString()}) for the month of ${month}! You have won a free month of ${monthlyPrize} and have earned the coveted <@&${masterGamblerRoleID}> role! Please check your DM for your gift!`,
            allowedMentions: { parse: ["users"] }
        });

        await sendDM(client, guildInfo, userID, month, points);
        await addRemoveRole(masterGamblerRoleID, guild, userID);
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
};

const fetchWinner = async (guildID: Snowflake) => {
    const results = await gambling.find({ guildID, points: { $gt: 0 } })
        .sort({ points: -1 }).limit(1);
    return results[0];
};

const sendDM = async (client: Client, guildInfo: Guild, userID: Snowflake, month: String, points: Number) => {
    const { nitroLink } = guildInfo.gambling;
    const embed = new MessageEmbed()
        .setColor("#7289da")
        .setTitle("Congratulations!")
        .setDescription(
            stripIndents`
            Congratulations! You have the most points for the month of ${month} with ${points.toLocaleString()} points and have won a free month of Discord Nitro!
            
            To claim it, please click [here](${nitroLink}).
            
            Please contact <@464635440801251328> if you encounter any problems.
            
            Fun fact: With Discord Nitro, you have two free server boosts to any server you like.
            
            Enjoy the Nitro!`
        )
        .setThumbnail("https://www.howtogeek.com/wp-content/uploads/2020/04/Discord-Nitro-Banner-Image.jpg")
        .setFooter({ text: "Please do no reply to this DM as this is not monitored." })
        .setTimestamp();

    client.users.cache.get(userID)!.send({ embeds: [embed] })
        .then(() => {
            client.utils.log("SUCCESS", `${__filename}`, `Message succesfully sent to ${client.users.cache.get(userID)!.tag}`);
        })
        .catch((e) => {
            client.utils.log("ERROR", `${__filename}`, `There was an error with sending DM to ${client.users.cache.get(userID)!.tag}: ${e}`);
        });
};

const addRemoveRole = async (masterGamblerRoleID: Snowflake, guild: Discord.Guild, userID: Snowflake) => {
    const role = await guild.roles.fetch(masterGamblerRoleID);
    if (!role) return;

    const currentMember = role.members.first(); // Get current member with Master Gambler role

    const member = await guild.members.fetch(userID);
    if (!member) return;

    if (currentMember) {
        if (currentMember.id === member.id) return;
        currentMember.roles.remove(role); // Remove the Master Gambler role from the previous month's winner
    }

    member.roles.add(role); // Add the Master Gambler role to the new winner
};
