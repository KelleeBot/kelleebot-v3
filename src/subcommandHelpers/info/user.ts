import { CommandInteraction, GuildMember, Guild, MessageEmbed, Role, Permissions } from "discord.js";
import { Client } from "../../util/client";
import { lstatSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

let linesOfCode = 0;
let numOfFiles = 0;

const keyPerms = {
    ADMINISTRATOR: "Administrator",
    MANAGE_GUILD: "Manage Server",
    MANAGE_ROLES_OR_PERMISSIONS: "Manage Roles",
    MANAGE_CHANNELS: "Manage Channels",
    MANAGE_MESSAGES: "Manage Messages",
    MANAGE_WEBHOOKS: "Manage Webhooks",
    MANAGE_NICKNAMES: "Manage Nicknames",
    MANAGE_EMOJIS: "Manage Emojis",
    MODERATE_MEMBERS: "Moderate Members",
    KICK_MEMBERS: "Kick Members",
    BAN_MEMBERS: "Ban Members",
    MENTION_EVERYONE: "Mention Everyone"
} as { [key: string]: string };

const status = {
    offline: "<:offline:824287505137532949>",
    online: "<:online:824287390779834368>",
    dnd: "<:dnd:824287478432923668>",
    idle: "<:idle:824287438746288150>"
} as { [key: string]: string };

export const user = async (client: Client, interaction: CommandInteraction) => {
    const readCode = (dir: string) => {
        let files = readdirSync(dir);
        for (const file of files) {
            let stat = lstatSync(join(dir, file));
            if (stat.isDirectory()) {
                readCode(join(dir, file));
            } else {
                if (
                    (file.endsWith(".ts") || file.endsWith(".js")) &&
                    !file.endsWith(".d.ts") && !file.includes("-ignore")
                ) {
                    let buffer = readFileSync(join(dir, file)).toString();
                    let lines = buffer.split("\n");
                    linesOfCode += lines.length;
                    numOfFiles++;
                }
            }
        }
    };

    if (linesOfCode == 0) readCode(join(process.cwd(), "dist"));

    const member = interaction.options.getMember("user") as GuildMember ?? interaction.member as GuildMember;
    const { user, nickname } = member;

    const botCreator = client.users.cache.get(client.config.devs[0]);
    const memberStatus = !member.presence ? "offline" : member.presence.status;

    const userCreatedTimestamp = Math.round(user.createdTimestamp / 1000);
    const botCreatedTimestamp = Math.round(client.user!.createdTimestamp / 1000);
    const memberJoinedTimestamp = Math.round(member.joinedTimestamp! / 1000);
    const userBanner = (await user.fetch()).bannerURL({ dynamic: true, size: 512 });

    const msgEmbed = new MessageEmbed()
        .setColor(member.displayHexColor)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })
        .setThumbnail(member.displayAvatarURL({ dynamic: true }));

    if (userBanner) msgEmbed.setImage(userBanner.toString())

    if (user.id === client.user!.id) {
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const botFooter = `© ${client.user!.createdAt.getFullYear()}-${new Date().getFullYear()} ${botCreator!.tag}`;

        msgEmbed
            .addFields(
                { name: "**Creator**", value: `${botCreator!.tag}`, inline: true },
                {
                    name: "**Uptime**",
                    value: `<t:${Math.floor((Date.now() - client.uptime!) / 1000)}:R>`,
                    inline: true
                },
                {
                    name: "**Servers**",
                    value: `${client.guilds.cache.size}`,
                    inline: true
                },
                {
                    name: "**Members**",
                    value: client.utils.formatNumber(totalMembers),
                    inline: true
                },
                {
                    name: "**Memory Used**",
                    value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                    inline: true
                },
                {
                    name: "**RAM Usage**",
                    value: `${formatBytes(process.memoryUsage().rss)}`,
                    inline: true
                },
                { name: "**Ping**", value: `${client.ws.ping}ms`, inline: true },
                {
                    name: "**Lines of Code**",
                    value: client.utils.formatNumber(linesOfCode),
                    inline: true
                },
                {
                    name: "**Number of Files**",
                    value: client.utils.formatNumber(numOfFiles),
                    inline: true
                },
                {
                    name: "**Created On**",
                    value: `<t:${botCreatedTimestamp}:F> (<t:${botCreatedTimestamp}:R>)`,
                    inline: false
                },
                {
                    name: "**Joined Server**",
                    value: `<t:${memberJoinedTimestamp}:F> (<t:${memberJoinedTimestamp}:R>)`,
                    inline: false
                }
            )
            .setFooter({ text: botFooter })
            .setTimestamp();
        return interaction.reply({ embeds: [msgEmbed] })
    }

    msgEmbed
        .addFields(
            {
                name: "**Nickname**",
                value: `\`${nickname || "None"}\``,
                inline: true
            },
            {
                name: "**Discriminator**",
                value: `\`${user.discriminator}\``,
                inline: true
            },
            {
                name: "**Status**",
                value: `${status[memberStatus]} \`${memberStatus.toUpperCase()}\``,
                inline: true
            },
            {
                name: "**Joined Discord**",
                value: `<t:${userCreatedTimestamp}:F> (<t:${userCreatedTimestamp}:R>)`,
                inline: true
            },
            {
                name: "**Joined Server**",
                value: `<t:${memberJoinedTimestamp}:F> (<t:${memberJoinedTimestamp}:R>)`,
                inline: false
            },
            {
                name: `**Roles [${member!.roles.cache.size - 1}]**`,
                value: getAllRoles(member!) === "" ? "None" : getAllRoles(member!),
                inline: false
            }
        )
        .setFooter({ text: `ID: ${user.id}` })
        .setTimestamp();

    const extraPerms = [];
    if (isServerAdmin(member!, interaction.guild!)) {
        if (member!.id === interaction.guild!.ownerId) {
            extraPerms.push("Server Owner");
        } else if (member!.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            extraPerms.push("Server Admin");
        } else {
            extraPerms.push("Server Manager");
        }
    }

    if (member!.permissions) {
        const memberPerms = member!.permissions.toArray();
        const infoPerms = [];
        for (let index in memberPerms) {
            if (keyPerms[memberPerms[index]]) {
                infoPerms.push(keyPerms[memberPerms[index]]);
            }
        }

        if (infoPerms.length) {
            msgEmbed.addField(
                "**Key Permissions**",
                infoPerms.sort().join(", "),
                false
            );
        }
    }

    if (extraPerms.length) {
        msgEmbed.addField(
            "**Acknowledgements**",
            extraPerms.sort().join(", "),
            false
        );
    }
    return interaction.reply({ embeds: [msgEmbed] });
}

const getAllRoles = (member: GuildMember): string => {
    let roles = "";
    member.roles.cache.forEach((role: Role) => {
        if (role.name !== "@everyone") {
            roles += `<@&${role.id}>, `;
        }
    });
    return roles.substring(0, roles.length - 2); // Remove trailing comma and space at the end
};

const isServerAdmin = (member: GuildMember, guild: Guild): boolean => {
    if (!member || !guild) return false;
    return (
        member.id === guild.ownerId ||
        (member.permissions &&
            (member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
                member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)))
    );
};

const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};