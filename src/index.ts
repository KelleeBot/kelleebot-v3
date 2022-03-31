import { Intents } from "discord.js";
import { Client } from "./util/client";
import "./util/prototype";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_WEBHOOKS
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"],
  allowedMentions: { parse: ["users", "roles"], repliedUser: false }
});

(async () => {
  await client.login(process.env.DISCORD_TOKEN);

  await client.loadACData();
  await client.loadCountryData();
  await client.loadPokemonData();
})();

process.on("unhandledRejection", (error) => {
  client.utils.log("ERROR", `${__filename}`, "An error occured:");
  console.log(error);
});