const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const AutoRole = require('../../models/AutoRole');

module.exports = {
  callback: async (_client, interaction) => {
    if (!interaction.inGuild()) return;

    const targetRoleId = interaction.options.get('role').value;

    try {
      await interaction.deferReply();

      let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

      if (autoRole) {
        if (autoRole.roleId === targetRoleId) {
          interaction.editReply('Autorole a déja été configuré pour ce role. Pour le désactiver, utilisez `/autorole-disable`.');
          return;
        }

        autoRole.roleId = targetRoleId;
      } else {
        autoRole = new AutoRole({
          guildId: interaction.guild.id,
          roleId: targetRoleId,
        });
      }

      await autoRole.save();
      interaction.editReply('Autorole est maintenant configuré. Pour le désactiver, utilisez `/autorole-disable`.');
    } catch (error) {
      console.error(error);
    }
  },

  name: 'autorole-configure',
  description: `Configure Autorole pour ce serveur`,
  options: [
    {
      name: 'role',
      description: 'Le role que vous voulez que les membres aient quand ils rejoignent',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageRoles],
};
