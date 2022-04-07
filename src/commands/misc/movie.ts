import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, Snowflake, Util } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { MovieResult } from "moviedb-promise/dist/request-types";
import { DateTime } from "luxon";

export default class Movie extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "movie",
            category: "Misc",
            description: "See information about a movie.",
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            cooldown: 15,
            options: [
                {
                    name: "movie",
                    description: "The movie to lookup",
                    type: "STRING",
                    required: true
                }
            ],
            execute: async ({ client, interaction }) => {
                const movie = interaction.options.getString("movie")!;
                try {
                    const res = await client.movieDb.searchMovie({ query: movie, page: 1, include_adult: false });
                    if (!res || !res.results || !res.results[0])
                        return interaction.reply({ content: `No results were found for "${movie}".`, ephemeral: true });

                    this.setCooldown(interaction);

                    if (res.results.length > 1) {
                        return await showAllMovies(movie, res.results, interaction, client);
                    } else {
                        const movieEmbed = await showMovieInfo(client, interaction.user.id, res.results[0]);
                        return interaction.reply({ embeds: [movieEmbed] });
                    }
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return interaction.reply({ content: "An error has occurred. Please try again." });
                }
            }
        });
    }
}

const showAllMovies = async (query: string, results: MovieResult[], interaction: CommandInteraction, client: Client) => {
    let movieList = "";
    const selectMenu = new MessageSelectMenu().setCustomId("movie").setPlaceholder("Select a Movie");

    for (let i = 0; i < results.length; i++) {
        let title = Util.escapeMarkdown(results[i].original_title!);
        let releaseYear = results[i].release_date ? results[i].release_date?.substring(0, 4) : "";
        movieList += `${i + 1}. ${title} ${releaseYear ? `(${releaseYear})` : ""}\n`;

        selectMenu.addOptions({
            label: Util.splitMessage(title, { maxLength: 100, char: " " })[0],
            description: results[i].original_language !== "en" ? results[i].title : "",
            value: i.toString()
        });
    }

    const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
        .setTitle(`Here are the results for ${client.utils.titleCase(query)}:`)
        .setDescription(movieList)
        .setFooter({ text: "Select the movie from the dropdown you want to see information for." });

    const row = new MessageActionRow().addComponents(selectMenu);
    const msg = (await interaction.reply({ embeds: [msgEmbed], components: [row], fetchReply: true })) as Message;

    const filter = async (i: SelectMenuInteraction) => {
        await i.deferUpdate();
        return i.user.id === interaction.user.id;
    };
    const collector = msg.channel.createMessageComponentCollector({ filter, componentType: "SELECT_MENU", time: 1000 * 20 });
    collector.on("collect", async (i) => {
        if (i.customId === "movie") {
            const choice = +i.values[0];
            const movie = results[choice];

            collector.stop();
            const movieEmbed = await showMovieInfo(client, i.user.id, movie);
            msg.edit({ embeds: [movieEmbed], components: [] });
        }
    });

    collector.on("end", (_collected, reason) => {
        if (reason === "time") {
            msgEmbed.setTitle("Time Expired").setDescription("You did not choose a movie in time.").setFooter({ text: "" });

            msg.edit({ embeds: [msgEmbed], components: [] });
        }
    });
};

const showMovieInfo = async (client: Client, userID: Snowflake, movie: MovieResult) => {
    const { id, original_title, original_language, title, poster_path, release_date, vote_average, overview } = movie;

    const movieInfo = await client.movieDb.movieInfo({ id: `${id}` });
    const { budget, genres, revenue, runtime, homepage, production_companies } = movieInfo;

    const timestamp = DateTime.fromISO(new Date(`${release_date}`).toISOString()).toSeconds();
    const releaseTimestamp = timestamp ? `<t:${timestamp}:F> (<t:${timestamp}:R>)` : "";
    const movieReleaseDate = release_date ? releaseTimestamp : "Unknown";

    const msgEmbed = (await client.utils.CustomEmbed({ userID }))
        .setAuthor({
            name: `${original_title} ${original_language !== "en" ? `(${title})` : ""}`,
            iconURL: "https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg",
            url: `https://www.themoviedb.org/movie/${id}`
        })
        .setThumbnail(poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : "")
        .setDescription(`${overview}\n\n${homepage ? `Homepage: ${homepage}\n` : ""}More info: https://www.themoviedb.org/movie/${id}`)
        .addFields(
            { name: "**Release Date**", value: movieReleaseDate, inline: false },
            { name: "**Budget**", value: `$${client.utils.formatNumber(budget!)}`, inline: true },
            { name: "**Revenue**", value: `$${client.utils.formatNumber(revenue!)}`, inline: true },
            { name: "**Runtime**", value: `${runtime} minutes`, inline: true },
            { name: "**Rating (out of 10)**", value: `${vote_average}`, inline: true },
            {
                name: "**Produced By**",
                value: production_companies && production_companies.length ? production_companies.map((company) => company.name).join(", ") : "-",
                inline: true
            },
            { name: "**Genres**", value: genres && genres.length ? genres.map((genre) => genre.name).join(", ") : "-", inline: true }
        )
        .setFooter({
            text: "Powered by TMDB",
            iconURL: "https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg"
        });
    return msgEmbed;
};
