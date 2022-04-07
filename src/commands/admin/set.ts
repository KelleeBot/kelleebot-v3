import { GuildMember } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { setPoints } from "../../util";
import { GREATER_THAN_ZERO } from "../../../config/messages.json";

export default class Set extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "set",
            category: "Admin",
            description: "Set's points to members.",
            perms: ["MANAGE_GUILD"],
            clientPerms: ["SEND_MESSAGES"],
            options: [
                {
                    name: "points",
                    description: "The amount of points to set.",
                    type: "INTEGER",
                    required: true
                },
                {
                    name: "user",
                    description: "The user to set points to. Defaults 'all' if no user specified.",
                    type: "USER"
                }
            ],
            execute: async ({ client, interaction }) => {
                const points = interaction.options.getInteger("points")!;
                const member = interaction.options.getMember("user") ?? "all";

                if (points < 0) return await interaction.reply({ content: GREATER_THAN_ZERO });

                try {
                    if (member === "all") {
                        const members = await interaction.guild?.members.fetch();
                        members?.forEach(async (member) => {
                            if (!member.user.bot) await setPoints(interaction.guildId!, member.id, points);
                        });

                        const memberCount = members?.filter((member) => !member.user.bot).size!;
                        return await interaction.reply({
                            content: `You have successfully set ${client.utils.pluralize(
                                memberCount,
                                "member"
                            )} points to \`${client.utils.formatNumber(points)}\`.`
                        });
                    }

                    if ((member as GuildMember).user.bot) return await interaction.reply({ content: "You cannot set bot's points." });

                    const newPoints = await setPoints(interaction.guildId!, (member as GuildMember).id, points);
                    return await interaction.reply({
                        content: `Points have been successfully set to \`${client.utils.formatNumber(newPoints)}\` for **${
                            (member as GuildMember).user.tag
                        }**.`
                    });
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return await interaction.reply({ content: "An error has occurred. Please try again." });
                }
            }
        });
    }
}
