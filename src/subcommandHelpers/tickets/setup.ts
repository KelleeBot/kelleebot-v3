import { Client } from "../../util/client";
import { CommandInteraction, Role, TextChannel } from "discord.js";

export const setup = async (
  client: Client,
  interaction: CommandInteraction
) => {
  const channel = interaction.options.getChannel("channel") as TextChannel;
  const category = interaction.options.getChannel("category");
  const modRole = interaction.options.getRole("mod-role");

  const { guildId, guild, user } = interaction;
  const guildInfo = await client.guildInfo.get(guildId!);

  if (!channel && !category && !modRole) {
    const { tickets } = guildInfo!;
    if (!tickets) return;

    const msgEmbed = (await client.utils.CustomEmbed({ userID: user.id }))
      .setTitle(`Ticket Settings for ${guild!.name}`)
      .addFields({
        name: "Ticket Category: ",
        value: tickets.channelCategory
          ? `<#${tickets.channelCategory}>`
          : "None"
      });
    return interaction.reply({ embeds: [msgEmbed] });
  }

  const msgEmbed = (
    await client.utils.CustomEmbed({ userID: user.id })
  ).setTitle(`Ticket Settings for ${guild!.name}`);

  if (channel) {
    try {
      const ticketEmbed = client.utils
        .createEmbed()
        .setColor("#ecc5ff")
        .setTitle("Tickets")
        .setAuthor({
          name: guild!.name,
          iconURL: client.utils.getGuildIcon(guild!)
        })
        .setDescription(
          "**To create a ticket:**\n" +
            "> Click on the button below.\n" +
            "> A new channel will be created for you where you will be able to type in there.\n" +
            "> You can only create one ticket at a time.\n" +
            "> Do not abuse this feature. Only create tickets if needed."
        );

      const buttonRow = client.utils
        .createActionRow()
        .addComponents(
          client.utils
            .createButton()
            .setCustomId("open-ticket")
            .setLabel("🎫 Create Ticket!")
            .setStyle("PRIMARY")
        );

      await channel.send({ embeds: [ticketEmbed], components: [buttonRow] });
      msgEmbed.addFields({ name: "Ticket Panel:", value: "✅ Message Sent" });
    } catch (e) {
      client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
      msgEmbed.addFields({
        name: "Ticket Panel:",
        value: "❌ Could not send message"
      });
    }
  }

  if (category) {
    await client.guildInfo.findByIdAndUpdate(
      guildId!,
      { "tickets.channelCategory": category.id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    msgEmbed.addFields({
      name: "Ticket Category:",
      value: `✅ Set to ${category}`
    });
    msgEmbed.setFooter({
      text: "Make sure to setup proper channel permissions for the ticket category"
    });
  }

  if (modRole) {
    await client.guildInfo.findByIdAndUpdate(
      guildId!,
      { "tickets.modRole": modRole.id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    msgEmbed.addFields({ name: "Mod Role:", value: `✅ Set to ${modRole}` });
  }

  return interaction.reply({ embeds: [msgEmbed] });
};
