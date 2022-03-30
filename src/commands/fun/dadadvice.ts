import axios from "axios";
import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Dadadvice extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "dadadvice",
            category: "Fun",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES"],
            description: `${client.user!.username} tells you some advice.`,
            execute: async ({ client, interaction }) => {
                this.setCooldown(interaction);
                await interaction.deferReply();
                try {
                    const resp = await axios.get("https://api.adviceslip.com/advice");
                    const { data } = resp;
                    return interaction.editReply({ content: data.slip.advice });
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return interaction.editReply({ content: "An error has occurred. Please try again." });
                }
            }
        });
    }
}
