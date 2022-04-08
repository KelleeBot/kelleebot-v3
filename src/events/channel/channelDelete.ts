import { ColorResolvable, GuildChannel } from "discord.js";
import { Client } from "../../util/client";
import { CHANNEL_EVENTS } from "../../../config/embedColours.json";

export default async (client: Client, channel: GuildChannel) => {
    if (!channel.guild) return;

    const msgEmbed = client.utils
        .createEmbed()
        .setColor(CHANNEL_EVENTS as ColorResolvable)
        .setAuthor({ name: channel.guild.name, iconURL: client.utils.getGuildIcon(channel.guild)! })
        .setFooter({ text: `ID: ${channel.id}` })
        .setTimestamp();

    const fetchedLog = await client.utils.fetchAuditLog(channel.guild, "CHANNEL_DELETE");
    if (!fetchedLog) {
        msgEmbed.setDescription(`${client.utils.getChannelDescription(channel.type)} Deleted:** \`${channel.name}]\``);
        return client.utils.sendMessageToBotLog(client, channel.guild, msgEmbed);
    }

    const channelDeleteLog = fetchedLog.entries.first();
    if (!channelDeleteLog) {
        msgEmbed.setDescription(`${client.utils.getChannelDescription(channel.type)} Deleted:** \`${channel.name}]\``);
        return client.utils.sendMessageToBotLog(client, channel.guild, msgEmbed);
    }

    const { executor } = channelDeleteLog;
    msgEmbed.setDescription(`${client.utils.getChannelDescription(channel.type)} Deleted:** \`${channel.name}\`\n**Deleted By:** ${executor}`);

    return client.utils.sendMessageToBotLog(client, channel.guild, msgEmbed);
};
