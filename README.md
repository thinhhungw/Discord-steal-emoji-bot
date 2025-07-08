## 🎉 Discord Steal Emoji Bot
- Welcome to the repository containing the core code for a Discord bot that allows you to easily create and manage giveaways! This bot is built using `Node.js` and the `Discord.js` library.
- 📌 **Important Note:** This repository only provides the "core" code of the bot. To run a complete bot, you will need to perform additional setup and configuration steps.

## ⚙️ Setup and Usage Guide
- If you have no prior experience creating Discord bots, you can refer to the detailed guide at: [https://github.com/thinhhungw/Dicord-bot](https://github.com/thinhhungw/Dicord-bot)
- Below are the steps to install and run this giveaway bot:

### ✅ Step 1: Preparation
- Before you begin, ensure you have the following:
- **`Node.js` and `npm` (Node Package Manager) installed on your computer.** You can download them from the official Node.js website: [https://nodejs.org/](https://nodejs.org/)
- **A Discord account and a Discord server where you have management permissions.**
- **A Discord Bot Token.** To get a token, you need to create an application and a bot on the Discord Developer Portal: [https://discord.com/developers/applications](https://discord.com/developers/applications). Make sure you have enabled "Presence Intent," "Server Members Intent," and "Message Content Intent" (if necessary for advanced features). **Note: Keep your token secure and do not share it with anyone.**

### ⬇️ Step 2: Download the Code
- You can download the entire code from this repository to your computer by using the following command in your terminal or command prompt:
```git clone <https://github.com/thinhhungw/Dicord-bot>```
- Alternatively, you can download it as a ZIP file and extract it.

### 📚 Step 3: Install Required Libraries
- After downloading the code, open your terminal or command prompt, navigate to the bot's code directory, and run the following command to install the necessary libraries (including `discord.js` and `dotenv`):
```npm install discord.js dotenv```

### 📄 Step 4: Configure Environment Variables
- Create a `.env` file: In the project's root directory, create a new file named `.env`.
- Add Discord Bot Token: Open the `.env` file and add the following line, replacing `<YOUR_BOT_TOKEN>` with your Discord bot token:
```DISCORD_TOKEN=<YOUR_BOT_TOKEN>```

### 🚀 Step 5: Run the Bot
- Finally, to run the bot, use the following command in your terminal or command prompt (still in the project's root directory):
```node index.js```
- (Assuming your main executable file is `index.js`. If you have a different executable file, replace `index.js` with its name).
