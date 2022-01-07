import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { artwork, bug, villager } from ".";
import * as AC from "../../types/animalCrossing";
import { AutocompleteInteraction } from "discord.js";
import axios from "axios";

let artworks: string[] = [];
let bugs: string[] = [];
let villagers: string[] = [];

export default class AnimalCrossing extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "ac",
            category: "Animal Crossing",
            description: `All commands that are related to Animal Crossing.`,
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            subcommands: {
                artwork: {
                    description: "Retrieve information about a specific artwork in Animal Crossing: New Horizons.",
                    args: [
                        {
                            name: "artwork",
                            description: "The artwork name.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/art", "artworks");
                        await client.utils.getAutocomplete(client, interaction, choices);

                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await artwork(client, interaction);
                    }
                },
                bug: {
                    description: "Retrieve information about a specific bug in Animal Crossing: New Horizons.",
                    args: [
                        {
                            name: "bug",
                            description: "The bug name.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/bugs", "bugs");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await bug(client, interaction);
                    }
                },
                // clothing: {
                //     description: "",
                // },
                // diy: {
                //     description: ""
                // },
                // dream: {
                //     description: "",
                // },
                // fish: {
                //     description: "",
                // },
                // furniture: {
                //     description: "",
                // },
                // interior: {
                //     description: "",
                // },
                // item: {
                //     description: "",
                // },
                // photo: {
                //     description: "",
                // },
                // sea: {
                //     description: "",
                // },
                // tool: {
                //     description: "",
                // },
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
                        const choices = await fetchData("https://api.nookipedia.com/villagers", "villagers");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await villager(client, interaction);
                    }
                }
            }
        });
    }
};

const fetchData = async (url: string, arrayType: "artworks" | "bugs" | "villagers") => {
    if (arrayType === "artworks") {
        if (artworks.length) return artworks;
    } else if (arrayType === "bugs") {
        if (bugs.length) return bugs;
    } else { //if (arrayType === "villagers") {
        if (villagers.length) return villagers;
    }

    const resp = await axios.get(url, {
        headers: {
            "X-API-KEY": `${process.env.NOOK_API_KEY}`,
            "Accept-Version": "2.0.0"
        }
    });
    const { data } = resp;

    if (arrayType === "artworks") {
        artworks = data.map((art: AC.Artwork) => art.name);
        return artworks;
    } else if (arrayType === "bugs") {
        bugs = data.map((bug: AC.Bug) => bug.name);
        return bugs;
    } else { //if (arrayType === "villagers") {
        villagers = data.map((villager: AC.Villagers) => villager.name)
        return villagers;
    }
};