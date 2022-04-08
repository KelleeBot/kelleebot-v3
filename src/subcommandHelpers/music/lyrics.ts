import { Client } from "../../util/client";
import { MUSIC_COMMANDS } from "../../../config/embedColours.json";
import { ColorResolvable, CommandInteraction, Message, Util } from "discord.js";
import axios from "axios";

export const lyrics = async (client: Client, interaction: CommandInteraction) => {
    const queue = client.player.getQueue(interaction.guildId!);
    const query = interaction.options.getString("query")!;

    let searchQuery = "";
    if ((!queue || !queue.playing) && !query)
        return await interaction.reply({ content: "Please specify a song and artist to search lyrics for.", ephemeral: true });

    if (!query && queue.playing) {
        searchQuery = removeCharacters(queue.current.title);
    } else if (query.length > 0) {
        searchQuery = query;
    } else {
        return await interaction.reply({ content: "Please specify a song and artist to search lyrics for.", ephemeral: true });
    }

    const msg = (await interaction.reply({ content: "Searching for lyrics...", fetchReply: true })) as Message;
    try {
        const resp = await axios.get(`https://api.lxndr.dev/lyrics/?song=${encodeURIComponent(searchQuery)}&from=${client.user!.id}`);
        const { data } = resp;

        if (!data || (data as { error: boolean }).error) return msg.edit({ content: `No lyrics were found for "${searchQuery}".` });

        const albumArt = data.album_art ?? "https://api.zhycorp.net/assets/images/icon.png";
        const songArtist = data.artist ?? "";
        const songName = data.song ?? client.utils.titleCase(searchQuery);

        const embedArray = [];
        const lyricsArray = Util.splitMessage(data.lyrics);
        if (lyricsArray.length == 1) {
            const msgEmbed = client.utils
                .createEmbed()
                .setColor(MUSIC_COMMANDS as ColorResolvable)
                .setTitle(`${songArtist ? `${songArtist} - ` : " "}${songName}`)
                .setThumbnail(albumArt)
                .setDescription(data.lyrics.trim())
                .setFooter({ text: "Page 1 of 1", iconURL: "https://api.zhycorp.net/assets/images/icon.png" });
            return msg.edit({ content: "Here's what I found.", embeds: [msgEmbed] });
        }

        for (let i = 0; i < lyricsArray.length; i++) {
            let songLyrics = "";
            const msgEmbed = client.utils
                .createEmbed()
                .setColor(MUSIC_COMMANDS as ColorResolvable)
                .setTitle(`${songArtist ? `${songArtist} - ` : " "}${songName}`)
                .setThumbnail(albumArt)
                .setFooter({
                    text: `Page ${i + 1} of ${lyricsArray.length}`,
                    iconURL: "https://api.zhycorp.net/assets/images/icon.png"
                });
            songLyrics += lyricsArray[i];
            msgEmbed.setDescription(songLyrics.trim());
            embedArray.push(msgEmbed);
        }
        msg.edit({ content: "Here's what I found." });
        return client.utils.paginate(interaction, embedArray, { time: 1000 * 60 * 10 });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return msg.edit({ content: "An error has occurred. Please try again." });
    }
};

const removeCharacters = (songName: string) => {
    // remove stuff like (Official Video)
    songName = songName.replace(/ *\([^)]*\) */g, "");

    // remove emojis
    songName = songName.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ""
    );
    return songName;
};
