import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { COMPLIMENTS } from "../../../config/compliments.json"

export default class Ty extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "ty",
            category: "Misc",
            description: "Gives you or someone else a compliment.",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES"],
            options: [
                {
                    name: "person",
                    description: "The person you want to thank.",
                    type: "USER"
                }],
            execute: async ({ client, interaction }) => {
                try {
                    this.setCooldown(interaction);
                    const person = interaction.options.getUser("person");
                    const compliment = COMPLIMENTS.random().format(person ? person.tag : interaction.user.tag);
                    return await interaction.reply({ content: compliment });
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
                }
            }
        });
    }
};