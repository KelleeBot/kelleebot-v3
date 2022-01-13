import { CommandInteraction, MessageAttachment } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { inspect } from "util";

export default class Eval extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "eval",
      description: "Dev-only command",
      category: "Dev Only",
      clientPerms: ["SEND_MESSAGES"],
      devOnly: true,
      options: [
        {
          name: "code",
          description: "Code to evaluate",
          type: "STRING",
          required: true
        },
        {
          name: "show",
          description: "Whether to send the reply as ephemeral or not.",
          type: "BOOLEAN"
        }
      ],
      hideCommand: true
    });
  }
  async execute({ client, interaction }: { client: Client; interaction: CommandInteraction; }) {
    let code = interaction.options.getString("code")!;
    const show = interaction.options.getBoolean("show")!;

    code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    let evaled;

    try {
      const start = process.hrtime();
      evaled = eval(code)
      //evaled = eval(`(async () => { ${code} })();`);

      if (evaled instanceof Promise) {
        evaled = await evaled;
      }

      const stop = process.hrtime(start);
      const res = `**Input:**\`\`\`js\n${code}\n\`\`\`\n**Output:** \`\`\`js\n${clean(
        client,
        interaction,
        inspect(evaled, { depth: 0 })
      )}\n\`\`\`\n**Time Taken:** \`\`\`${(stop[0] * 1e9 + stop[1]) / 1e6
        }ms\`\`\``;

      if (res.length < 2000) {
        await interaction.reply({ content: res, ephemeral: !show ? true : false });
      } else {
        const output = new MessageAttachment(Buffer.from(res), "output.txt");
        await interaction.reply({ files: [output], ephemeral: !show ? true : false });
      }
    } catch (e: any) {
      await interaction.reply({
        content: `Error: \`\`\`xl\n${clean(client, interaction, e)}\n\`\`\``,
        ephemeral: !show ? true : false
      });
    }
  }
}

function clean(client: Client, interaction: CommandInteraction, text: string) {
  if (typeof text === "string") {
    text = text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`)
      .replace(new RegExp(`${process.env.DISCORD_TOKEN}`, "gi"), "****")
      .replace(new RegExp(`${process.env.MONGO_PATH}`, "gi"), "****")
      .replace(new RegExp(client.token!, "gi"), "****")
      .replace(new RegExp(interaction.token, "gi"), "****")
  }
  return text;
}
