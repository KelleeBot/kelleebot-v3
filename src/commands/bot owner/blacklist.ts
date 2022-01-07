import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Blacklist extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "blacklist",
            category: "Bot Owner",
            description: "Blacklist/whitelist a user from using the bot commands.",
            devOnly: true,
            options: [
                {
                    name: "action",
                    description: "Add or remove blacklist.",
                    type: "STRING",
                    choices: [
                        { name: "add", value: "add" },
                        { name: "remove", value: "remove" }
                    ],
                    required: true
                },
                {
                    name: "user",
                    description: "The user to blacklist or whitelist.",
                    type: "USER",
                    required: true
                }
            ]
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        const action = interaction.options.getString("action")!;
        const user = interaction.options.getUser("user")!;
        try {
            const userInfo = await client.profileInfo.get(user.id)
            switch (action) {
                case "add":
                    if (user.bot) return interaction.reply({ content: "You cannot blacklist bots.", ephemeral: true });

                    if (user.id === interaction.user.id) return interaction.reply({ content: "You cannot blacklist yourself.", ephemeral: true });

                    if (client.config.devs.includes(user.id)) return interaction.reply({ content: "You cannot blacklist the bot owner.", ephemeral: true });

                    if (userInfo.isBlacklisted) return interaction.reply({ content: `Looks like **${user.tag}** is already blacklisted.` });

                    userInfo.isBlacklisted = true;
                    await client.profileInfo.findByIdAndUpdate(
                        user.id,
                        { $set: { isBlacklisted: true } },
                        { new: true, upsert: true, setDefaultsOnInsert: true }
                    );
                    interaction.reply({ content: `**${user.tag}** has successfully been blacklisted.` });
                    break;
                case "remove":
                    if (!userInfo.isBlacklisted) return interaction.reply({ content: `**${user.tag}** is currently not blacklisted.` });

                    userInfo.isBlacklisted = false
                    await client.profileInfo.findByIdAndUpdate(
                        user.id,
                        { $set: { isBlacklisted: false } },
                        { new: true, upsert: true, setDefaultsOnInsert: true }
                    );
                    interaction.reply({ content: `**${user.tag}** has successfully been whitelisted.` })
                    break;
            }
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
            return interaction.reply({ content: `An error occurred and **${user.tag}** was not ${action === "add" ? "blacklisted" : "whitelisted"}.`, ephemeral: true });
        }
    }
}
