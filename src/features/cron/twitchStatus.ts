import { ColorResolvable, Snowflake, WebhookClient } from "discord.js";
import cron from "cron";
import axios from "axios";
import { DateTime } from "luxon";
import { Client } from "../../util/client";
import { StatusPageIncident, StatusPageResult } from "../../types/twitchStatus";
import {
  EMBED_COLOR_BLACK,
  EMBED_COLOR_GREEN,
  EMBED_COLOR_ORANGE,
  EMBED_COLOR_RED,
  EMBED_COLOR_YELLOW
} from "../../../config/embedColours.json";
import twitchIncidents from "../../schemas/twitchIncidents";

const webhook = new WebhookClient({ url: `${process.env.TWITCH_WEBHOOK_URL}` });

export default (client: Client) => {
  new cron.CronJob(
    "00 */5 * * * *",
    () => execute(client),
    null,
    true,
    "America/Denver"
  );
};

const execute = async (client: Client) => {
  try {
    const json = await axios.get(
      "https://status.twitch.tv/api/v2/incidents.json"
    );

    const { incidents } = json.data as StatusPageResult;
    for (const incident of incidents.reverse()) {
      const data = await twitchIncidents.findById(incident.id);
      if (!data) {
        updateIncident(client, incident);
        continue;
      }

      const incidentUpdate = DateTime.fromISO(
        incident.updated_at ?? incident.created_at
      );
      if (DateTime.fromISO(data.lastUpdate!.toISOString()) < incidentUpdate) {
        updateIncident(client, incident, data.messageID);
      }
    }
  } catch (e) {
    client.utils.log(
      "ERROR",
      `${__filename}`,
      `Error during fetching and update routine: ${e}`
    );
  }
};
const updateIncident = async (
  client: Client,
  incident: StatusPageIncident,
  messageID?: Snowflake
) => {
  const embed = embedFromIncident(client, incident);
  try {
    const message = await (messageID
      ? webhook.editMessage(messageID, { embeds: [embed] })
      : webhook.send({ embeds: [embed] }));

    await twitchIncidents.findOneAndUpdate(
      {
        _id: incident.id
      },
      {
        _id: incident.id,
        lastUpdate: DateTime.now().toISO(),
        messageID: message.id,
        resolved:
          incident.status === "resolved" || incident.status === "postmortem"
      },
      { upsert: true }
    );
  } catch (e) {
    if (messageID) {
      return client.utils.log(
        "ERROR",
        `${__filename}`,
        `Error during webhook update on incident: ${incident.id}, message: ${messageID}\n${e}`
      );
    }
    client.utils.log(
      "ERROR",
      `${__filename}`,
      `Error during webhook sending on incident: ${incident.id}\n${e}`
    );
  }
};

const embedFromIncident = (client: Client, incident: StatusPageIncident) => {
  const color =
    incident.status === "resolved" || incident.status === "postmortem"
      ? EMBED_COLOR_GREEN
      : incident.impact === "critical"
      ? EMBED_COLOR_RED
      : incident.impact === "major"
      ? EMBED_COLOR_ORANGE
      : incident.impact === "minor"
      ? EMBED_COLOR_YELLOW
      : EMBED_COLOR_BLACK;

  const affectedNames = incident.components.map((c) => c.name);

  const embed = client.utils
    .createEmbed()
    .setColor(color as ColorResolvable)
    .setTimestamp(new Date(incident.started_at))
    .setURL(incident.shortlink)
    .setTitle(incident.name)
    .setAuthor({
      name: "Twitch",
      iconURL: "https://cdn.discordapp.com/emojis/936023897516679178.png"
    })
    .setFooter({ text: incident.id });

  for (const update of incident.incident_updates.reverse()) {
    const updateDT = DateTime.fromISO(update.created_at);
    const timeString = `<t:${Math.floor(updateDT.toSeconds())}:R>`;
    embed.addFields({
      name: `${update.status.charAt(0).toUpperCase()}${update.status.slice(
        1
      )} (${timeString})`,
      value: update.body
    });
  }

  const descriptionParts = [`- Impact: ${incident.impact}`];

  if (affectedNames.length) {
    descriptionParts.push(`- Affected Components: ${affectedNames.join(", ")}`);
  }

  embed.setDescription(descriptionParts.join("\n"));
  return embed;
};
