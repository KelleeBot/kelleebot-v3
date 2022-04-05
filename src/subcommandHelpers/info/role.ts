import { CommandInteraction, MessageEmbed, Role } from "discord.js";
import { Client } from "../../util/client";

export const role = async (client: Client, interaction: CommandInteraction) => {
    const role = interaction.options.getRole("role", true) as Role;

    const roleCreatedTimestamp = Math.round(role.createdTimestamp / 1000);
    const colorURL = `https://www.color-hex.com/color/${role.hexColor.slice(1)}`;

    const msgEmbed = new MessageEmbed()
        .setColor(role.hexColor)
        .setAuthor({ name: role.name, iconURL: client.utils.getGuildIcon(role.guild!)! })
        .setThumbnail(client.utils.getGuildIcon(role.guild!)!)
        .setTimestamp()
        .addFields(
            {
                name: "**Name**",
                value: `${role}`,
                inline: true
            },
            {
                name: "**ID**",
                value: `\`${role.id}\``,
                inline: true
            },
            {
                name: "**Color | Hex**",
                value: `${role.color} | [${role.hexColor}](${colorURL})`,
                inline: true
            },
            {
                name: "**Mentionable**",
                value: role.mentionable ? "Yes" : "No",
                inline: true
            },
            {
                name: "**Hoisted**",
                value: role.hoist ? "Yes" : "No",
                inline: true
            },
            {
                name: "**Managed**",
                value: role.managed ? "Yes" : "No",
                inline: true
            },
            {
                name: "**Created**",
                value: `<t:${roleCreatedTimestamp}:D>`,
                inline: true
            },
            {
                name: "**Position**",
                value: `${role.position}`,
                inline: true
            },
            {
                name: "**Members**",
                value: `${role.members.size}`,
                inline: true
            }
        )

    if (role.unicodeEmoji) msgEmbed.addField("**Emoji**", role.unicodeEmoji, true);

    if (role.permissions.toArray().length > 0)
        msgEmbed.addFields({
            name: "**Permissions**",
            value: `${role.permissions.toArray().map((str) => `\`${client.utils.titleCase(str.replace(/_/g, " ").toLowerCase())}\``)}`,
            inline: false
        })

    return interaction.reply({ embeds: [msgEmbed] });
};