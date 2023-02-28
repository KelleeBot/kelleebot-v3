import { Client } from "../../util/client";
import { CommandInteraction } from "discord.js";

export const setleaderboard = async (client: Client, interaction: CommandInteraction) => {
    const channel = interaction.options.getChannel("channel")!;
    const guildInfo = await client.guildInfo.get(interaction.guildId!);

    if (!guildInfo.gambling.gamblingChannel) return interaction.reply({ content: "A gambling channel needs to be set first.", ephemeral: true });

    if (channel.type !== "GUILD_TEXT") return interaction.reply({ content: "Only text channels can be set as the leaderboard channel.", ephemeral: true });

    if (channel.isThread()) return interaction.reply({ content: "Thread channels are not allowed to be set as the leaderboard channel.", ephemeral: true });

    await client.guildInfo.findByIdAndUpdate(
        interaction.guildId!,
        { $set: { "gambling.gamblingLeaderboardChannel": channel.id } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return interaction.reply({ content: `Leaderboard channel has successfully been set to ${channel}.`, ephemeral: true });
};