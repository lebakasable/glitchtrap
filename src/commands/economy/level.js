const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require('discord.js');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');
const Canvas = require('@napi-rs/canvas');
const path = require('path');

module.exports = {
  callback: async (_client, interaction) => {
    if (!interaction.inGuild()) return;

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get('target-user')?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} n'a pas de niveau pour l'instant. Essayez plus tard quand il aura plus parlé !`
          : "Vous n'avez pas de niveau pour l'instant. Essayez plus tard quand vous aurez plus parlé !"
      );
      return;
    }

    let allLevels = await Level.find({ guildId: interaction.guild.id }).select(
      '-_id userId level xp'
    );

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    const canvas = Canvas.createCanvas(700, 200);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage(
      path.join(__dirname, '..', '..', '..', 'assets', 'showlevel.jpeg')
    );

    ctx.drawImage(background, 0, -550);

    const pfp = await Canvas.loadImage(
      targetUserObj.user.displayAvatarURL({
        format: 'jpeg',
      })
    );

    let x = 25;
    let y = canvas.height / 2 - pfp.height / 2;
    ctx.save()
    ctx.beginPath()
    ctx.arc(x * 3.55, y * 2.8, pfp.width / 2, 0, Math.PI * 2, false)
    ctx.clip()
    ctx.drawImage(pfp, x, y);
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Montserrat';

    let text = `Niveau ${fetchedLevel.level} (#${currentRank})`;
    x = 50 + pfp.width;
    y = canvas.height - pfp.height;
    ctx.fillText(text, x, y + 10);

    const xpNeeded = calculateLevelXp(fetchedLevel.level);

    ctx.font = 'bold 38px Montserrat';
    text = `${fetchedLevel.xp}/${xpNeeded}`;
    x = 50 + pfp.width;
    y = canvas.height - pfp.height / 2;
    ctx.fillText(text, x, y);

    ctx.fillRect(0, canvas.height - 10, canvas.width * (fetchedLevel.xp / xpNeeded), 10);

    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'));
    interaction.editReply({ files: [attachment] });
  },

  name: 'level',
  description: "Montre votre niveau ou celui d'un membre",
  options: [
    {
      name: 'target-user',
      description: `L'utilisateur dont vous voulez voir le niveau`,
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
