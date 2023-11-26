module.exports = async (client, member) => {
  try {
    let guild = member.guild;
    if (!guild) return;

    const channel = await client.channels.fetch('1177932922796384329');
    channel.send(`Bienvenue à ${member} !`);
  } catch (error) {
    console.error(`Error welcoming member: ${error}`);
  }
};
