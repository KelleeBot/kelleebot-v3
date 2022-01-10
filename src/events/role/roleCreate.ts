import { ColorResolvable, GuildChannel, MessageEmbed, Role } from "discord.js";
import { Client } from "../../util/client";
import { ROLE_EVENTS } from "../../../config/embedColours.json";

export default async (client: Client, role: Role) => {
    const msgEmbed = new MessageEmbed()
        .setColor(ROLE_EVENTS as ColorResolvable)
        .setAuthor({ name: role.guild.name, iconURL: client.utils.getGuildIcon(role.guild)! })
        .setFooter({ text: `ID: ${role.id}` })
        .setTimestamp();

    const fetchedLog = await client.utils.fetchAuditLog(role.guild, "ROLE_CREATE");
    if (!fetchedLog) {
        msgEmbed.setDescription(`**Role Created:** \`${role.name}\``);
        return client.utils.sendMessageToBotLog(client, role.guild, msgEmbed);
    }

    const roleCreationLog = fetchedLog.entries.first();
    if (!roleCreationLog) {
        msgEmbed.setDescription(`**Role Created:** \`${role.name}\``);
        return client.utils.sendMessageToBotLog(client, role.guild, msgEmbed);
    }

    const { executor } = roleCreationLog;
    msgEmbed.setDescription(`**Role Created:** \`${role.name}\`\n**Role Created By:** ${executor}`);
    return client.utils.sendMessageToBotLog(client, role.guild, msgEmbed);
}