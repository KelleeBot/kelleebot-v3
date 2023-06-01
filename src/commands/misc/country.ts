import { Constants, Snowflake } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import axios from "axios";

export default class Country extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "country",
      category: "Misc",
      description: "See information/stats about a country.",
      cooldown: 15,
      clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
      options: [
        {
          name: "country",
          description: "The country to lookup.",
          type: "STRING",
          required: true,
          autocomplete: true
        }
      ],
      isAutocomplete: true,
      autocomplete: async ({ client, interaction }) => {
        await client.utils.getAutocomplete(interaction, client.country);
      },
      execute: async ({ client, interaction }) => {
        await this.setCooldown(interaction);
        await interaction.deferReply();
        try {
          const country = interaction.options.getString("country")!;
          const data = await fetchCountry(country);

          if (!data || !data.length || data[0] === undefined || !data[0]) {
            return interaction.editReply({
              content: `No results were found for "${country}".`
            });
          }

          const msgEmbed = await showCountryInfo(
            client,
            interaction.user.id,
            data[0]
          );
          return interaction.editReply({ embeds: [msgEmbed] });
        } catch (e) {
          client.utils.log(
            "ERROR",
            `${__filename}`,
            `An error has occurred: ${e}`
          );
          return interaction.editReply({
            content:
              "An error has occurred. Unable to fetch country information."
          });
        }
      }
    });
  }
}

const fetchCountry = async (name: string) => {
  const resp = await axios.get(
    `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`
  );
  return resp.data;
};

const showCountryInfo = async (
  client: Client,
  userID: Snowflake,
  country: any
) => {
  const {
    name,
    population,
    region,
    subregion,
    continents,
    capital,
    demonyms,
    area,
    cca3,
    languages,
    flags
  } = country;

  const countryNativeName = name.nativeName
    ? Object.values(name.nativeName).map((n: any) => `${n.official}`)[0]
    : name.official;
  const countryDemonyms = Object.entries(demonyms.eng)
    .map((d) => `${d[0].toUpperCase()}: ${d[1]}`)
    .join("\n");
  const countryAreaM =
    area !== "-"
      ? client.utils.formatNumber(parseFloat((area * 0.62137).toFixed(2)))
      : "-";
  const countryCurrencyName = country.currencies
    ? Object.values(country.currencies)
        .map((c: any) => `${c.name}`)
        .join(", ")
    : "-";
  const countryCurrencyCode = country.currencies
    ? Object.keys(country.currencies).join(", ")
    : "-";
  const countryCurrencySymbol = country.currencies
    ? Object.values(country.currencies)
        .map((c: any) => `${c.symbol}`)
        .join(", ")
    : "-";
  const countryFlag = flags.png;
  const countryLanguages = languages
    ? Object.values(languages).join(", ")
    : "-";

  const msgEmbed = (await client.utils.CustomEmbed({ userID }))
    .setAuthor({ name: `Country Information - ${cca3}`, iconURL: countryFlag })
    .setThumbnail(countryFlag)
    .setTitle(name.official)
    .addFields(
      {
        name: "**Population**",
        value: `${client.utils.formatNumber(population)}`,
        inline: true
      },
      {
        name: "**Capital City**",
        value: !capital || !capital.length ? "-" : capital.join(", "),
        inline: true
      },
      {
        name: "**Main Currency**",
        value:
          countryCurrencyName == "-" &&
          countryCurrencySymbol == "-" &&
          countryCurrencyCode == "-"
            ? "-"
            : `${countryCurrencyName} (${countryCurrencySymbol} ${countryCurrencyCode})`,
        inline: true
      },
      { name: "**Continents**", value: continents.join(", "), inline: true },
      { name: "**Located In**", value: subregion || region, inline: true },
      { name: "**Demonym**", value: countryDemonyms, inline: true },
      { name: "**Native Name**", value: countryNativeName, inline: true },
      { name: "**Languages**", value: countryLanguages, inline: true },
      {
        name: "**Area**",
        value:
          area === "-"
            ? "-"
            : `${client.utils.formatNumber(area)}km (${countryAreaM}m)`,
        inline: true
      }
    )
    .setFooter({ text: "Country data provided by restcountries.com" });
  return msgEmbed;
};
