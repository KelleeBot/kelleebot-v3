import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { addPoints, getPoints } from "../../util";
import { ALL_IN_LOSE, ALL_IN_WIN, NO_POINTS, NOT_ENOUGH, ONE_POINT, VALID_POINTS } from "../../../config/messages.json";

export const gamble = async (client: Client, interaction: CommandInteraction) => {
    try {
        const amount = interaction.options.getString("amount")!;
        const { guild, user } = interaction;

        const actualPoints = await getPoints(guild!.id, user.id);
        if (actualPoints === 0)
            return interaction.reply({ content: NO_POINTS });

        if (amount.toLowerCase() === "all") {
            // Gamble all lose
            if (client.utils.randomRange(0, 1) === 0) {
                await addPoints(guild!.id, user.id, -actualPoints);
                return await interaction.reply({ content: ALL_IN_LOSE });
            } else {
                // Gamble all win
                const newPoints = await addPoints(guild!.id, user.id, actualPoints);
                const msg = ALL_IN_WIN.replace(/{POINTS}/g, client.utils.formatNumber(newPoints));
                return await interaction.reply({ content: msg });
            }
        }

        if (!client.utils.isValidNumber(amount))
            return await interaction.reply({ content: VALID_POINTS });

        const pointsToGamble = client.utils.removeCommas(amount);
        if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble))
            return await interaction.reply({ content: VALID_POINTS });

        if (+pointsToGamble < 1)
            return await interaction.reply({ content: ONE_POINT });

        if (+pointsToGamble > actualPoints) {
            const msg = NOT_ENOUGH.replace(/{POINTS}/g, client.utils.formatNumber(actualPoints))
                .replace(/{PLURALIZE}/g, `${client.utils.pluralize(actualPoints, "point", true)}`);
            return await interaction.reply({ content: msg });
        }

        // Gamble loss
        if (client.utils.randomRange(0, 1) == 0) {
            const newPoints = await addPoints(guild!.id, user.id, +pointsToGamble * -1);
            if (actualPoints === +pointsToGamble)
                return await interaction.reply({ content: ALL_IN_LOSE });

            return interaction.reply({
                content: `You gambled \`${client.utils.formatNumber(+pointsToGamble)}\` and lost ${client.utils.pluralize(
                    +pointsToGamble,
                    "point",
                    true
                )}. You now have ${client.utils.pluralize(
                    newPoints,
                    "point",
                    true
                )}.`
            });
        } else {
            // Gamble win
            const newPoints = await addPoints(guild!.id, user.id, +pointsToGamble);
            if (actualPoints == +pointsToGamble) {
                const msg = ALL_IN_WIN.replace(/{POINTS}/g, client.utils.formatNumber(newPoints));
                return interaction.reply({ content: msg });
            }

            return interaction.reply({
                content: `You gambled \`${client.utils.formatNumber(+pointsToGamble)}\` and won ${client.utils.pluralize(
                    +pointsToGamble,
                    "point",
                    true
                )}. You now have ${client.utils.pluralize(
                    newPoints,
                    "point",
                    true
                )}.`
            });
        }
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
}; 