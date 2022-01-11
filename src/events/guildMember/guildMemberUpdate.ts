import { ColorResolvable, Guild, GuildMember, MessageEmbed, Role, User } from "discord.js";
import { Client } from "../../util/client";
import { GUILD_MEMBER_EVENTS, GUILD_MEMBER_ROLES } from "./../../../config/embedColours.json"

export default async (client: Client, oldMember: GuildMember, newMember: GuildMember) => {
    // Nickname changed
    if (oldMember.nickname !== newMember.nickname) {
        const oldNick = oldMember.nickname ?? "None";
        const newNick = newMember.nickname ?? "None";

        const msgEmbed =
            createEmbed(client, GUILD_MEMBER_EVENTS as ColorResolvable, `**${newMember.user} nickname changed**`, { guild: newMember.guild })
                .addFields(
                    { name: "**Before**", value: oldNick, inline: true },
                    { name: "**After**", value: newNick, inline: true }
                );

        const fetchedLog = await client.utils.fetchAuditLog(newMember.guild!, "MEMBER_UPDATE");
        if (fetchedLog) {
            const memberUpdateLog = fetchedLog.entries.first();
            if (memberUpdateLog) {
                const { executor } = memberUpdateLog;
                if (executor!.id !== newMember.id) {
                    //Only show "Changed By" field if a mod changes member nickname
                    msgEmbed.addField(`**Changed By**`, `${executor}`, true);
                }
            }
        }
        return client.utils.sendMessageToBotLog(client, newMember.guild, msgEmbed);
    }

    // Updated roles
    if (oldMember.roles.cache.size != newMember.roles.cache.size) {
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

        if (removedRoles.size > 0) {
            const roleID = removedRoles.map((r) => r.id);
            for (let i = 0; i < roleID.length; i++) {
                roleUpdatedLog(client, removedRoles.get(roleID[i])!, oldMember.user, "removed");
            }
        }

        if (addedRoles.size > 0) {
            const roleID = addedRoles.map((r) => r.id);
            for (let i = 0; i < roleID.length; i++) {
                roleUpdatedLog(client, addedRoles.get(roleID[i])!, oldMember.user, "given");
            }
        }
    }
    return;
};

const roleUpdatedLog = async (client: Client, role: Role, user: User, type: "given" | "removed") => {
    let description = `**${user} was ${type}`;
    if (type === "given") description += ` the `
    else description += ` from the `;

    description += `\`${role.name}\` role`;

    const fetchedLogs = await client.utils.fetchAuditLog(role.guild, "MEMBER_ROLE_UPDATE");
    if (!fetchedLogs) {
        const msgEmbed = createEmbed(client, GUILD_MEMBER_ROLES as ColorResolvable, description, { user });
        return client.utils.sendMessageToBotLog(client, role.guild, msgEmbed);
    }

    const roleUpdateLog = fetchedLogs.entries.first();
    if (!roleUpdateLog) {
        const msgEmbed = createEmbed(client, GUILD_MEMBER_ROLES as ColorResolvable, description, { user });
        return client.utils.sendMessageToBotLog(client, role.guild, msgEmbed);
    }

    const { executor } = roleUpdateLog;
    description += !role.managed ? ` by ${executor}**` : "**";

    const msgEmbed = createEmbed(client, GUILD_MEMBER_ROLES as ColorResolvable, description, { user });
    return client.utils.sendMessageToBotLog(client, role.guild, msgEmbed);
}

const createEmbed = (client: Client, color: ColorResolvable, description: string, options: { user?: User, guild?: Guild }) => {
    return new MessageEmbed()
        .setColor(color)
        .setAuthor({
            name: options.user ? options.user.tag : `${options.guild?.name}`,
            iconURL: options.user ? options.user.displayAvatarURL({ dynamic: true }) : client.utils.getGuildIcon(options.guild!)!
        })
        .setDescription(description)
        .setFooter({ text: `ID: ${options.user ? options.user.id : options.guild?.id}` })
        .setTimestamp();
}