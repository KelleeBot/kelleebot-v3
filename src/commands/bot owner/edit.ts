import { CommandInteraction, Snowflake } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Edit extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "edit",
            category: "Bot Owner",
            devOnly: true,
            development: true,
            hideCommand: true,
            description: "You can't use this command, so why bother explaining.",
            options: [
                {
                    name: "id",
                    description: "The ID of the message you want to edit.",
                    type: "STRING",
                    required: true
                },
                {
                    name: "content",
                    description: "The content of the message you'd like to edit it to.",
                    type: "STRING",
                    required: true
                },
                {
                    name: "channel",
                    description: "The channel the message you want to edit is in.",
                    type: "CHANNEL",
                    channelTypes: ["GUILD_TEXT"]
                }
            ]
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        const messageID = interaction.options.getString("id");
        const editedMsg = interaction.options.getString("content");
        const channel = interaction.options.getChannel("channel") ?? interaction.channel;

        try {
            if (channel?.type !== "GUILD_TEXT") {
                return interaction.reply({ content: "Specified channel is not a text channel.", ephemeral: true });
            }

            const messageToEdit = await channel.messages.fetch(messageID as Snowflake);
            if (!messageToEdit) {
                return interaction.reply({ content: "That message no longer exists.", ephemeral: true });
            }

            if (messageToEdit.author.id !== client.user?.id) {
                return interaction.reply({ content: "That message was not sent by the bot.", ephemeral: true });
            }

            await messageToEdit.edit({ content: editedMsg, allowedMentions: { parse: [] } });
            return interaction.reply({ content: "Message edited successfully.", ephemeral: true });
        }
        catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
            return interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
        }
    }
}
