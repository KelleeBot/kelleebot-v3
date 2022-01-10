import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, Snowflake, Util } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import weather from "weather-js";
import { format, utcToZonedTime } from "date-fns-tz";
import { find } from "geo-tz";
import convert from "convert";
import { DateTime } from "luxon";

export default class Weather extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "weather",
            category: "Misc",
            description: "Tells you the weather for the specified location.",
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            cooldown: 15,
            options: [
                {
                    name: "location",
                    description: "The location you want to see the weather for.",
                    type: "STRING",
                    required: true
                }
            ]
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        const location = interaction.options.getString("location")!;
        try {
            weather.find({ search: location, degreeType: "C" },
                async (err: any, result: any) => {
                    if (err) {
                        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${err}`);
                        return interaction.reply({ content: "An error occurred while trying to fetch weather data. Please try again.", ephemeral: true });
                    }

                    if (!result || !result.length || !result[0])
                        return interaction.reply({ content: `No results were found for "${location}".`, ephemeral: true });

                    this.setCooldown(interaction);
                    if (result.length > 1) {
                        return await showAllLocations(client, location, result, interaction);
                    } else {
                        const weatherEmbed = await showWeatherResult(client, interaction.user.id, result[0]);
                        return interaction.reply({ embeds: [weatherEmbed] });
                    }
                });
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
            return interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
        }
    }
}

const showAllLocations = async (client: Client, query: string, results: any[], interaction: CommandInteraction) => {
    let text = "";
    const selectMenu = new MessageSelectMenu()
        .setCustomId("weather")
        .setPlaceholder("Select a Location");

    for (let i = 0; i < results.length; i++) {
        text += `${i + 1}. ${results[i].location.name}\n`;

        selectMenu.addOptions({
            label: Util.splitMessage(results[i].location.name, { maxLength: 25, char: " " })[0],
            description: results[i].location.name,
            value: i.toString()
        });
    }

    const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
        .setTitle(`${client.utils.titleCase(query)} returned ${results.length} results`)
        .setDescription(text)
        .setFooter({ text: "Select the location you want to see the weather results for." });

    const row = new MessageActionRow().addComponents(selectMenu);
    const msg = await interaction.reply({ embeds: [msgEmbed], components: [row], fetchReply: true }) as Message;

    const filter = async (i: SelectMenuInteraction) => {
        await i.deferUpdate();
        return i.user.id === interaction.user.id;
    };
    const collector = msg.channel.createMessageComponentCollector({ filter, componentType: "SELECT_MENU", time: 1000 * 20 });
    collector.on("collect", async (i) => {
        if (i.customId === "weather") {
            const choice = +i.values[0];
            const location = results[choice];

            collector.stop();
            const weatherEmbed = await showWeatherResult(client, i.user.id, location);
            msg.edit({ embeds: [weatherEmbed], components: [] });
        }
    });

    collector.on("end", (_collected, reason) => {
        if (reason === "time") {
            msgEmbed
                .setTitle("Time Expired")
                .setDescription("You did not choose a location in time.")
                .setFooter({ text: "" });

            msg.edit({ embeds: [msgEmbed], components: [] });
        }
    });
};

const showWeatherResult = async (client: Client, userID: Snowflake, city: any) => {
    const { location, current } = city;
    const { name } = location;
    const { temperature, windspeed, observationtime, imageUrl, feelslike, humidity, skytext } = current;

    const miles = Number(convert(+windspeed.split(" ")[0], "kilometers").to("miles")).toFixed(1);
    const timezone = getTimezone(current, location);
    const lastUpdatedAt = observationtime.substring(0, observationtime.length - 3) // Remove ":00" from time

    const convertToFahrenheit = (temp: number) => convert(temp, "C").to("F").toFixed(1);

    const msgEmbed = (await client.utils.CustomEmbed({ userID }))
        .setTitle(`Current weather for ${name}`)
        .setThumbnail(imageUrl)
        .addFields(
            { name: "**Local Time**", value: getTimezone(current, location, true), inline: false },
            { name: "**Location**", value: name, inline: true },
            { name: "**Current Weather**", value: skytext, inline: true },
            { name: "**Wind Speed**", value: `${windspeed} (${miles} m/h)`, inline: true },
            { name: "**Temperature**", value: `${temperature}°C (${convertToFahrenheit(+temperature)}°F)`, inline: true },
            { name: "**Feels Like**", value: `${feelslike}°C (${convertToFahrenheit(+feelslike)}°F)`, inline: true },
            { name: "**Humidity**", value: `${humidity}%`, inline: true }
        )
        .setFooter({ text: `Forecast last updated at ${lastUpdatedAt} ${timezone}` });

    return msgEmbed;
}

const getTimezone = (current: any, location: any, showTime?: boolean) => {
    const lat = location.lat;
    const long = location.long;

    const timeFormat = showTime ? "EEE, MMM d, yyyy h:mm a zzz" : "zzz";
    const date = current.date;
    const time = current.observationtime;
    const timeZone = find(+lat, +long)[0];
    const lastUpdated = utcToZonedTime(`${date} ${time}`, timeZone);
    const localTime = utcToZonedTime(new Date(), timeZone);

    return showTime
        ? format(localTime, timeFormat, { timeZone })
        : format(lastUpdated, timeFormat, { timeZone });
};