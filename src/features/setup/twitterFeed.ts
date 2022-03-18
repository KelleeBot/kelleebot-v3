import { Client } from "../../util/client";
import { WebhookClient } from "discord.js";
import { DateTime } from "luxon";

const followedAccounts = [
    "517358431", // @ACWorldBlog
    "1377451009", // @AnimalCrossing
    "1072404907230060544", // @GenshinImpact
    "96879107", // @Pokemon
    "1114253221269245952", // @SerebiiOTD
    "287885794", // @Tetris_Official
    "437210567", // @TwitchSupport
    "537917040", // @Krisypaulinee
    "1100185089416269824" // @RamenBomber
];

// Initialize webhooks
const acWebhook = new WebhookClient({ url: `${process.env.AC_WEBHOOK_URL}` });
const tetrisWebhook = new WebhookClient({ url: `${process.env.TETRIS_WEBHOOK_URL}` });
const pokemonWebhook = new WebhookClient({ url: `${process.env.POKEMON_WEBHOOK_URL}` });
const genshinWebhook = new WebhookClient({ url: `${process.env.GENSHIN_WEBHOOK_URL}` });
const twitchWebhook = new WebhookClient({ url: `${process.env.TWITCH_WEBHOOK_URL}` });
const krisyWebhook = new WebhookClient({ url: `${process.env.KRISY_WEBHOOK_URL}` });
const ramenWebhook = new WebhookClient({ url: `${process.env.RAMEN_WEBHOOK_URL}` });

export default (client: Client) => {
    startTwitterFeed(client);
};

const startTwitterFeed = (client: Client) => {
    client.twitter.stream("statuses/filter", { follow: followedAccounts.join(",") })
        .on("start", () => client.utils.log("WARNING", `${__filename}`, "Started Twitter Feed Stream"))
        .on("data", async (tweet) => {
            if (!tweet.user || tweet.retweeted_status) return;

            const url = `http://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;

            const tweeted = DateTime.fromISO(new Date(tweet.created_at).toISOString());
            const timeString = `<t:${Math.floor(tweeted.toSeconds())}:F> (<t:${Math.floor(tweeted.toSeconds())}:R>)`;
            const text = `${tweet.user.screen_name} tweeted this on ${timeString}:\n${url}`

            switch (tweet.user.id_str) {
                case "517358431":
                    if (tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str ||
                        tweet.in_reply_to_user_id || tweet.in_reply_to_user_id_str || tweet.in_reply_to_screen_name)
                        return;
                    await acWebhook.send({ content: url });
                    break;

                case "1377451009":
                    await acWebhook.send({ content: url });
                    break;

                case "1072404907230060544":
                    await genshinWebhook.send({ content: url });
                    break;

                case "96879107":
                case "1114253221269245952":
                    if (tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str ||
                        tweet.in_reply_to_user_id || tweet.in_reply_to_user_id_str || tweet.in_reply_to_screen_name)
                        return;
                    await pokemonWebhook.send({ content: url });
                    break;

                case "287885794":
                    if (tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str ||
                        tweet.in_reply_to_user_id || tweet.in_reply_to_user_id_str || tweet.in_reply_to_screen_name)
                        return;
                    tetrisWebhook.send({ content: url });
                    break;

                case "437210567":
                    if (tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str ||
                        tweet.in_reply_to_user_id || tweet.in_reply_to_user_id_str || tweet.in_reply_to_screen_name)
                        return;
                    await twitchWebhook.send({ content: url });
                    break;

                case "537917040":
                    if (tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str ||
                        tweet.in_reply_to_user_id || tweet.in_reply_to_user_id_str || tweet.in_reply_to_screen_name)
                        return;

                    await krisyWebhook.send({ content: text });
                    break;

                case "1100185089416269824":
                    if (tweet.in_reply_to_status_id || tweet.in_reply_to_status_id_str ||
                        tweet.in_reply_to_user_id || tweet.in_reply_to_user_id_str || tweet.in_reply_to_screen_name)
                        return;

                    await ramenWebhook.send({ content: text });
                    break;

                default:
                    break;
            }
        })
        .on("error", (e) => client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e.message}`))
        .on("end", () => {
            client.utils.log("WARNING", `${__filename}`, "Ended Twitter Feed Stream");
            // Wait 10 seconds, then restart the twitter feed
            setTimeout(() => startTwitterFeed(client), 10000);
        });
};