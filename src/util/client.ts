import { ClientOptions } from "discord.js";
import { KelleeBotClient } from "../prefab/client";

class Client extends KelleeBotClient {
  constructor(options: ClientOptions) {
    super(options);
  }
}

export { Client };
