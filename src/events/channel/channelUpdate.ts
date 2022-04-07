import { ColorResolvable, GuildChannel, MessageEmbed } from "discord.js";
import { Client } from "../../util/client";
import { CHANNEL_EVENTS } from "../../../config/embedColours.json";

export default async (client: Client, oldChannel: GuildChannel, newChannel: GuildChannel) => {
    if (!oldChannel.guild || !newChannel.guild) return;

    // Channel name updated
    if (oldChannel.name !== newChannel.name) {
        const msgEmbed = new MessageEmbed()
            .setColor(CHANNEL_EVENTS as ColorResolvable)
            .setAuthor({ name: newChannel.guild.name, iconURL: client.utils.getGuildIcon(newChannel.guild)! })
            .setDescription(`${client.utils.getChannelDescription(newChannel.type)} Name Changed**`)
            .setTimestamp()
            .setFooter({ text: `ID: ${oldChannel.id}` });

        const fetchedLog = await client.utils.fetchAuditLog(newChannel.guild, "CHANNEL_UPDATE");
        if (!fetchedLog) {
            msgEmbed.addFields(
                { name: "**Before**", value: `\`${oldChannel.name}\``, inline: true },
                { name: "**After**", value: `${newChannel}`, inline: true }
            );
            return client.utils.sendMessageToBotLog(client, newChannel.guild, msgEmbed);
        }

        const channelUpdateLog = fetchedLog.entries.first();
        if (!channelUpdateLog) {
            msgEmbed.addFields(
                { name: "**Before**", value: `\`${oldChannel.name}\``, inline: true },
                { name: "**After**", value: `${newChannel}`, inline: true }
            );
            return client.utils.sendMessageToBotLog(client, newChannel.guild, msgEmbed);
        }

        const { executor } = channelUpdateLog;
        msgEmbed.addFields(
            { name: "**Before**", value: `\`${oldChannel.name}\``, inline: true },
            { name: "**After**", value: `${newChannel}`, inline: true },
            { name: "**Updated By**", value: `${executor!}`, inline: true }
        );
        return client.utils.sendMessageToBotLog(client, newChannel.guild, msgEmbed);
    }
    return;
};
