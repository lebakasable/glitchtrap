const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');
const cooldowns = new Set();

const getRandomXp = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = async (client, message) => {
  if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

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

        let allLevels = await Level.find({ guildId: query.guildId }).select(
          '-_id userId level xp'
        );

        allLevels.sort((a, b) => {
          if (a.level === b.level) {
            return b.xp - a.xp;
          } else {
            return b.level - a.level;
          }
        });


        const userObj = await message.guild.members.fetch(message.author.id);
        const rank = new canvacord.Rank()
          .setAvatar(userObj.user.displayAvatarURL({ size: 256 }))
          .setRank(currentRank)
          .setLevel(level.level)
          .setCurrentXP(level.xp)
          .setRequiredXP(calculateLevelXp(level.level))
          .setStatus(userObj.presence.status)
          .setProgressBar('#FFFFFF', 'COLOR')
          .setUsername(userObj.user.username);

        const data = await rank.build();
        const attachment = new AttachmentBuilder(data);

        const channel = await client.channels.fetch('1178096796283711498');
        channel.send({ files: [attachment] });
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
