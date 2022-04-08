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

    const fetchedLog = await client.utils.fetchAuditLog(channel.guild, "CHANNEL_CREATE");
    if (!fetchedLog) {
        msgEmbed.setDescription(`${client.utils.getChannelDescription(channel.type)} Created:** ${channel}`);
        return client.utils.sendMessageToBotLog(client, channel.guild, msgEmbed);
    }

    const channelCreateLog = fetchedLog.entries.first();
    if (!channelCreateLog) {
        msgEmbed.setDescription(`${client.utils.getChannelDescription(channel.type)} Created:** ${channel}`);
        return client.utils.sendMessageToBotLog(client, channel.guild, msgEmbed);
    }

    const { executor } = channelCreateLog;
    msgEmbed.setDescription(`${client.utils.getChannelDescription(channel.type)} Created:** ${channel}\n**Created By:** ${executor}`);

    return client.utils.sendMessageToBotLog(client, channel.guild, msgEmbed);
};
