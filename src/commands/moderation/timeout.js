const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
  callback: async (client, interaction) => {
    const mentionable = interaction.options.get('target-user').value;
    const duration = interaction.options.get('duration').value;
    const reason = interaction.options.get('reason')?.value || 'Aucune raison donnée';

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(mentionable);
    if (!targetUser) {
      await interaction.editReply("Ce membre n'est pas sur le serveur.");
      return;
    }

    if (targetUser.user.bot) {
      await interaction.editReply("Je ne peux pas timeout un bot.");
      return;
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      await interaction.editReply('Veuillez donner une durée valide.');
      return;
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      await interaction.editReply('La durée ne peut pas être moins de 5 secondes ni plus que 28 jours.');
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply("Vous ne pouvez pas timeout ce membre car il a des permissions supérieures ou égales aux votres.");
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply("Je ne peux pas timeout ce membre car il a des permissions supérieures ou égales aux miennes.");
      return;
    }

    try {
      const { default: prettyMs } = await import('pretty-ms');

      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);
        await interaction.editReply(`Le timeout de ${targetUser} à été changé, il est maintenant de ${prettyMs(msDuration, { verbose: true })}.\nRaison: ${reason}`);
        return;
      }

      await targetUser.timeout(msDuration, reason);
      await interaction.editReply(`${targetUser} à été timeout pendant ${prettyMs(msDuration, { verbose: true })}.\nRaison: ${reason}`);
    } catch (error) {
      console.log(`There was an error when timing out: ${error}`);
    }
  },

  name: 'timeout',
  description: 'Timeout un membre du serveur',
  options: [
    {
      name: 'target-user',
      description: 'Le membre à timeout',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'duration',
      description: 'Durée (30m, 1h, 1 day).',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'La raison du timeout',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};
