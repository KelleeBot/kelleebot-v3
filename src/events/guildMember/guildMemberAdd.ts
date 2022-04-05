import { ColorResolvable, Guild, GuildMember, MessageAttachment, MessageEmbed, TextChannel } from "discord.js";
import Canvas from "canvas";
import { Client } from "../../util/client";
import { GUILD_MEMBER_ADD } from "./../../../config/embedColours.json"
import gambling from "../../schemas/gambling";
import { addPoints } from "../../util";

export default async (client: Client, member: GuildMember) => {
    try {
        const result = await gambling.findOne({ guildID: member.guild.id, userID: member.id });
        const guildInfo = await client.guildInfo.get(member.guild.id);

        const { gamblingChannel, dailyReward } = guildInfo.gambling;
        if (!result && !member.user.bot && gamblingChannel)
            await addPoints(member.guild.id, member.id, dailyReward);

        const createdTimestamp = Math.round(member.user.createdTimestamp / 1000);
        const joinedTimestamp = Math.round(member.joinedTimestamp! / 1000);

        const msgEmbed = new MessageEmbed()
            .setColor(GUILD_MEMBER_ADD as ColorResolvable)
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**${member.user} has joined the server**`)
            .addFields(
                { name: "**Account Created**", value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`, inline: false },
                { name: "**Joined**", value: `<t:${joinedTimestamp}:F> (<t:${joinedTimestamp}:R>)`, inline: false }
            )
            .setFooter({ text: `Members: ${member.guild.memberCount} • ID: ${member.id}` })
            .setTimestamp();

        client.utils.sendMessageToBotLog(client, member.guild, msgEmbed);

        const { welcome } = guildInfo;
        if (!welcome) return;

        const { channelID, text } = welcome;
        const channel = member.guild.channels.cache.get(channelID) as TextChannel;
        if (!channel) return;

        const attachment = await createCanvas(member.guild, member);
        return channel.send({ content: text.replace(/<@>/g, `<@${member.id}>`), files: [attachment] });
    } catch (e) {
        return client.utils.log("ERROR", `${__filename}`, `An error occurred: ${e}`);
    }
};

const createCanvas = async (guild: Guild, member: GuildMember) => {
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext("2d");

    const background = await Canvas.loadImage("./dist/src/img/banner.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#74037b";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Slightly smaller text placed above the member's display name
    ctx.font = "24px sans-serif";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 8;
    ctx.strokeText(
        `Welcome to the ${guild.name},`,
        canvas.width / 2.5,
        canvas.height / 3.5
    );
    ctx.fillStyle = "#FFFFAF";
    ctx.fillText(
        `Welcome to the ${guild.name},`,
        canvas.width / 2.5,
        canvas.height / 3.5
    );

    // Add an exclamation point here and below
    ctx.font = applyText(canvas, `${member.displayName}!`);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 8;
    ctx.strokeText(
        `${member.displayName}!`,
        canvas.width / 2.5,
        canvas.height / 1.8
    );
    ctx.fillStyle = "#FFFFAF";
    ctx.fillText(
        `${member.displayName}!`,
        canvas.width / 2.5,
        canvas.height / 1.8
    );

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // Wait for Canvas to load the image
    const avatar = await Canvas.loadImage(
        member.user.displayAvatarURL({ format: "jpg" })
    );
    // Draw a shape onto the main canvas
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new MessageAttachment(canvas.toBuffer(), `welcome-${member.displayName.toLowerCase()}.png`);

    return attachment;
};

const applyText = (canvas: Canvas.Canvas, text: string) => {
    const ctx = canvas.getContext("2d");

    // Declare a base size of the font
    let fontSize = 70;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        ctx.font = `${(fontSize -= 10)}px sans-serif`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > canvas.width - 300);

    // Return the result to use in the actual canvas
    return ctx.font;
};