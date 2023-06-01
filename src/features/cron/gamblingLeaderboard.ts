import { ColorResolvable, TextChannel } from "discord.js";
import cron from "cron";
import { Client } from "../../util/client";
import { GAMBLING } from "../../../config/embedColours.json";
import { timeZone } from "../../../config/config.json";
import { Guild } from "../../types/guild";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import gambling from "../../schemas/gambling";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);

export default (client: Client) => {
  new cron.CronJob(
    "00 */5 * * * *",
    () => execute(client),
    null,
    true,
    timeZone
  );
};

const execute = async (client: Client) => {
  const msgEmbed = client.utils
    .createEmbed()
    .setColor(GAMBLING as ColorResolvable)
    .setTitle("Gambling Leaderboard")
    .setThumbnail("https://i.imgur.com/VwbWTOn.png")
    .setFooter({ text: "Leaderboard last updated " })
    .setTimestamp();

  client.guilds.cache.forEach(async (guild) => {
    try {
      let guildInfo = await client.guildInfo.get(guild.id);
      if (!guildInfo.gambling) return;

      const { gamblingLeaderboardChannel } = guildInfo.gambling;
      const channel = client.channels.cache.get(
        gamblingLeaderboardChannel
      ) as TextChannel;
      if (!channel) return;

      const messages = await channel.messages.fetch();
      const firstMessage = messages.first();
      const topGamblers = await fetchTopGamblers(client, guildInfo);
      msgEmbed.setDescription(topGamblers);

      if (firstMessage) await firstMessage.edit({ embeds: [msgEmbed] });
      else await channel.send({ embeds: [msgEmbed] });
    } catch (e) {
      client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
  });
};

const fetchTopGamblers = async (client: Client, guild: Guild) => {
  const nextMonth = dayjs().tz(timeZone).add(1, "months").month();
  const year =
    nextMonth > 11 || nextMonth === 0
      ? dayjs().tz(timeZone).add(1, "years").year()
      : new Date().getFullYear();
  const date = `${year}-${
    nextMonth > 11 || nextMonth === 0 ? 1 : nextMonth + 1
  }-01`;

  const updateTimestamp = Math.round(
    (new Date().getTime() + 1000 * 60 * 5) / 1000
  );
  const timestamp = dayjs.tz(`${date} 00:00`, timeZone).unix();

  let text = guild.gambling.monthlyPrize
    ? `Person with the most points at the end of each month gets a free month of *${guild.gambling.monthlyPrize}*. A winner will be determined on <t:${timestamp}:F>.\n\n`
    : "Here are the top 10 gamblers with the most points:\n\n";

  const results = await gambling
    .find({ guildID: guild._id })
    .sort({ points: -1 })
    .limit(10);

  for (let count = 0; count < results.length; count++) {
    const { userID, points = 0 } = results[count];
    if (points === 0) continue;
    text += `${count + 1}. <@${userID}> has ${client.utils.pluralize(
      points,
      "point",
      true
    )}.\n`;
  }

  text += guild.gambling.monthlyPrize
    ? `\nPoints will reset back to 0 <t:${timestamp}:R>.\n`
    : "\n";

  text += `\nLeaderboard will update <t:${updateTimestamp}:R>.\n`;
  return text;
};
