import { ColorResolvable, GuildBan, User } from "discord.js";
import { Client } from "../../util/client";
import { GUILD_BAN_REMOVE } from "../../../config/embedColours.json";

export default async (client: Client, guildBan: GuildBan) => {
    const msgEmbed = client.utils
        .createEmbed()
        .setColor(GUILD_BAN_REMOVE as ColorResolvable)
        .setAuthor({ name: guildBan.guild.name, iconURL: client.utils.getGuildIcon(guildBan.guild)! })
        .setFooter({ text: `ID: ${guildBan.user.id}` })
        .setTimestamp();

    const fetchedLogs = await client.utils.fetchAuditLog(guildBan.guild, "MEMBER_BAN_REMOVE");
    if (!fetchedLogs) {
        msgEmbed.setDescription(`**${guildBan.user.tag} has been unbanned from the server**`);
        return client.utils.sendMessageToBotLog(client, guildBan.guild, msgEmbed);
    }

    const banLog = fetchedLogs.entries.first();
    if (!banLog) {
        msgEmbed.setDescription(`**${guildBan.user.tag} has been unbanned from the server**`);
        return client.utils.sendMessageToBotLog(client, guildBan.guild, msgEmbed);
    }

    const { executor, target } = banLog;
    msgEmbed.setDescription(
        (target! as User).id === guildBan.user.id
            ? `**${executor} removed ban from ${guildBan.user.tag}**`
            : `**${guildBan.user.tag} has been unbanned from the server**`
    );

    return client.utils.sendMessageToBotLog(client, guildBan.guild, msgEmbed);
};
