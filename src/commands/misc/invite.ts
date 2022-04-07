import { CommandInteraction, MessageActionRow, MessageButton, Permissions } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Invite extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "invite",
            category: "Misc",
            description: "Invite me into your server!",
            execute: async ({ client, interaction }) => {
                const inviteLink = client.generateInvite({
                    scopes: ["bot", "applications.commands"],
                    permissions: [Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.MODERATE_MEMBERS]
                });

                const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
                    .setTitle("Invite Me!")
                    .setThumbnail(client.user?.displayAvatarURL({ dynamic: true })!)
                    .setDescription(
                        "If you would like me in your server, all you have to do is click on the button below and I will automatically join your server!"
                    );

                const button = new MessageActionRow().addComponents(new MessageButton().setLabel("Invite").setStyle("LINK").setURL(inviteLink));

                return await interaction.reply({ embeds: [msgEmbed], components: [button], ephemeral: true });
            }
        });
    }
}
