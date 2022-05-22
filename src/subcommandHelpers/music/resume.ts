import { Client } from "../../util/client";
import { MUSIC_COMMANDS } from "../../../config/embedColours.json";
import { ColorResolvable, CommandInteraction, GuildMember } from "discord.js";

export const resume = async (client: Client, interaction: CommandInteraction) => {
    const { guildId } = interaction;
    const { member } = interaction as { member: GuildMember };
    const queue = client.player.getQueue(guildId!);

    try {
        if (!member!.voice.channel)
            return await interaction.reply({ content: "❌ | You need to be in a voice channel in order to use this command!", ephemeral: true });

        if (!queue || !queue.playing)
            return await interaction.reply({ content: "❌ | There is currently no music playing in the server.", ephemeral: true });

        const paused = queue.setPaused(false);

        const msgEmbed = client.utils
            .createEmbed()
            .setColor(MUSIC_COMMANDS as ColorResolvable)
            .setAuthor({ name: "Music Paused", iconURL: client.utils.getGuildIcon(interaction.guild!)! })
            .setDescription(paused ? `▶️ | Resumed playing **${queue.current}**` : "❌ | Something went wrong.");
        return await interaction.reply({ embeds: [msgEmbed] });
    } catch (e: any) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
}