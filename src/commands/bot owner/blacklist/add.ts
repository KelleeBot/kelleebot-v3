import { Client } from "../../../util/client"
import { CommandInteraction } from "discord.js"

export const add = async (client: Client, interaction: CommandInteraction) => {
    const user = interaction.options.getUser("user")!;
    const userInfo = await client.profileInfo.get(user.id);

    if (user.bot) return interaction.reply({ content: "You cannot blacklist bots.", ephemeral: true });

    if (user.id === interaction.user.id) return interaction.reply({ content: "You cannot blacklist yourself.", ephemeral: true });

    if (client.config.devs.includes(user.id)) return interaction.reply({ content: "You cannot blacklist the bot owner.", ephemeral: true });

    if (userInfo.isBlacklisted) return interaction.reply({ content: `Looks like **${user.tag}** is already blacklisted.` })

    userInfo.isBlacklisted = true
    await client.profileInfo.findByIdAndUpdate(
        user.id,
        { $set: { isBlacklisted: true } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return interaction.reply({ content: `You have successfully blacklisted **${user.tag}**.` });
}