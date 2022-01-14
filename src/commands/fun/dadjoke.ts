import axios from "axios";
import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Dadjoke extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "dadjoke",
            category: "Fun",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES"],
            description: `${client.user!.username} tells you a dad joke.`
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        this.setCooldown(interaction);
        await interaction.deferReply();
        try {
            const resp = await axios.get("https://icanhazdadjoke.com/", {
                headers: { "Accept": "application/json", "User-Agent": `${client.user!.tag}` },
            });
            const { data } = resp;
            return interaction.editReply({ content: data.joke });
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
            return interaction.editReply({ content: "An error has occurred. Please try again." });
        }
    }
}
