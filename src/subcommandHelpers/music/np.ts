import { Client } from "../../util/client";
import { MUSIC_COMMANDS } from "../../../config/embedColours.json";
import { ColorResolvable, CommandInteraction, GuildMember, MessageEmbed } from "discord.js";

export const np = async (client: Client, interaction: CommandInteraction) => {
    const { guild } = interaction;
    const { member } = interaction as { member: GuildMember };
    const queue = client.player.getQueue(guild!.id);

    try {
        if (!member!.voice.channel)
            return await interaction.reply({ content: "❌ | You need to be in a voice channel in order to use this command!", ephemeral: true });

        if (!queue || !queue.playing)
            return await interaction.reply({ content: "❌ | There is currently no music playing in the server.", ephemeral: true });

        const progress = queue.createProgressBar();
        const percent = queue.getPlayerTimestamp();
        const nextTrack = queue.tracks[0];
        const { current } = queue;

        const msgEmbed = new MessageEmbed()
            .setAuthor({ name: "Currently Playing", iconURL: client.utils.getGuildIcon(guild!)! })
            .setColor(MUSIC_COMMANDS as ColorResolvable)
            .setDescription(
                `🎶 | **${current.title}** (\`${percent.progress}%\`)\n\n**Up Next: ** ${nextTrack ? `\`${nextTrack.title}\`` : "Nothing"}`
            )
            .setThumbnail(current.thumbnail)
            .addField("\u200b", progress)
            .setFooter({
                text: `Requested by ${current.requestedBy.tag}`,
                iconURL: current.requestedBy.displayAvatarURL({ dynamic: true })
            });

        return await interaction.reply({ embeds: [msgEmbed] });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};
