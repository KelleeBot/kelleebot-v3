import { ButtonInteraction, CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed, Snowflake } from "discord.js";
import { Client } from "../../util/client";
import { addPoints, getPoints } from "../../util";
import { Card } from "../../types/card";
import { NO_POINTS, NOT_ENOUGH, ONE_POINT, VALID_POINTS } from "../../../config/messages.json";

const suits = ["♥", "♠", "♦", "♣"];
const values = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "K", "Q", "J"];
const hit = "👍";
const stand = "👎";

let deck: Card[] = [],
    playerCards: Card[] = [],
    playerPoints = 0,
    playerCardString = "",
    dealerCards: Card[] = [],
    dealerCardString = "",
    dealerPoints = 0,
    gameOver: boolean,
    playerWon: boolean,
    inProgress = false;

export const blackjack = async (client: Client, interaction: CommandInteraction) => {
    try {
        const amount = interaction.options.getString("amount")!;
        const { guild, user } = interaction;

        if (inProgress)
            return interaction.reply({
                content:
                    "A blackjack game is already in progress. Please wait for that one to complete first before starting another game.",
                ephemeral: true
            });

        gameOver = false; // Reset game status back to false each time command is ran
        playerWon = false; // Reset playerWon status back to false each time command is ran

        const actualPoints = await getPoints(guild!.id, user.id);
        if (actualPoints === 0) return interaction.reply({ content: NO_POINTS });

        if (amount.toLowerCase() !== "all") {
            if (!client.utils.isValidNumber(amount.trim())) return interaction.reply({ content: VALID_POINTS });
        }

        let pointsToGamble = client.utils.removeCommas(amount.trim());
        if (pointsToGamble === "all") pointsToGamble = actualPoints.toString();

        if (isNaN(+pointsToGamble) || !Number.isInteger(+pointsToGamble)) {
            return interaction.reply({ content: VALID_POINTS });
        }

        if (+pointsToGamble < 1)
            return interaction.reply({ content: ONE_POINT });

        if (+pointsToGamble > actualPoints) {
            const msg = NOT_ENOUGH.replace(/{POINTS}/g, client.utils.pluralize(actualPoints, "point", true));
            return interaction.reply({ content: msg });
        }

        inProgress = true; // Make sure only one blackjack game can be played at once
        return await playGame(client, interaction, +pointsToGamble, guild!.id, user.id, amount);
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Pelase try again.", ephemeral: true });
    }
};

const createDeck = () => {
    let deck = [];
    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < suits.length; j++) {
            let weight = +values[i];

            if (values[i] === "K" || values[i] === "Q" || values[i] === "J") weight = 10;
            if (values[i] === "A") weight = 1;

            let card = { value: values[i], suit: suits[j], weight };
            deck.push(card);
        }
    }
    return deck;
};

const playGame = async (client: Client, interaction: CommandInteraction, pointsToGamble: number, guildID: Snowflake, userID: Snowflake, text: string) => {
    deck = createDeck().shuffle();

    playerCards = [getNextCard()!, getNextCard()!]; // Start off with two cards
    dealerCards = [getNextCard()!, getNextCard()!];

    showStatus();

    const msgEmbed = createEmbed(client, pointsToGamble);
    const buttons = new MessageActionRow().addComponents(
        new MessageButton().setCustomId(hit).setLabel(hit).setStyle("SUCCESS"),
        new MessageButton().setCustomId(stand).setLabel(stand).setStyle("DANGER")
    );

    const msg = (await interaction.reply({ embeds: [msgEmbed], components: [buttons], fetchReply: true })) as Message;
    if (!msg) return await interaction.reply({ content: "An error has occurred. Pelase try again.", ephemeral: true });

    const filter = async (i: ButtonInteraction) => {
        await i.deferUpdate();
        return (i.customId == hit || i.customId == stand) && i.user.id == userID;
    };

    const collector = msg.createMessageComponentCollector({ filter, componentType: "BUTTON", time: 1000 * 20 });
    collector.on("collect", async (i) => {
        if (i.customId == hit) {
            playerCards.push(getNextCard()!);
            await checkForEndOfGame(guildID, userID, pointsToGamble);
            showStatus();
            await msg.edit({ embeds: [editEmbed(client, msgEmbed, pointsToGamble, text)], components: [buttons] });

            if (gameOver) {
                inProgress = false;
                collector.stop();
                msg.edit({ components: [] });
            }
        } else {
            gameOver = true;
            inProgress = false;
            await checkForEndOfGame(guildID, userID, pointsToGamble);
            showStatus();
            await msg.edit({ embeds: [editEmbed(client, msgEmbed, pointsToGamble, text)], components: [] });
            collector.stop();
        }
    });

    collector.on("end", (_collected, reason) => {
        if (reason === "time") {
            gameOver = true;
            inProgress = false;
            addPoints(guildID, userID, pointsToGamble * -1).then(async () => {
                return await msg.edit({
                    content: `<@${userID}>, you did not react in time and have forfeited ${client.utils.pluralize(pointsToGamble, "point", true)}.`,
                    embeds: [editEmbed(client, msgEmbed, pointsToGamble, text)],
                    components: []
                });
            });
        }
    });
};

const getNextCard = () => {
    return deck.shift();
};

const getScore = (cardArray: Card[]) => {
    let score = 0;

    for (let i = 0; i < cardArray.length; i++) {
        let card = cardArray[i];
        score += card.weight;
    }
    return score;
};

const getCardString = (card: Card) => {
    return `\`${card.value} ${card.suit}\``;
};

const updateScores = () => {
    playerPoints = getScore(playerCards);
    dealerPoints = getScore(dealerCards);
};

const showStatus = () => {
    dealerCardString = "";
    for (let i = 0; i < dealerCards.length; i++) {
        dealerCardString += `${getCardString(dealerCards[i])} `;
    }

    playerCardString = "";
    for (let i = 0; i < playerCards.length; i++) {
        playerCardString += `${getCardString(playerCards[i])} `;
    }

    updateScores();
};

const getWinMsg = (client: Client, pointsGambled: number, args: string) => {
    return playerWon
        ? `You won ${client.utils.pluralize(pointsGambled, "point", true)}!`
        : `The dealer won and you lost ${args.toLowerCase() === "all"
            ? "all your"
            : ""
        } ${client.utils.pluralize(pointsGambled, "point", true)}!`;
};

const checkForEndOfGame = async (guildID: Snowflake, userID: Snowflake, pointsGambled: number) => {
    updateScores();
    if (gameOver) {
        while (dealerPoints < playerPoints && playerPoints <= 21 && dealerPoints <= 21) {
            dealerCards.push(getNextCard()!);
            updateScores();
        }
    }

    if (playerPoints > 21) {
        playerWon = false;
        gameOver = true;
    } else if (dealerPoints > 21) {
        playerWon = true;
        gameOver = true;
    } else if (gameOver) {
        playerWon = playerPoints > dealerPoints ? true : false;
    }

    await addRemovePoints(guildID!, userID, +pointsGambled);
};

const addRemovePoints = async (guildID: Snowflake, userID: Snowflake, pointsGambled: number) => {
    if (gameOver)
        await addPoints(guildID!, userID, playerWon ? pointsGambled : pointsGambled * -1);
};

const createEmbed = (client: Client, points: number) => {
    return new MessageEmbed()
        .setTitle(`Playing Blackjack for ${client.utils.pluralize(points, "Point", true)}`)
        .addFields(
            {
                name: "**Your Hand**",
                value: `${playerCardString} \nScore: ${playerPoints} `,
                inline: true
            },
            {
                name: `** Dealer's Hand**`,
                value: `${dealerCardString}\nScore: ${dealerPoints}`,
                inline: true
            }
        )
        .setFooter({ text: `${hit} to Hit, ${stand} to Stand` });
};

const editEmbed = (client: Client, oldEmbed: MessageEmbed, pointsGambled: number, args: string) => {
    return new MessageEmbed()
        .setTitle(gameOver ? `Game Over` : `${oldEmbed.title}`)
        .setDescription(gameOver ? getWinMsg(client, pointsGambled, args) : "")
        .setFooter({ text: gameOver ? "" : `${oldEmbed.footer!.text}` })
        .addFields(
            {
                name: `**Your Hand**`,
                value: `${playerCardString}\nScore: ${playerPoints}`,
                inline: true
            },
            {
                name: `**Dealer's Hand**`,
                value: `${dealerCardString}\nScore: ${dealerPoints}`,
                inline: true
            }
        );

};