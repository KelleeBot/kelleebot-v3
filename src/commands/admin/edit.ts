import { TextInputComponent } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { TextInputStyles } from "discord.js/typings/enums";

export default class Edit extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "edit",
            category: "Admin",
            perms: ["ADMINISTRATOR"],
            hideCommand: true,
            description: `Edits a message that was sent by ${client.user?.username}.`,
            execute: async ({ client, interaction }) => {
                try {
                    const modal = client.utils.createModal().setCustomId("edit").setTitle("Edit Message");
                    const messageID = new TextInputComponent()
                        .setCustomId("messageIDInput")
                        .setLabel("Message ID")
                        .setStyle(TextInputStyles.SHORT)
                        .setPlaceholder("The ID of the message you want to edit.")
                        .setRequired(true);

                    const newMessage = new TextInputComponent()
                        .setCustomId("newMessageInput")
                        .setLabel("New Message")
                        .setStyle(TextInputStyles.PARAGRAPH)
                        .setPlaceholder("The content of the message you'd like to edit it to.")
                        .setRequired(true);

                    //@ts-ignore
                    const firstRow = client.utils.createActionRow().addComponents([messageID]);
                    //@ts-ignore
                    const secondRow = client.utils.createActionRow().addComponents([newMessage]);

                    //@ts-ignore
                    modal.addComponents([firstRow, secondRow]);
                    await interaction.showModal(modal);
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
                }
            }
        });
    }
}