const calculateLevelXp = require("../../utils/calculateLevelXp");
const Level = require("../../models/Level");
const cooldowns = new Set();
const Canvas = require("@napi-rs/canvas");
const path = require("path");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

const getRandomXp = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = async (client, message) => {
  if (
    !message.inGuild() ||
    message.author.bot ||
    cooldowns.has(message.author.id)
  )
    return;

  const xpToGive = getRandomXp(5, 15);

  const query = {
    userId: message.author.id,
    guildId: message.guild.id,
  };

  try {
    const level = await Level.findOne(query);

    if (level) {
      level.xp += xpToGive;

      if (level.xp > calculateLevelXp(level.level)) {
        level.xp = 0;
        level.level += 1;

        const canvas = Canvas.createCanvas(700, 200);
        const ctx = canvas.getContext("2d");

        const background = await Canvas.loadImage(
          path.join(__dirname, "..", "..", "..", "assets", "levelup.jpeg"),
        );

        ctx.drawImage(background, 0, -200);

        const pfp = await Canvas.loadImage(
          message.author.displayAvatarURL({
            format: "jpeg",
          }),
        );

        let x = 25;
        let y = canvas.height / 2 - pfp.height / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x * 3.55, y * 2.8, pfp.width / 2, 0, Math.PI * 2, false);
        ctx.clip();
        ctx.drawImage(pfp, x, y);
        ctx.restore();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 35px Montserrat";

        let text = `Vous êtes passé niveau ${level.level} !`;
        x = 50 + pfp.width;
        y = canvas.height - pfp.height / 2 - 25;
        ctx.fillText(text, x, y + 5);

        const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
          name: "levelup.png",
        });

        const embed = new EmbedBuilder()
          .setColor(0xb8a7ea)
          .setDescription(`Félicitations ${message.author} !`)
          .setImage("attachment://levelup.png");

        const channel = await client.channels.fetch("1178096796283711498");
        channel.send({ embeds: [embed], files: [attachment] });
      }

      await level.save().catch((e) => {
        console.error(`Error saving updated level ${e}`);
        return;
      });
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    } else {
      const newLevel = new Level({
        userId: message.author.id,
        guildId: message.guild.id,
        xp: xpToGive,
      });

      await newLevel.save();
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    }
  } catch (error) {
    console.error(`Error giving xp: ${error}`);
  }
};
