import { Intents } from "discord.js";
import { Client } from "./util/client";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({ intents: Object.values(Intents.FLAGS) });

(async () => {
  client.login(process.env.DISCORD_TOKEN);
})();
