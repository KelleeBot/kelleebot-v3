import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Scams extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "scams",
            category: "Bot Owner",
            devOnly: true,
            development: true,
            hideCommand: true,
            description: "You can't use this command, so why bother explaining.",
            options: [
                {
                    name: "action",
                    description: "Add/remove scam link.",
                    type: "STRING",
                    required: true,
                    choices: [
                        { name: "Add", value: "add" },
                        // { name: "Remove", value: "remove" }
                    ]
                },
                {
                    name: "link",
                    description: "The scam link to add/remove.",
                    type: "STRING",
                    required: true
                }
            ]
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        try {
            const action = interaction.options.getString("action")!;
            const link = interaction.options.getString("link")!;
            const scams = await client.scams.get("scams");

            switch (action.toLowerCase()) {
                case "add":
                    if (scams.links.includes(link.toLowerCase()))
                        return await interaction.reply({ content: "That link is already in the database.", ephemeral: true });

                    await client.scams.findByIdAndUpdate(
                        "scams",
                        { $push: { links: link.toLowerCase() } },
                        { new: true, upsert: true, setDefaultsOnInsert: true }
                    )
                    await interaction.reply({ content: "That link has successfully been added to the database.", ephemeral: true });
                    break;
            }
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
            return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
        }
    }
}
