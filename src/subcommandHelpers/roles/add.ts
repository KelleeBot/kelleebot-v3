import { Client } from "../../util/client";
import { CommandInteraction, MessageActionRow, MessageSelectMenu, MessageSelectOptionData, Role, TextChannel } from "discord.js";

export const add = async (client: Client, interaction: CommandInteraction) => {
    const id = interaction.options.getString("messageid")!;
    const role = interaction.options.getRole("role")! as Role;
    const channel = (interaction.options.getChannel("channel")! as TextChannel) ?? (interaction.channel as TextChannel);
    const emoji = interaction.options.getString("emoji")!;

    try {
        if (channel.type !== "GUILD_TEXT")
            return await interaction.reply({ content: "Please ensure that the channel selected is a text channel.", ephemeral: true });

        const targetMessage = await channel.messages.fetch(id, { cache: true, force: true });
        if (!targetMessage) return await interaction.reply({ content: "I couldn't find that message", ephemeral: true });

        if (targetMessage.author.id !== client.user?.id)
            return await interaction.reply({ content: "Please provide a message ID for a message that was actually sent by me.", ephemeral: true });

        if (role.position > interaction.guild?.me?.roles.highest.position!)
            return await interaction.reply({ content: "You can't add a role that is higher than mine.", ephemeral: true });

        let row = targetMessage.components[0] as MessageActionRow;
        if (!row) row = new MessageActionRow();

        const options: MessageSelectOptionData[] = [emoji ? { label: role.name, value: role.id, emoji } : { label: role.name, value: role.id }];

        let menu = row.components[0] as MessageSelectMenu;
        if (menu) {
            if (menu.options.length > 25)
                return await interaction.reply({ content: "Only a maximum of 25 options can be added to the menu.", ephemeral: true });

            for (const option of menu.options) {
                if (option.value === options[0].value)
                    return await interaction.reply({ content: `<@&${option.value}> has already been added to this menu.`, ephemeral: true });
            }
            menu.addOptions(options);
            menu.setMaxValues(menu.options.length);
        } else {
            row.addComponents(
                new MessageSelectMenu()
                    .setCustomId("auto_roles")
                    .setMinValues(0)
                    .setMaxValues(1)
                    .setPlaceholder("Select your Roles")
                    .addOptions(options)
            );
        }
        await targetMessage.edit({ components: [row] });
        return await interaction.reply({ content: `Added <@&${role.id}> to the roles menu.`, ephemeral: true });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: `An error has occurred. Please try again.`, ephemeral: true });
    }
};
