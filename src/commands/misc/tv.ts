import { Constants, CommandInteraction, SelectMenuInteraction, Snowflake, Util } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { TvResult } from "moviedb-promise/dist/request-types";
import { DateTime } from "luxon";
import axios from "axios";

export default class TV extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "tv",
            category: "Misc",
            description: "See information about a TV show.",
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            cooldown: 15,
            options: [
                {
                    name: "show",
                    description: "The TV show to lookup",
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                }
            ],
            execute: async ({ client, interaction }) => {
                const tv = interaction.options.getString("show")!;
                try {
                    const res = await client.movieDb.searchTv({ query: tv, page: 1, include_adult: false });
                    if (!res || !res.results || !res.results[0])
                        return interaction.reply({ content: `No results were found for "${tv}".`, ephemeral: true });

                    this.setCooldown(interaction);

                    if (res.results.length > 1) {
                        return await showAllShows(tv, res.results, interaction, client);
                    } else {
                        const tvEmbed = await showTvInfo(client, interaction.user.id, res.results[0]);
                        return interaction.reply({ embeds: [tvEmbed] });
                    }
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return interaction.reply({ content: "An error has occurred. Please try again." });
                }
            }
        });
    }
}

const showAllShows = async (query: string, results: TvResult[], interaction: CommandInteraction, client: Client) => {
    let tvList = "";
    const selectMenu = client.utils.createSelectMenu().setCustomId("tv").setPlaceholder("Select a TV Show");

    for (let i = 0; i < results.length; i++) {
        let title = Util.escapeMarkdown(results[i].name!);
        let firstAirDate = results[i].first_air_date ? results[i].first_air_date!.substring(0, 4) : "";
        tvList += `${i + 1}. ${title} ${firstAirDate !== "" ? `(${firstAirDate})` : ""}\n`;
        selectMenu.addOptions({
            label: client.utils.splitMessage(title, { maxLength: 100, char: " " })[0],
            description: results[i].original_language !== "en" && results[i].original_name ? results[i].original_name : "",
            value: i.toString()
        });
    }

    const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
        .setTitle(`Here are the results for ${client.utils.titleCase(query)}:`)
        .setDescription(tvList)
        .setFooter({ text: "Select the TV show from the dropdown you want to see information for." });

    const row = client.utils.createActionRow().addComponents(selectMenu);
    const msg = await client.utils.fetchReply(interaction, { embeds: [msgEmbed], components: [row] });

    const filter = async (i: SelectMenuInteraction) => {
        await i.deferUpdate();
        return i.user.id === interaction.user.id;
    };
    const collector = msg.channel.createMessageComponentCollector({ filter, componentType: "SELECT_MENU", time: 1000 * 20 });
    collector.on("collect", async (i) => {
        if (i.customId === "tv") {
            const choice = +i.values[0];
            const show = results[choice];

            collector.stop();
            const tvEmbed = await showTvInfo(client, i.user.id, show);
            await i.editReply({ embeds: [tvEmbed], components: [] });
        }
    });

    collector.on("end", async (_collected, reason) => {
        if (reason === "time") {
            msgEmbed.setTitle("Time Expired").setDescription("You did not choose a TV show in time.").setFooter({ text: "" });
            await msg.edit({ embeds: [msgEmbed], components: [] });
        }
    });
};

const showTvInfo = async (client: Client, userID: Snowflake, show: TvResult) => {
    const { id, name, origin_country, original_language, original_name, poster_path, first_air_date, vote_average, overview } = show;

    const tvDetails = await client.movieDb.tvInfo({ id: `${id}` });
    const { genres, in_production, last_air_date, number_of_episodes, number_of_seasons } = tvDetails;

    const firstAirDateTimestamp = DateTime.fromISO(new Date(`${first_air_date}`).toISOString()).toSeconds();
    const firstAirTimestamp = firstAirDateTimestamp ? `<t:${firstAirDateTimestamp}:F> (<t:${firstAirDateTimestamp}:R>)` : "";
    const firstAirDate = first_air_date ? firstAirTimestamp : "Unknown";

    const msgEmbed = (await client.utils.CustomEmbed({ userID }))
        .setAuthor({
            name: `${name} ${original_language !== "en" ? `(${original_name})` : ""}`,
            iconURL: "https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg",
            url: `https://www.themoviedb.org/tv/${id}`
        })
        .setThumbnail(poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : "")
        .setDescription(`${overview}\n\nMore info: https://www.themoviedb.org/tv/${id}`)
        .addFields(
            { name: "**Number of Seasons**", value: number_of_seasons ? `${number_of_seasons}` : "0", inline: true },
            { name: "**Number of Episodes**", value: number_of_episodes ? client.utils.formatNumber(number_of_episodes) : "0", inline: true },
            { name: "**Rating (out of 10)**", value: `${vote_average}`, inline: true }
        )
        .setFooter({
            text: "Powered by TMDB",
            iconURL: "https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg"
        });

    const info = await getOriginCountryNameAndLanguage(origin_country!);
    if (origin_country) {
        const country = info.map((country) => country.name);
        msgEmbed.addFields({ name: "**Origin Country**", value: country.join(", "), inline: true });
    }

    if (original_language) {
        const language = info.map((lang) => lang.language);
        msgEmbed.addFields({ name: "**Original Language**", value: language.join(", "), inline: true });
    }
    if (original_language !== "en" && original_name) msgEmbed.addFields({ name: "**Original Title**", value: original_name, inline: true });

    msgEmbed.addFields(
        { name: "**Genres**", value: genres && genres.length ? genres.map((genre) => genre.name).join(", ") : "-", inline: true },
        { name: "**First Air Date**", value: firstAirDate, inline: false }
    );

    if (!in_production) {
        const lastAirDateTimestamp = DateTime.fromISO(new Date(`${last_air_date}`).toISOString()).toSeconds();
        const lastAirTimestamp = lastAirDateTimestamp ? `<t:${lastAirDateTimestamp}:F> (<t:${lastAirDateTimestamp}:R>)` : "";
        msgEmbed.addFields({ name: "**Last Air Date**", value: lastAirTimestamp, inline: false });
    }

    return msgEmbed;
};

const getOriginCountryNameAndLanguage = async (code: string[]) => {
    const countryInfo: { name: string; language: string }[] = [];
    for (let i = 0; i < code.length; i++) {
        const resp = await axios.get(`https://restcountries.com/v3.1/alpha/${code[i]}`);
        countryInfo.push({ name: resp.data[0].name.common, language: Object.values(resp.data[0].languages).join(", ") });
    }
    return countryInfo;
};
