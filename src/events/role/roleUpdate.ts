import { ColorResolvable, Role } from "discord.js";
import { Client } from "../../util/client";
import { ROLE_EVENTS } from "../../../config/embedColours.json";

export default async (client: Client, oldRole: Role, newRole: Role) => {
    const msgEmbed = client.utils
        .createEmbed()
        .setColor(ROLE_EVENTS as ColorResolvable)
        .setAuthor({ name: newRole.guild.name, iconURL: client.utils.getGuildIcon(newRole.guild) })
        .setFooter({ text: `ID: ${newRole.id}` })
        .setTimestamp();

    if (oldRole.name !== newRole.name) {
        const fetchedLog = await client.utils.fetchAuditLog(newRole.guild, "ROLE_UPDATE");
        if (!fetchedLog) {
            msgEmbed.addFields(
                { name: "**Before**", value: `\`${oldRole.name}\``, inline: true },
                { name: "**After**", value: `\`${newRole.name}\``, inline: true }
            );
            return client.utils.sendMessageToBotLog(client, newRole.guild, msgEmbed);
        }

        const roleUpdateLog = fetchedLog.entries.first();
        if (!roleUpdateLog) {
            msgEmbed.addFields(
                { name: "**Before**", value: `\`${oldRole.name}\``, inline: true },
                { name: "**After**", value: `\`${newRole.name}\``, inline: true }
            );
            return client.utils.sendMessageToBotLog(client, newRole.guild, msgEmbed);
        }

        const { executor } = roleUpdateLog;
        msgEmbed.addFields(
            { name: "**Before**", value: `\`${oldRole.name}\``, inline: true },
            { name: "**After**", value: `\`${newRole.name}\``, inline: true },
            { name: "**Updated By**", value: `${executor}`, inline: true }
        );
        return client.utils.sendMessageToBotLog(client, newRole.guild, msgEmbed);
    }
    return;
};
