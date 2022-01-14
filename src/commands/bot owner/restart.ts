import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Restart extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "restart",
            category: "Bot Owner",
            devOnly: true,
            development: true,
            hideCommand: true,
            description: "You can't use this command, so why bother explaining."
        });
    }
    async execute({ interaction }: { interaction: CommandInteraction }) {
        interaction.reply({ content: "Restarting...", ephemeral: true }).then(() => process.exit());
    }
}
