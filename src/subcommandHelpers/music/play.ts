import { Client } from "../../util/client";
import { CommandInteraction, GuildMember } from "discord.js";
import { QueryType } from "discord-player";

export const play = async (client: Client, interaction: CommandInteraction) => {
    try {
        const { member } = interaction as { member: GuildMember };
        const query = interaction.options.getString("query")!;

        if (!member.voice.channel)
            return await interaction.reply({ content: "❌ | You need to be in a voice channel in order to play music!", ephemeral: true });

        if (interaction.guild?.me?.voice.channelId && member.voice.channelId !== interaction.guild?.me?.voice.channelId)
            return await interaction.reply({
                content: `❌ | You must be in the same voice channel (<#${interaction.guild!.me!.voice.channelId}) as me!`,
                ephemeral: true
            });

        const queue = client.player.createQueue(interaction.guild!, {
            ytdlOptions: {
                quality: "highest",
                filter: "audioonly",
                highWaterMark: 1 << 25,
                dlChunkSize: 0
            },
            metadata: {
                channel: interaction.channel,
                guild: interaction.guild
            }
        });

        try {
            if (!queue.connection)
                await queue.connect(member.voice.channel);
        } catch (e) {
            client.player.deleteQueue(interaction.guildId!);
            return await interaction.reply({ content: "❌ | I could not join your voice channel.", ephemeral: true });
        }

        const searchResult = await client.player.search(query, {
            requestedBy: interaction.user,
            searchEngine: query.includes("soundcloud") ? QueryType.SOUNDCLOUD : QueryType.AUTO
        });

        if (!searchResult)
            return await interaction.reply({ content: `❌ | No results were found for "${query}".`, ephemeral: true });

        await interaction.reply({ content: `⏱ | Loading your ${searchResult.playlist ? "playlist" : "track"}...` });

        searchResult.playlist
            ? queue.addTracks(searchResult.tracks)
            : queue.addTrack(searchResult.tracks[0]);

        await interaction.editReply({
            content: `Successfully loaded ${searchResult.playlist
                ? `playlist **${searchResult.playlist.title}**`
                : `track **${searchResult.tracks[0].title} - ${searchResult.tracks[0].author}**`}`
        });

        if (!queue.playing) await queue.play();
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
}