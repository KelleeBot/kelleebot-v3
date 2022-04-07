import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Channels extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "channels",
            category: "Utility",
            description: "Check all the channels that the bot will ignore and disable/enable them.",
            cooldown: 5,
            canNotDisable: true,
            ignoreDisabledChannels: true,
            ownerOnly: true,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            subcommands: {
                list: {
                    description: "Lists all disabled channels",
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);

                        const guildInfo = await client.guildInfo.get(interaction.guildId!);

                        const embed = (await client.utils.CustomEmbed({ userID: interaction.user.id })).setTimestamp();

                        if (!guildInfo?.disabledChannels?.length)
                            embed.setDescription(`${interaction.user}, there are no disabled channels in this server!`);
                        else
                            embed.setDescription(
                                `These channels are currently disabled:\n${guildInfo.disabledChannels.map((id) => `<#${id}>`).join(" ")}`
                            );
                        return await interaction.reply({ embeds: [embed] });
                    }
                },
                disable: {
                    description: "Disable a channel",
                    options: [
                        {
                            name: "channel",
                            description: "The channel you want to disable",
                            type: "CHANNEL",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);

                        const guildInfo = await client.guildInfo.get(interaction.guildId!);

                        const embed = (await client.utils.CustomEmbed({ userID: interaction.user.id })).setTimestamp();

                        const channel = interaction.options.getChannel("channel");

                        if (channel!.type !== "GUILD_TEXT") embed.setDescription(`${interaction.user}, you can only disable text channels.`);
                        else if (guildInfo?.disabledChannels?.includes(channel!.id))
                            embed.setDescription(`${interaction.user}, the channel ${channel} is already disabled.`);
                        else {
                            await client.guildInfo.findByIdAndUpdate(
                                interaction.guildId!,
                                { $push: { disabledChannels: channel!.id } },
                                { new: true, upsert: true, setDefaultsOnInsert: true }
                            );
                            embed.setDescription(`${interaction.user}, the channel ${channel} has been disabled.`);
                        }
                        return await interaction.reply({ embeds: [embed] });
                    }
                },
                enable: {
                    description: "Enable a channel",
                    options: [
                        {
                            name: "channel",
                            description: "The channel you want to enable",
                            type: "CHANNEL",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);

                        const guildInfo = await client.guildInfo.get(interaction.guildId!);

                        const embed = (await client.utils.CustomEmbed({ userID: interaction.user.id })).setTimestamp();

                        const channel = interaction.options.getChannel("channel");

                        if (channel!.type !== "GUILD_TEXT") embed.setDescription(`${interaction.user}, you can only enable text channels.`);
                        else if (!guildInfo?.disabledChannels?.includes(channel!.id))
                            embed.setDescription(`${interaction.user}, the channel ${channel} is already enabled.`);
                        else {
                            await client.guildInfo.findByIdAndUpdate(
                                interaction.guildId!,
                                { $pull: { disabledChannels: channel!.id } },
                                { new: true, upsert: true, setDefaultsOnInsert: true }
                            );

                            embed.setDescription(`${interaction.user}, the channel ${channel} has been enabled.`);
                        }
                        return await interaction.reply({ embeds: [embed] });
                    }
                }
            }
        });
    }
}
