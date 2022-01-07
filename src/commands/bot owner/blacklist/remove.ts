import { Client } from "../../../util/client"
import { CommandInteraction } from "discord.js"

export const remove = async (client: Client, interaction: CommandInteraction) => {
    const user = interaction.options.getUser("user")!;
    const userInfo = await client.profileInfo.get(user.id);

    if (!userInfo.isBlacklisted) return interaction.reply({ content: `**${user.tag}** is currently not blacklisted.` })

    userInfo.isBlacklisted = false
    await client.profileInfo.findByIdAndUpdate(
        user.id,
        { $set: { isBlacklisted: false } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return interaction.reply({ content: `You have successfully whitelisted **${user.tag}**.` });
}