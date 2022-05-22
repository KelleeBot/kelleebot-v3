import { Client } from "../../util/client";
import { MUSIC_COMMANDS } from "../../../config/embedColours.json";
import { ColorResolvable, CommandInteraction, GuildMember } from "discord.js";

export const remove = async (client: Client, interaction: CommandInteraction) => {
    const { guildId } = interaction;
    const { member } = interaction as { member: GuildMember };
    const trackToRemove = interaction.options.getInteger("track")!;
    const queue = client.player.getQueue(guildId!);

    try {
        if (!member!.voice.channel)
            return await interaction.reply({ content: "❌ | You need to be in a voice channel in order to use this command!", ephemeral: true });

        if (!queue || !queue.playing)
            return await interaction.reply({ content: "❌ | There is currently no music playing in the server.", ephemeral: true });

        const msgEmbed = client.utils
            .createEmbed()
            .setColor(MUSIC_COMMANDS as ColorResolvable)
            .setAuthor({ name: "Track Removed", iconURL: client.utils.getGuildIcon(interaction.guild!)! })

        const { tracks } = queue;
        if (tracks.length === 0) {
            msgEmbed.setDescription("❌ | There's nothing to remove from the queue!");
            return await interaction.reply({ embeds: [msgEmbed] });
        }

        if (trackToRemove > tracks.length) {
            msgEmbed.setDescription(`❌ | The track you're trying to remove is not in the queue! Please type a number between 1 and ${tracks.length}.`);
            return await interaction.reply({ embeds: [msgEmbed] });
        }

        const removedTrack = queue.remove(tracks[trackToRemove - 1]);
        msgEmbed.setDescription(`${removedTrack.title
            } has been removed from the queue.\n\nThere's now \`${tracks.length - 1
            }\` song${tracks.length !== 1 ? "s" : ""} in the queue.`)
        return await interaction.reply({ embeds: [msgEmbed] });
    } catch (e: any) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e.message}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
}