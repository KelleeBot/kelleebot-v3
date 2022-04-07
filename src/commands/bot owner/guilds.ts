import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { Util } from "discord.js";

export default class Guilds extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "guilds",
            category: "Bot Owner",
            description: `See all guilds that ${client.user!.username} is in.`,
            devOnly: true,
            development: true,
            execute: async ({ client, interaction }) => {
                const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
                    .setAuthor({
                        name: interaction.guild!.name,
                        iconURL: client.utils.getGuildIcon(interaction.guild!)!
                    })
                    .setTimestamp();

                let description = "";
                const numGuilds = client.guilds.cache.size;

                for (const guild of client.guilds.cache.values()) {
                    const timestamp = Math.round(guild.joinedTimestamp / 1000);
                    const guildOwner = (await guild.fetchOwner()).user;

                    description += `**❯ ${guild.name}**\n• ID: \`${guild.id}\`\n• Owner: ${guildOwner.tag} (\`${
                        guildOwner.id
                    }\`)\n• Members: \`${guild.memberCount.toLocaleString()}\`\n• Joined: <t:${timestamp}> (<t:${timestamp}:R>)\n\n`;
                }

                const embedArray = [];
                const descArray = Util.splitMessage(description, {
                    maxLength: 800,
                    char: "\n\n"
                });

                if (descArray.length == 1) {
                    msgEmbed.setDescription(
                        `I am in a total of **${numGuilds}** guild${client.utils.pluralize(numGuilds, "guild", true)}.\n\n${description}`
                    );
                    return await interaction.reply({ embeds: [msgEmbed] });
                }

                for (let i = 0; i < descArray.length; i++) {
                    let desc = "";
                    desc += descArray[i];
                    const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
                        .setAuthor({
                            name: interaction.guild!.name,
                            iconURL: client.utils.getGuildIcon(interaction.guild!)!
                        })
                        .setTimestamp()
                        .setDescription(`I am in a total of **${numGuilds}** guild${numGuilds != 1 ? "s" : ""}.\n\n${desc}`)
                        .setFooter({ text: `Page ${i + 1} of ${descArray.length}` });
                    embedArray.push(msgEmbed);
                }
                return client.utils.paginate(interaction, embedArray);
            }
        });
    }
}
