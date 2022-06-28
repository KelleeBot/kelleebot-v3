import { Client } from "../../util/client";
import { ButtonInteraction, CommandInteraction, TextChannel } from "discord.js";

const NUM_SECONDS = 1000 * 5; // 5 seconds

export const close = async (client: Client, interaction: CommandInteraction) => {
    const { guildId } = interaction;

    const guildInfo = await client.guildInfo.get(guildId!);
    const { tickets } = guildInfo;
    const channel = interaction.channel as TextChannel;

    if (!tickets!.channelCategory)
        return interaction.reply({ content: "Looks like you don't have the ticketing system properly set up yet.", ephemeral: true });

    if (channel.parentId === tickets!.channelCategory && channel.name.startsWith("ticket-")) {
        const buttonRow = client.utils
            .createActionRow()
            .addComponents(
                client.utils.createButton().setCustomId("close_yes").setLabel("Yes").setStyle("SUCCESS"),
                client.utils.createButton().setCustomId("close_no").setLabel("No").setStyle("DANGER")
            );

        const msg = await client.utils.fetchReply(interaction, {
            content: "Are you sure you want to close this ticket?",
            components: [buttonRow]
        });

        const filter = async (i: ButtonInteraction) => {
            await i.deferUpdate();
            return (i.customId == "close_yes" || i.customId == "close_no") && i.user.id == interaction.user.id;
        };
        const collector = msg.createMessageComponentCollector({ filter, componentType: "BUTTON", time: 1000 * 10 });
        collector.on("collect", async (button) => {
            if (button.customId === "close_yes") {
                const closingTimestamp = Math.round((new Date().getTime() + NUM_SECONDS) / 1000);
                await button.editReply({ content: `Ticket will close <t:${closingTimestamp}:R>...`, components: [] });
                await client.utils.delay(NUM_SECONDS);

                try {
                    await channel.delete();
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    button.editReply({ content: "An error has occurred and I could not close the ticket...", components: [] });
                }
            } else {
                await button.editReply({ content: "This ticket will remain open.", components: [] });
            }
        });

        collector.on("end", async (_collected, reason) => {
            if (reason === "time") await msg.edit({ content: "You didn't choose a response in time. I will leave this ticket open.", components: [] });
        });
    } else {
        return interaction.reply({ content: "You can only close tickets within the appropriate ticket channels.", ephemeral: true });
    }
}