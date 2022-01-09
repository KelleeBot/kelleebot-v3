import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, Snowflake, Util } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { TvResult } from "moviedb-promise/dist/request-types";
import { DateTime } from "luxon";

export default class TV extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "tv",
            category: "Misc",
            description: "See information about a TV show.",
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            cooldown: 15,
            options: [{
                name: "show",
                description: "The TV show to lookup",
                type: "STRING",
                required: true
            }]
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
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
}

const showAllShows = async (query: string, results: TvResult[], interaction: CommandInteraction, client: Client) => {
    let tvList = "";
    const selectMenu = new MessageSelectMenu()
        .setCustomId("tv")
        .setPlaceholder("Select a TV Show");

    for (let i = 0; i < results.length; i++) {
        let title = Util.escapeMarkdown(results[i].name!);
        let firstAirDate = results[i].first_air_date ? results[i].first_air_date!.substring(0, 4) : "";
        tvList += `${i + 1}. ${title} ${firstAirDate !== "" ? `(${firstAirDate})` : ""}\n`;
        selectMenu.addOptions({
            label: Util.splitMessage(title, { maxLength: 25, char: " " })[0],
            description: title,
            value: i.toString()
        });
    }

    const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
        .setTitle(`Here are the results for ${client.utils.titleCase(query)}:`)
        .setDescription(tvList)
        .setFooter({ text: "Select the TV show from the dropdown you want to see information for." });

    const row = new MessageActionRow().addComponents(selectMenu);
    const msg = await interaction.reply({ embeds: [msgEmbed], components: [row], ephemeral: true, fetchReply: true }) as Message;

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
            interaction.followUp({
                content: `${interaction.user}, here's some information about **${results[choice].name}:**`,
                embeds: [tvEmbed],
                allowedMentions: { parse: [] }
            });
        }
    });

    collector.on("end", (_collected, reason) => {
        if (reason === "time") {
            msgEmbed
                .setTitle("Time Expired")
                .setDescription("You did not choose a TV show in time.")
                .setFooter({ text: "" });

            interaction.followUp({ embeds: [msgEmbed], ephemeral: true });
        }
    });
}

const showTvInfo = async (client: Client, userID: Snowflake, show: TvResult) => {
    const {
        id,
        name,
        original_language,
        original_name,
        poster_path,
        first_air_date,
        vote_average,
        overview
    } = show;

    const timestamp = DateTime.fromISO(new Date(`${first_air_date}`).toISOString()).toSeconds();
    const firstAirTimestamp = timestamp ? `<t:${timestamp}:F> (<t:${timestamp}:R>)` : '';
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
            { name: "**First Air Date**", value: firstAirDate, inline: true },
            { name: "**Rating (out of 10)**", value: `${vote_average}`, inline: true }
        )
        .setFooter({
            text: "Powered by TMDB",
            iconURL: "https://pbs.twimg.com/profile_images/1243623122089041920/gVZIvphd_400x400.jpg"
        });
    return msgEmbed;
};