import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Fc extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "fc",
            category: "Misc",
            description: "Show's the server owner's Nintendo Switch friend code, if they have one set.",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES"]
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        try {
            const owner = await interaction.guild?.fetchOwner();
            const guildInfo = await client.guildInfo.get(interaction.guildId!);
            if (!guildInfo.friendCode)
                return await interaction.reply({ content: `Looks like ${owner?.user.tag} hasn't set their friend code yet.`, ephemeral: true })

            return await interaction.reply({ content: `${owner?.user.tag}'s Nintendo Switch friend code is ${guildInfo.friendCode}.` });
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
            return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
        }
    }
};