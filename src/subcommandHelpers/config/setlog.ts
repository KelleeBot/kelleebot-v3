import { Client } from "../../util/client";
import { CommandInteraction, TextChannel } from "discord.js";

export const setlog = async (client: Client, interaction: CommandInteraction) => {
    const channel = interaction.options.getChannel("channel")!;
    if (channel.type !== "GUILD_TEXT") return interaction.reply({ content: "Only text channels can be set as the log channel.", ephemeral: true });

    if (channel.isThread()) return interaction.reply({ content: "Thread channels are not allowed to be set as the log channel.", ephemeral: true });

    await client.guildInfo.findByIdAndUpdate(
        interaction.guildId!,
        { $set: { botLoggingChannel: channel.id } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return interaction.reply({ content: `Bot logging channel has successfully been set to ${channel}.`, ephemeral: true });
};
