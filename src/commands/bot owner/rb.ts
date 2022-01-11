import { CommandInteraction, MessageActionRow, MessageButton, TextChannel } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Rb extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "rb",
            category: "Bot Owner",
            devOnly: true,
            hideCommand: true,
            description: "You can't use this command, so why bother explaining.",
            options: [
                {
                    name: "channel",
                    description: "The channel to send the message to.",
                    type: "CHANNEL",
                    channelTypes: ["GUILD_TEXT"]
                }
            ]
        });
    }
    async execute({ interaction }: { interaction: CommandInteraction }) {
        const channel = interaction.options.getChannel("channel") ?? interaction.channel;

        const button = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("roles")
                .setLabel("List current roles")
                .setStyle("PRIMARY")
        );

        interaction.reply({ content: `Role button message successully sent to ${channel}.`, ephemeral: true });
        return (channel as TextChannel).send({ content: "Unsure which roles you currently already have? Click here:", components: [button] });
    }
}
