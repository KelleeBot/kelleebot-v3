import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { villager } from ".";
import { Villagers } from "../../types/animalCrossing";
import axios from "axios";

let villagers: string[] = []

export default class AnimalCrossing extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "ac",
            category: "Animal Crossing",
            description: `All commands that are related to Animal Crossing.`,
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            guildOnly: true,
            subcommands: {
                villager: {
                    description: "Retrieve information about a specific villager in any Animal Crossing game.",
                    args: [
                        {
                            name: "name",
                            description: "The villager's name.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const focusedValue = interaction.options.getFocused() as string;
                        const choices = await fetchAllVillagerNames();
                        const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedValue.toLowerCase())
                        );
                        await interaction.respond(
                            filtered.slice(0, Math.min(25, filtered.length)).map((choice) => ({
                                name: client.utils.titleCase(choice),
                                value: client.utils.titleCase(choice)
                            }))
                        );
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await villager(client, interaction);
                    }
                }
            }
        });
    }
}

const fetchAllVillagerNames = async () => {
    if (villagers.length) return villagers;

    const resp = await axios.get("https://api.nookipedia.com/villagers", {
        headers: {
            "X-API-KEY": `${process.env.NOOK_API_KEY}`,
            "Accept-Version": "2.0.0"
        }
    });

    const { data } = resp
    villagers = data.map((villager: Villagers) => villager.name);

    return villagers;
};