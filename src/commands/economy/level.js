const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require('discord.js');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');
const canvacord = require('canvacord');

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

    const rank = new canvacord.Rank()
      .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
      .setRank(currentRank)
      .setLevel(fetchedLevel.level)
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXp(fetchedLevel.level))
      .setStatus(targetUserObj.presence.status)
      .setProgressBar('#FFFFFF', 'COLOR')
      .setUsername(targetUserObj.user.username);

    const data = await rank.build();
    const attachment = new AttachmentBuilder(data);
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
