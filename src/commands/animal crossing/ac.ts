import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { artwork, bug, clothing, diy, fish, furniture, interior, items, photo, sea, tool, villager } from "../../subcommandHelpers/animal crossing";

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
                    options: [
                        {
                            name: "artwork",
                            description: "The name of the artwork you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.artworks);

                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await artwork(client, interaction);
                    }
                },
                bug: {
                    description: "Retrieve information about a specific bug in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "bug",
                            description: "The name of the bug you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.bugs);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await bug(client, interaction);
                    }
                },
                clothing: {
                    description: "Retrieve information about a specific clothing item in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "clothing",
                            description: "The name of the clothing you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.clothings);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await clothing(client, interaction);
                    }
                },
                diy: {
                    description: "Retrieve information about a specific diy/recipe in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "diy",
                            description: "The name of the item you wish to retrieve recipe information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.diys);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await diy(client, interaction);
                    }
                },
                dream: {
                    description: "Show's the server owner's ACNH dream address, if they have one set.",
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        const guildInfo = await client.guildInfo.get(interaction.guildId!);
                        if (!guildInfo.dreamAddress)
                            return interaction.reply({ content: "Looks like the server owner has not set their dream address yet." });

                        const owner = await interaction.guild?.fetchOwner();
                        return interaction.reply({ content: `${owner?.user.username}'s ACNH dream address is ${guildInfo.dreamAddress}.` });
                    }
                },
                fish: {
                    description: "Retrieve information about a specific fish in Animal Crossing: New Horizons",
                    options: [
                        {
                            name: "fish",
                            description: "The name of the fish you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.fishes);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await fish(client, interaction);
                    }
                },
                furniture: {
                    description: "Retrieve information about a specific furniture in Animal Crossing: New Horizons",
                    options: [
                        {
                            name: "furniture",
                            description: "The name of the furniture you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.furnitures);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await furniture(client, interaction);
                    }
                },
                interior: {
                    description: "Retrieve information about a specific interior item in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "interior",
                            description: "The name of the interior item you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.interiors);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await interior(client, interaction);
                    }
                },
                item: {
                    description: "Retrieve information about a miscellaneous item in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "item",
                            description: "The name of the item you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.item);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await items(client, interaction);
                    }
                },
                photo: {
                    description: "Retrieve information about a character photo or poster in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "photo",
                            description: "The name of the photo or poster you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.photos);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await photo(client, interaction);
                    }
                },
                sea: {
                    description: "Retrieve information about a specific sea creature in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "creature",
                            description: "The name of the sea creature you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.sea);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await sea(client, interaction);
                    }
                },
                tool: {
                    description: "Retrieve information about a specific tool in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "tool",
                            description: "The name of the tool item you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.tools);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await tool(client, interaction);
                    }
                },
                villager: {
                    description: "Retrieve information about a specific villager in any Animal Crossing game.",
                    options: [
                        {
                            name: "name",
                            description: "The name of the villager you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        await client.utils.getAutocomplete(client, interaction, client.villager);
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