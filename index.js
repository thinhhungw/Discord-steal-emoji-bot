const { Client, GatewayIntentBits, Collection, PermissionsBitField, MessageFlags, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Tạo một instance mới của Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Tạo một Collection để lưu trữ các lệnh
client.commands = new Collection();

// Lệnh /emoji_steal
const emojiStealCommand = {
    data: new SlashCommandBuilder()
        .setName('emoji_steal')
        .setDescription('Steal emoji for your server')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji you want to steal')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the new emoji (optional)')
                .setRequired(false)),
    async execute(interaction) {
        const emojiInput = interaction.options.getString('emoji');
        const emojiName = interaction.options.getString('name') || 'steal_emoji';

        if (!interaction.member || !interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return interaction.reply({
                content: '❌ You do not have permission to add emoji to this server',
            });
        }

        if (interaction.guild.emojis.cache.size >= interaction.guild.emojiLimit) {
            return interaction.reply({
                content: '❌ Server has reached the maximum number of emojis limit',
            });
        }

        let emojiUrl;
        const customEmojiRegex = /<:(\w+):(\d+)>|<a:(\w+):(\d+)>/;
        const match = emojiInput.match(customEmojiRegex);

        if (match) {
            const emojiId = match[2] || match[4];
            const animated = Boolean(match[3]);
            emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}`;
        } else if (emojiInput.startsWith('http')) {
            emojiUrl = emojiInput;
        } else {
            return interaction.reply({
                content: '❌ Please enter a valid custom emoji or emoji image URL\n-',
            });
        }

        try {
            const response = await axios.get(emojiUrl, { responseType: 'arraybuffer' });
            const emojiBuffer = Buffer.from(response.data, 'binary');
            const newEmoji = await interaction.guild.emojis.create({ attachment: emojiBuffer, name: emojiName });

            return interaction.reply({
                content: `✅ Emoji ${newEmoji} has been stolen to your server with name **${emojiName}**`,
            });
        } catch (error) {
            console.error('Lỗi khi thêm emoji:', error);
            return interaction.reply({
                content: '❌ An error occurred while adding emoji. Please check and try again. Maybe the bot is missing some relevant permissions or the server is full of emoji',
            });
        }
    }
};

// Lệnh /emoji_remove
const emojiRemoveCommand = {
    data: new SlashCommandBuilder()
        .setName('emoji_remove')
        .setDescription('Remove an emoji from your server')
        .addStringOption(option =>
            option.setName('emoji_id')
                .setDescription('ID or name of the emoji to remove')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction) {
        const emojiIdentifier = interaction.options.getString('emoji_id');

        if (!interaction.member || !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You do not have permission to remove emoji from this server. This command requires Administrator permission.',
            });
        }

        try {
            let emojiToRemove;

            if (!isNaN(emojiIdentifier) && emojiIdentifier.length >= 17 && emojiIdentifier.length <= 19) {
                emojiToRemove = interaction.guild.emojis.cache.get(emojiIdentifier);
            }

            if (!emojiToRemove) {
                emojiToRemove = interaction.guild.emojis.cache.find(e => e.name === emojiIdentifier);
            }

            if (!emojiToRemove) {
                const customEmojiRegex = /<:(\w+):(\d+)>|<a:(\w+):(\d+)>/;
                const match = emojiIdentifier.match(customEmojiRegex);
                if (match) {
                    const emojiId = match[2] || match[4];
                    emojiToRemove = interaction.guild.emojis.cache.get(emojiId);
                }
            }

            if (!emojiToRemove) {
                return interaction.reply({
                    content: '❌ Could not find an emoji with that ID or name in this server.',
                });
            }

            await emojiToRemove.delete();

            return interaction.reply({
                content: `✅ Emoji **${emojiToRemove.name}** has been successfully removed.`,
            });

        } catch (error) {
            console.error('Lỗi khi xóa emoji:', error);
            return interaction.reply({
                content: '❌ An error occurred while removing the emoji. Please check bot permissions and try again.',
            });
        }
    }
};

// Đăng ký lệnh
client.commands.set(emojiStealCommand.data.name, emojiStealCommand);
client.commands.set(emojiRemoveCommand.data.name, emojiRemoveCommand);

// Sự kiện khi bot online
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);

    try {
        await client.application.commands.set([...client.commands.map(command => command.data)]);
        console.log('✅ Successfully registered application commands globally!');
    } catch (error) {
        console.error('❌ Error registering application commands:', error);
    }
});

// Xử lý tương tác slash command
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Đăng nhập bot
client.login(process.env.DISCORD_BOT_TOKEN);
