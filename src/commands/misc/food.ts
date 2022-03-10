import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import axios from "axios";

export default class Food extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "food",
            category: "Misc",
            description: `${client.user!.username} shows you a random meal.`,
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        await this.setCooldown(interaction);
        try {
            const resp = await axios.get("https://www.themealdb.com/api/json/v1/1/random.php");
            const { data } = resp;

            const { meals } = data;
            const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
                .setTitle(meals[0].strMeal)
                .setURL(meals[0].strYoutube)
                .setThumbnail(meals[0].strMealThumb)
                .setDescription(
                    `For information on how to cook this dish and what the ingredients are, please click [here](${meals[0].strSource} '${meals[0].strMeal}').${meals[0].strYoutube ? `\n\nYou can also check out this YouTube video: ${meals[0].strYoutube}.` : ''}`
                )
                .addFields(
                    {
                        name: "**Category**",
                        value: meals[0].strCategory,
                        inline: true
                    },
                    {
                        name: "**Area**",
                        value: meals[0].strArea,
                        inline: true
                    }
                );
            return await interaction.reply({ embeds: [msgEmbed] });
        } catch (e) {
            client.utils.log("ERROR", `${ __filename }`, `An error has occurred: ${ e }`);
            return await interaction.editReply({
                content: "An error has occurred. Please try again."
            });
        }
    }
}
