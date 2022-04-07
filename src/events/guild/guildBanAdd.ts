import { ColorResolvable, GuildBan, MessageEmbed, User } from "discord.js";
import { Client } from "../../util/client";
import { GUILD_BAN_ADD } from "../../../config/embedColours.json";

export default async (client: Client, guildBan: GuildBan) => {
    const msgEmbed = new MessageEmbed()
        .setColor(GUILD_BAN_ADD as ColorResolvable)
        .setAuthor({ name: guildBan.guild.name, iconURL: client.utils.getGuildIcon(guildBan.guild)! })
        .setFooter({ text: `ID: ${guildBan.user.id}` })
        .setTimestamp();

    const fetchedLogs = await client.utils.fetchAuditLog(guildBan.guild, "MEMBER_BAN_ADD");
    if (!fetchedLogs) {
        msgEmbed.setDescription(`**${guildBan.user.tag} has been banned from the server**`);
        return client.utils.sendMessageToBotLog(client, guildBan.guild, msgEmbed);
    }

    const banLog = fetchedLogs.entries.first();
    if (!banLog) {
        msgEmbed.setDescription(`**${guildBan.user.tag} has been banned from the server**`);
        return client.utils.sendMessageToBotLog(client, guildBan.guild, msgEmbed);
    }

    const { executor, target } = banLog;
    msgEmbed.setDescription(
        (target! as User).id === guildBan.user.id
            ? `**${guildBan.user.tag} has been banned from the server by ${executor}**`
            : `**${guildBan.user.tag} has been banned from the server**`
    );

    return client.utils.sendMessageToBotLog(client, guildBan.guild, msgEmbed);
};
