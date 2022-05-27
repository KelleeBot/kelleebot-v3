import { ButtonInteraction, ColorResolvable, CommandInteraction, GuildMember, MessageButton } from "discord.js";
import { Client } from "../../util/client";
import { addPoints, getPoints } from "../../util";
import { GAMBLING } from "../../../config/embedColours.json";
import { NO_POINTS, NOT_ENOUGH, ONE_POINT, VALID_POINTS } from "../../../config/messages.json";
import { chunk } from "lodash";

const NUM_MOVES = 3;

export const scratch = async (client: Client, interaction: CommandInteraction) => {
    try {
        const { guild, user } = interaction;
        const amount = interaction.options.getString("amount")!;

        const actualPoints = await getPoints(guild!.id, user.id);
        if (actualPoints === 0) return await interaction.reply({ content: NO_POINTS });

        if (!client.utils.isValidNumber(amount.trim())) return await interaction.reply({ content: VALID_POINTS });

        const pointsToGamble = client.utils.removeCommas(amount.trim());
        if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble)) return await interaction.reply({ content: VALID_POINTS });

        if (+pointsToGamble < 1) return await interaction.reply({ content: ONE_POINT });

        if (+pointsToGamble > actualPoints) {
            const msg = NOT_ENOUGH.replace(/{POINTS}/g, client.utils.pluralize(actualPoints, "point", true));
            return await interaction.reply({ content: msg });
        }

        const toEmoji = {
            "75": "<:money:808076344930861056>",
            "25": "<:money2:908199216256516166>",
            "15": "<:pokerchip:908199539805130763>",
            "0": "none"
        } as { [key: string]: string };

        const squares: MessageButton[] = [];

        for (let i = 0; i < 2; i++) {
            squares.push(
                client.utils
                    .createButton()
                    .setLabel(" ")
                    .setCustomId(`scratch-${Object.keys(toEmoji)[3]}`)
            );
        }

        for (let i = 0; i < 3; i++) {
            squares.push(
                client.utils
                    .createButton()
                    .setLabel(" ")
                    .setCustomId(`scratch-${Object.keys(toEmoji)[2]}`)
            );
        }

        for (let i = 0; i < 4; i++) {
            squares.push(
                client.utils
                    .createButton()
                    .setLabel(" ")
                    .setCustomId(`scratch-${Object.keys(toEmoji)[1]}`)
            );
        }

        for (let i = 0; i < 20 - squares.length; i++) {
            squares.push(
                client.utils
                    .createButton()
                    .setLabel(" ")
                    .setCustomId(`scratch-${Object.keys(toEmoji)[0]}`)
            );
        }

        squares.shuffle();

        for (let i = 0; i < squares.length; i++) {
            let square = squares[i];
            square.setCustomId(`${square.customId}-${i}`).setStyle("SECONDARY");
        }

        const grid = chunk(squares, 3);
        const embed = client.utils
            .createEmbed()
            .setTitle("Scratch Ticket")
            .setColor(GAMBLING as ColorResolvable)
            .setDescription(
                [
                    `You have **${NUM_MOVES}** turns to choose some squares to scratch off. Each emoji has a different amount that you can win.\n`,
                    Object.keys(toEmoji)
                        .slice(1)
                        .map(
                            (v) => `${toEmoji[v]} gives ${client.utils.pluralize(Math.round((parseInt(v) / 100) * +pointsToGamble), "point", true)}.`
                        )
                        .join("\n")
                ].join("\n")
            );

        const msg = await client.utils.fetchReply(interaction, { embeds: [embed], components: grid.map((row) => client.utils.createActionRow().addComponents(row)) });
        if (!msg) return interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });

        const collector = msg.createMessageComponentCollector({ componentType: "BUTTON", time: 1000 * 20 });
        let total = 0;
        let moves = 1;
        const REASON = "MAX_MOVES";

        collector.on("collect", async (i: ButtonInteraction) => {
            if ((i.member as GuildMember).id !== interaction.user.id)
                return interaction.reply({ content: "This isn't your scratch ticket", ephemeral: true });

            let [, id, index] = i.customId.split("-");
            await i.deferUpdate();

            total += Math.round((+id / 100) * +pointsToGamble);
            squares[+index].setStyle(+id != 0 ? "SUCCESS" : "DANGER").setDisabled(true);

            if (+id != 0) squares[+index].setEmoji(toEmoji[id]);
            await i.editReply({
                components: chunk(squares, 3).map((row) => client.utils.createActionRow().addComponents(row)),
                embeds: [
                    embed.setDescription(
                        [`Spent: \`${pointsToGamble}\``, `Gained: \`${total}\``, `Profit: \`${total - +pointsToGamble}\``].join("\n")
                    )
                ]
            });

            if (++moves > NUM_MOVES) collector.stop(REASON);
        });

        collector.on("end", async (_collected, reason) => {
            const profit = total - +pointsToGamble;
            if (reason === REASON) {
                if (profit !== 0) {
                    embed.setDescription(`You ${profit > 0 ? "won" : "lost"} ${client.utils.pluralize(Math.abs(profit), "point", true)}.`);
                } else {
                    embed.setDescription("You broke even.");
                }

                squares.forEach((button) => {
                    button.setDisabled(true);
                    if (button.customId?.split("-")[1] == "0") button.setLabel(" ");
                    else button.setEmoji(toEmoji[button.customId!.split("-")[1]]);
                    return button;
                });

                await msg.edit({
                    embeds: [embed],
                    components: chunk(squares, 3).map((row) => client.utils.createActionRow().addComponents(row))
                });
            } else if (reason === "time") {
                embed.setDescription("You ran out of time and have forfeited your points.");
                await msg.edit({ embeds: [embed], components: [] });
            }
            await addPoints(guild?.id!, user.id, profit);
        });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};
