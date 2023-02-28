import { Client } from "../../util/client";
import { CommandInteraction } from "discord.js";

export const setgambling = async (client: Client, interaction: CommandInteraction) => {
    const channel = interaction.options.getChannel("channel")!;
    if (channel.type !== "GUILD_TEXT") return interaction.reply({ content: "Only text channels can be set as the gambling channel.", ephemeral: true });

    if (channel.isThread()) return interaction.reply({ content: "Thread channels are not allowed to be set as the gambling channel.", ephemeral: true });

    await client.guildInfo.findByIdAndUpdate(
        interaction.guildId!,
        { $set: { "gambling.gamblingChannel": channel.id } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return interaction.reply({ content: `Gambling channel has successfully been set to ${channel}.`, ephemeral: true });
};