const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get('target-user').value;
    const reason =
      interaction.options.get('reason')?.value || 'Aucune raison donnée';

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply("Ce membre n'est pas sur le serveur.");
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply(
        "Vous ne pouvez pas kick l'administrateur !"
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "Vous ne pouvez pas kick ce membre car il a des permissions supérieures ou égales aux votres."
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "Je ne peux pas kick ce membre car il a des permissions supérieures ou égales aux miennes."
      );
      return;
    }

    try {
      await targetUser.kick({ reason });
      await interaction.editReply(
        `Le membre ${targetUser} a été kick.\nRaison: ${reason}`
      );
    } catch (error) {
      console.error(`There was an error when kicking: ${error}`);
    }
  },

  name: 'kick',
  description: 'Kick un membre du serveur',
  options: [
    {
      name: 'target-user',
      description: 'Le membre à kick',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'La raison du kick',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};
