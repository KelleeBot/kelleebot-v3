import { CommandInteraction, Snowflake } from "discord.js";
import { Client } from "../../util/client";
import { addPoints, getPoints } from "../../util";
import { ALL_IN_LOSE, ALL_IN_WIN, NO_POINTS, NOT_ENOUGH, ONE_POINT, VALID_POINTS } from "../../../config/messages.json";

const slotsEmoji = [
    "<:kellee1Star:750956567666491393>", // kellee1Star
    "<:kellee2Star:750956642459189289>", // kellee2Star
    "<:kellee3Star:750956774810583103>", // kellee3Star
    "<:kellee4Star:750956822755541012>" // kellee4Star
]; //["💰", "✨", "💩", "🔥"];

const multiplier = slotsEmoji.length;

export const slots = async (client: Client, interaction: CommandInteraction) => {
    try {
        const { user, guild } = interaction;
        const points = interaction.options.getString("amount")!;

        const actualPoints = await getPoints(guild!.id, user.id);
        if (actualPoints === 0)
            return await interaction.reply({ content: NO_POINTS });

        if (points.toLowerCase() === "all")
            if (client.utils.isValidNumber(points.trim()))
                return await interaction.reply({ content: NO_POINTS });

        const pointsToGamble = client.utils.removeCommas(points.trim());
        if (actualPoints === 0)
            return await interaction.reply({ content: NO_POINTS });

        const slot1 = client.utils.randomRange(0, slotsEmoji.length - 1);
        const slot2 = client.utils.randomRange(0, slotsEmoji.length - 1);
        const slot3 = client.utils.randomRange(0, slotsEmoji.length - 1);

        const emote1 = slotsEmoji[slot1];
        const emote2 = slotsEmoji[slot2];
        const emote3 = slotsEmoji[slot3];

        const slotsText = `You spun ${emote1} | ${emote2} | ${emote3}`;
        let pointsWon = 0;

        if (pointsToGamble.toLowerCase() === "all") {
            if (isSlotsWin(slot1, slot2, slot3)) {
                pointsWon = actualPoints * multiplier;
                return await slotsWin(client, guild!.id, user.id, pointsWon, slotsText, interaction);
            } else {
                await addPoints(guild!.id, user.id, actualPoints * -1);
                return await interaction.reply({ content: `${slotsText} and lost all of your points :sob:` });
            }
        }

        if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble))
            return await interaction.reply({ content: VALID_POINTS });

        if (+pointsToGamble < 1)
            return await interaction.reply({ content: ONE_POINT });

        if (+pointsToGamble > actualPoints) {
            const msg = NOT_ENOUGH.replace(/{POINTS}/g, client.utils.pluralize(actualPoints, "point", true));
            return await interaction.reply({ content: msg });
        }

        if (isSlotsWin(slot1, slot2, slot3)) {
            pointsWon = +pointsToGamble * multiplier;
            return slotsWin(client, guild!.id, user.id, pointsWon, slotsText, interaction);
        } else {
            const newPoints = await addPoints(guild!.id, user.id, +pointsToGamble * -1);
            return await interaction.reply({
                content: `${slotsText} and lost ${client.utils.pluralize(
                    +pointsToGamble,
                    "point",
                    true
                )}! You now have ${client.utils.pluralize(
                    newPoints,
                    "point",
                    true
                )}.`
            });
        }
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};

const isSlotsWin = (slot1: number, slot2: number, slot3: number) => slot1 == slot2 && slot2 == slot3;

const slotsWin = async (client: Client, guildID: Snowflake, userID: Snowflake, pointsWon: number, slotsText: string, interaction: CommandInteraction) => {
    const newPoints = await addPoints(guildID!, userID, pointsWon);
    return await interaction.reply({
        content: `${slotsText} and won ${client.utils.pluralize(pointsWon, "point", true)}! You now have ${client.utils.pluralize(
            newPoints,
            "point",
            true
        )}.`
    });
};