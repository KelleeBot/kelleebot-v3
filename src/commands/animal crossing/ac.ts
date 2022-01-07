import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { artwork, bug, clothing, villager } from ".";
import * as AC from "../../types/animalCrossing";
import axios from "axios";

let artworks: string[] = [];
let bugs: string[] = [];
let clothings: string[] = [];
let diys: string[] = [];
let fishes: string[] = [];
let furnitures: string[] = [];
let interiors: string[] = [];
let items: string[] = [];
let photos: string[] = [];
let seaCreatures: string[] = [];
let tools: string[] = [];
let villagers: string[] = [];

export default class AnimalCrossing extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "ac",
            category: "Animal Crossing",
            description: "All commands that are related to Animal Crossing.",
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
                clothing: {
                    description: "Retrieve information about a specific clothing item in Animal Crossing: New Horizons.",
                    args: [
                        {
                            name: "clothing",
                            description: "The clothing name.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/clothing", "clothing");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await clothing(client, interaction);
                    }
                },
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

const fetchData = async (url: string, arrayType: "artworks" | "bugs" | "clothing" | "diys" | "fishes" | "furnitures" | "interiors" | "items" | "photos" | "seaCreatures" | "tools" | "villagers") => {
    if (arrayType === "artworks") {
        if (artworks.length) return artworks;
    } else if (arrayType === "bugs") {
        if (bugs.length) return bugs;
    } else if (arrayType === "clothing") {
        if (clothings.length) return clothings;
    } else if (arrayType === "diys") {
        if (diys.length) return diys;
    } else if (arrayType === "fishes") {
        if (fishes.length) return fishes;
    } else if (arrayType === "furnitures") {
        if (furnitures.length) return furnitures;
    } else if (arrayType === "interiors") {
        if (interiors.length) return interiors;
    } else if (arrayType === "items") {
        if (items.length) return items;
    } else if (arrayType === "photos") {
        if (photos.length) return photos;
    } else if (arrayType === "seaCreatures") {
        if (seaCreatures.length) return seaCreatures;
    } else if (arrayType === "tools") {
        if (tools.length) return tools;
    } else {
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
    } else if (arrayType === "clothing") {
        clothings = data.map((clothing: AC.Clothing) => clothing.name);
        return clothings;
    } else if (arrayType === "diys") {
        diys = data.map((diy: AC.Recipe) => diy.name);
        return diys;
    } else if (arrayType === "fishes") {
        fishes = data.map((fish: AC.Fish) => fish.name);
        return fishes;
    } else if (arrayType === "furnitures") {
        furnitures = data.map((furniture: AC.Furniture) => furniture.name);
        return furnitures;
    } else if (arrayType === "interiors") {
        interiors = data.map((interior: AC.Interior) => interior.name);
        return interiors;
    } else if (arrayType === "items") {
        items = data.map((item: AC.Item) => item.name);
        return items;
    } else if (arrayType === "photos") {
        photos = data.map((photo: AC.Photo) => photo.name);
        return photos;
    } else if (arrayType === "seaCreatures") {
        seaCreatures = data.map((seaCreature: AC.Sea) => seaCreature.name);
        return seaCreatures;
    } else if (arrayType === "tools") {
        tools = data.map((tool: AC.Tool) => tool.name);
        return tools;
    } else {
        villagers = data.map((villager: AC.Villagers) => villager.name)
        return villagers;
    }
};