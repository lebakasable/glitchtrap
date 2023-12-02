module.exports = {
  name: "translate",
  description: "Traduis le dernier message en Anglais",

  callback: async (client, interaction) => {
    const channel = await client.channels.fetch("1177932922796384335");
    const messages = await channel.messages.fetch({ limit: 1 });
    const lastMessage = messages.last();

    const translate = await import("translate");
    const res = await translate.default(lastMessage.content, {
      from: "fr",
      to: "eng",
    });

    interaction.reply({
      content: res,
      ephemeral: true,
    });
  },
};
