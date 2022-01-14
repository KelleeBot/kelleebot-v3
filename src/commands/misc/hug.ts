import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Hug extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "hug",
            category: "Misc",
            description: "Give someone a hug.",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES"],
            options: [
                {
                    name: "person",
                    description: "The person you want to hug.",
                    type: "USER"
                }
            ]
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        try {
            this.setCooldown(interaction);
            const person = interaction.options.getUser("person");
            const hugEmoji = "<:kellee1Hug:851544052222656513>";

            if (!person || interaction.user.id === person.id)
                return await interaction.reply({ content: `**${interaction.user.tag}** gives themselves a hug.` });

            if (interaction.user.id === client.user?.id)
                return await interaction.reply({ content: "Please don't hug me. I don't like to be touched." });

            return await interaction.reply({ content: `**${interaction.user.tag}** hugs **${person}**. I love you ʕっ•ᴥ•ʔっ ${hugEmoji}` })
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
            return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
        }
    }
};