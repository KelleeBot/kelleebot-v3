import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Avatar extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "avatar",
            category: "Misc",
            description: "Displays your avatar or someone elses.",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            options: [
                {
                    name: "user",
                    description: "The user to see avatar for.",
                    type: "USER"
                }
            ],
            execute: async ({ interaction }) => {
                this.setCooldown(interaction);
                try {
                    const msgEmbed = new MessageEmbed();

                    const member = interaction.options.getMember("user") ?? interaction.member

                    msgEmbed
                        .setColor((member! as GuildMember).displayHexColor)
                        .setAuthor({
                            name: `${(member! as GuildMember).user.username}'s Avatar`,
                            iconURL: (member! as GuildMember).user.displayAvatarURL({ dynamic: true })
                        })
                        .setImage((member! as GuildMember).user.displayAvatarURL({ dynamic: true, size: 256 }));
                    return await interaction.reply({ embeds: [msgEmbed] });
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
                }
            }
        });
    }
}