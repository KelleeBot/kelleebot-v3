import cron from "cron";
import { TextChannel, Constants } from "discord.js";
import { Client } from "../../util/client";
import { DateTime } from "luxon";

export default (client: Client) => {
	new cron.CronJob("*/30 * * * * *", () => execute(client), null, true, "America/Edmonton");
};

const execute = async (client: Client) => {
	try {
		client.guilds.cache.forEach(async (guild) => {
			const guildInfo = await client.guildInfo.get(guild.id);
			if (guildInfo.streamerLive) {
				const { channelID, twitchChannel, message } = guildInfo.streamerLive;
				if (!channelID || !twitchChannel || !message) return;

				const stream = await client.twitchApi.getStreams({ channel: twitchChannel });
				if (!stream) return;

				let twitchLiveInfo = await client.utils.getTwitchLive(client, guild.id);
				const currentStream = stream.data.filter((val) => val.user_name.toLowerCase().trim() === twitchChannel.toLowerCase().trim());

				if (!currentStream.length) {
					if (!twitchLiveInfo.liveChannels.length) return;

					const channel = guild.channels.cache.get(channelID) as TextChannel;
					if (!channel) return;

					const msg = await channel.messages.fetch(twitchLiveInfo.messageID);
					if (!msg) return;

					const endedAt = DateTime.fromISO(new Date().toISOString());
					const embed = msg.embeds[0]
						.setDescription("Stream has now ended. Thanks for watching!")
						.addFields([{ name: "**Ended At**", value: getTimeString(endedAt) }]);
					await msg.edit({ embeds: [embed], components: [] });

					await client.twitchLiveInfo.findByIdAndUpdate(
						guild.id,
						{ $unset: { messageID: 1 }, $pull: { liveChannels: twitchChannel.toLowerCase().trim() } },
						{ new: true, upsert: true, setDefaultsOnInsert: true }
					);
					return;
				}

				const {
					user_id,
					user_name,
					type,
					title,
					started_at,
					game_id,
					//@ts-ignore
					game_name
				} = currentStream[0];

				if (type === "live") {
					if (twitchLiveInfo.liveChannels.includes(user_name.toLowerCase().trim())) return;

					const userInfo = await getUser(client, user_id);
					const gameInfo = await getGameThumbnail(client, game_id);

					const twitchURL = `https://www.twitch.tv/${user_name}`;
					const userThumbnail = userInfo ? userInfo.profile_image_url : "";
					const gameThumbnail = gameInfo ? gameInfo.box_art_url.replace(/-{width}x{height}/g, "") : "";
					const startedAt = DateTime.fromISO(started_at);

					const embed = client.utils
						.createEmbed()
						.setAuthor({
							name: `${user_name} is now live on Twitch!`,
							iconURL: userThumbnail,
							url: twitchURL
						})
						.setColor("#9146FF")
						.setTitle(title)
						.setURL(twitchURL)
						.addFields([
							{ name: "**Game**", value: game_name ?? "None" },
							{ name: "**Started At**", value: getTimeString(startedAt) }
						])
						.setThumbnail(gameThumbnail)
						.setImage(currentStream[0].getThumbnailUrl())
						.setTimestamp(new Date(started_at));

					const channel = guild.channels.cache.get(channelID) as TextChannel;
					if (!channel) return;

					const content = message
						.replace(/{GUILD_NAME}/g, guild!.name)
						.replace(/{STREAMER}/g, user_name)
						.replace(/{STREAM_TITLE}/g, title)
						.replace(/{GAME}/g, game_name);

					const button = client.utils
						.createActionRow()
						.addComponents(
							client.utils
								.createButton()
								.setLabel("Watch Stream")
								.setStyle(Constants.MessageButtonStyles.LINK)
								.setURL(twitchURL)
						);

					const msg = await channel.send({
						content,
						embeds: [embed],
						components: [button],
						allowedMentions: { parse: ["roles", "everyone"] }
					});
					if (!msg) return;

					await client.twitchLiveInfo.findByIdAndUpdate(
						guild.id,
						{ $set: { messageID: msg.id }, $push: { liveChannels: user_name.toLowerCase().trim() } },
						{ new: true, upsert: true, setDefaultsOnInsert: true }
					);
				}
			}
		});
	} catch (e) {
		client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
	}
};

const getUser = async (client: Client, userID: string) => {
	const user = await client.twitchApi.getUsers(userID);
	if (!user || !user.data || user.data.length) return;
	return user.data[0];
};

const getGameThumbnail = async (client: Client, gameID: string) => {
	const game = await client.twitchApi.getGames(gameID);
	if (!game || !game.data || !game.data.length) return;
	return game.data[0];
};

const getTimeString = (time: DateTime) => `<t:${Math.floor(time.toSeconds())}:F> (<t:${Math.floor(time.toSeconds())}:R>)`;
