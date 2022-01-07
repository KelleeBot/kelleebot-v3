import { CommandInteraction, Snowflake } from "discord.js";
import { Client } from "../../util/client";
import { getPoints } from "../../util";
import gambling from "../../schemas/gambling";

export const points = async (client: Client, interaction: CommandInteraction) => {
    const target = interaction.options.getUser("user") ?? interaction.user

    if (target.bot)
        return await interaction.reply({
            content: "Bot's don't have any points.",
            ephemeral: true
        })

    const points = await getPoints(interaction.guildId!, target.id);
    const ranking = await getRanking(interaction.guildId!, target.id);

    const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
        .setAuthor({
            name: target.tag,
            iconURL: target.displayAvatarURL({ dynamic: true })
        })
        .addFields(
            {
                name: "**Points**",
                value: `\`${client.utils.formatNumber(points)}\``,
                inline: true
            },
            {
                name: `**Ranking**`,
                value: ranking,
                inline: true
            }
        );
    return await interaction.reply({ embeds: [msgEmbed] });
}

const getRanking = async (guildID: Snowflake, userID: Snowflake) => {
    const results = await gambling.find({ guildID }).sort({ points: -1 });
    const rank = results.findIndex(
        (i: { userID: Snowflake }) => i.userID == userID
    );
    return `${rank + 1}/${results.length}`;
};