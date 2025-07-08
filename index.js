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

// Tạo một Collection để lưu trữ các lệnh của bạn
client.commands = new Collection();

// Định nghĩa lệnh emoji_steal (giữ nguyên code của bạn)
const emojiStealCommand = {
    data: new SlashCommandBuilder()
        .setName('emoji_steal') // Tên lệnh
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

        const banFilePath = path.join(__dirname, 'data', 'banuser.json');
        let bannedUsers = [];
        if (fs.existsSync(banFilePath)) {
            try {
                bannedUsers = JSON.parse(fs.readFileSync(banFilePath, 'utf8'));
            } catch (err) {
                console.error('Lỗi đọc banuser.json:', err);
            }
        }
        if (bannedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ You are banned from using some bot commands \n-# ❌ Bạn bị cấm sử dụng một số lệnh của bot', flags: [MessageFlags.Ephemeral] });
        }
        if (!interaction.guild) {
            return interaction.reply({
                content: '❌ This command is only used in server\n-# ❌ Lệnh này chỉ được sử dụng trong server',
                flags: [MessageFlags.Ephemeral]
            });
        }
        if (!interaction.member || !interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return interaction.reply({
                content: '❌ You do not have permission to add emoji to this server\n-# ❌ Bạn không có quyền thêm emoji vào server này',
                // flags: [MessageFlags.Ephemeral]
            });
        }

        // Kiểm tra nếu server đã đạt giới hạn emoji tối đa
        if (interaction.guild.emojis.cache.size >= interaction.guild.emojiLimit) {
            return interaction.reply({
                content: '❌ Server has reached the maximum number of emojis limit\n-# ❌ Server đã đạt giới hạn số lượng emoji tối đa',
                // flags: [MessageFlags.Ephemeral]
            });
        }

        let emojiUrl;

        // Kiểm tra xem emoji là custom emoji hay không
        const customEmojiRegex = /<:(\w+):(\d+)>|<a:(\w+):(\d+)>/;
        const match = emojiInput.match(customEmojiRegex);

        if (match) {
            // Nếu là custom emoji, lấy URL từ ID
            const emojiId = match[2] || match[4];
            const animated = Boolean(match[3]); // Kiểm tra emoji có animation không
            emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}`;
        } else if (emojiInput.startsWith('http')) {
            // Nếu nhập URL trực tiếp
            emojiUrl = emojiInput;
        } else {
            return interaction.reply({
                content: '❌ Please enter a valid custom emoji or emoji image URL\n-# ❌ Vui lòng nhập một custom emoji hợp lệ hoặc URL hình ảnh emoji',
                // flags: [MessageFlags.Ephemeral]
            });
        }

        try {
            // Tải hình ảnh emoji
            const response = await axios.get(emojiUrl, { responseType: 'arraybuffer' });
            const emojiBuffer = Buffer.from(response.data, 'binary');

            // Thêm emoji vào server
            const newEmoji = await interaction.guild.emojis.create({ attachment: emojiBuffer, name: emojiName });

            // Phản hồi thành công
            return interaction.reply({
                content: `✅ Emoji ${newEmoji} has been stolen to your server with name **${emojiName}**\n-# ✅ Emoji ${newEmoji} đã được trộm về server bạn với tên **${emojiName}**`,
                // flags: [MessageFlags.Ephemeral]
            });
        } catch (error) {
            console.error('Lỗi khi thêm emoji:', error);
            return interaction.reply({
                content: '❌ An error occurred while adding emoji. Please check and try again. Maybe the bot is missing some relevant permissions or the server is full of emoji\n-# ❌ Có lỗi xảy ra khi thêm emoji. Hãy kiểm tra lại và thử lại. Có thể bot đang thiếu một số quyền liên quan hoặc server đã full emoji',
                // flags: [MessageFlags.Ephemeral]
            });
        }
    }
};

const emojiRemoveCommand = {
    data: new SlashCommandBuilder()
        .setName('emoji_remove')
        .setDescription('Remove an emoji from your server')
        .addStringOption(option =>
            option.setName('emoji_id')
                .setDescription('ID or name of the emoji to remove')
                .setRequired(true))
        // Thêm dòng này để chỉ cho phép những người có quyền Administrator sử dụng lệnh
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // <--- THÊM DÒNG NÀY
    async execute(interaction) {
        const emojiIdentifier = interaction.options.getString('emoji_id');

        const banFilePath = path.join(__dirname, 'data', 'banuser.json');
        let bannedUsers = [];
        if (fs.existsSync(banFilePath)) {
            try {
                bannedUsers = JSON.parse(fs.readFileSync(banFilePath, 'utf8'));
            } catch (err) {
                console.error('Lỗi đọc banuser.json:', err);
            }
        }
        if (bannedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ You are banned from using some bot commands \n-# ❌ Bạn bị cấm sử dụng một số lệnh của bot', flags: [MessageFlags.Ephemeral] });
        }
        if (!interaction.guild) {
            return interaction.reply({
                content: '❌ This command is only used in server\n-# ❌ Lệnh này chỉ được sử dụng trong server',
                flags: [MessageFlags.Ephemeral]
            });
        }
        // Giữ kiểm tra quyền trong execute để chắc chắn, mặc dù setDefaultMemberPermissions đã lọc bớt
        if (!interaction.member || !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) { // <--- Đổi thành Administrator
            return interaction.reply({
                content: '❌ You do not have permission to remove emoji from this server. This command requires Administrator permission.\n-# ❌ Bạn không có quyền xóa emoji khỏi server này. Lệnh này yêu cầu quyền Administrator.',
                // flags: [MessageFlags.Ephemeral]
            });
        }

        try {
            let emojiToRemove;

            // Kiểm tra xem input có phải là một ID hợp lệ không
            if (!isNaN(emojiIdentifier) && emojiIdentifier.length >= 17 && emojiIdentifier.length <= 19) {
                emojiToRemove = interaction.guild.emojis.cache.get(emojiIdentifier);
            }

            // Nếu không tìm thấy bằng ID hoặc input không phải ID, thử tìm bằng tên
            if (!emojiToRemove) {
                emojiToRemove = interaction.guild.emojis.cache.find(e => e.name === emojiIdentifier);
            }

            // Nếu vẫn không tìm thấy, thử parse từ định dạng <:name:id>
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
                    content: '❌ Could not find an emoji with that ID or name in this server.\n-# ❌ Không tìm thấy emoji với ID hoặc tên đó trong server này.',
                    // flags: [MessageFlags.Ephemeral]
                });
            }

            // Xóa emoji
            await emojiToRemove.delete();

            return interaction.reply({
                content: `✅ Emoji **${emojiToRemove.name}** has been successfully removed.\n-# ✅ Emoji **${emojiToRemove.name}** đã được xóa thành công.`,
                // flags: [MessageFlags.Ephemeral]
            });

        } catch (error) {
            console.error('Lỗi khi xóa emoji:', error);
            return interaction.reply({
                content: '❌ An error occurred while removing the emoji. Please check bot permissions and try again.\n-# ❌ Có lỗi xảy ra khi xóa emoji. Vui lòng kiểm tra quyền của bot và thử lại.',
                // flags: [MessageFlags.Ephemeral]
            });
        }
    }
};


// Thêm tất cả các lệnh vào Collection
client.commands.set(emojiStealCommand.data.name, emojiStealCommand);
client.commands.set(emojiRemoveCommand.data.name, emojiRemoveCommand); // <-- Thêm lệnh xóa vào đây

// Sự kiện khi bot sẵn sàng
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);

    try {
        // Đăng ký toàn cục (có thể mất đến 1 giờ để lan truyền và xuất hiện trên tất cả các server)
        await client.application.commands.set([...client.commands.map(command => command.data)]);
        console.log('✅ Successfully registered application commands globally!');
    } catch (error) {
        console.error('❌ Error registering application commands:', error);
    }
});

// Xử lý các tương tác (Slash Commands)
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

// Đăng nhập bot của bạn vào Discord bằng token từ biến môi trường
client.login(process.env.DISCORD_BOT_TOKEN);