import {Client, GatewayIntentBits} from "discord.js";
import {CONFIG} from "./config.js";
import {getPositions} from "./src/hyperliquidAPI.js";
import {tracker} from "./src/adressTracker.js";
import {handleTrackCommand} from "./src/track.js";
import {handleUntrackCommand} from "./src/track.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log('Bot is ready!');

    tracker.setNotificationChannel(client.channels.cache.get(CONFIG.NOTIFICATION_CHANNEL));
    console.log('Notification channel set : ' + CONFIG.NOTIFICATION_CHANNEL);

    setInterval( () => tracker.checkChanges(), CONFIG.CHECK_INTERVAL);
    console.log('Interval set to ' + CONFIG.CHECK_INTERVAL + 'ms');
});


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!positions')) {
        const args = message.content.split(' ');
        const address = args[1];

        if (!address) {
            return message.reply('Please provide an address');
        }

        try {
            const positions = await getPositions(address);
            
            if (!positions || positions.length === 0) {
                return message.reply(`❌ No positions found for address ${address}`);
            }

            let summary = `🔍 **Positions for ${address.slice(0, 6)}...${address.slice(-4)}**\n\n`;
            positions.forEach((positionData, index) => {
                const position = positionData.position;
                const direction = parseFloat(position.szi) > 0 ? "📈 LONG" : "📉 SHORT";
                const pnl = parseFloat(position.unrealizedPnl);
                const roe = parseFloat(position.returnOnEquity) * 100;
                const pnlEmoji = pnl >= 0 ? "🟢" : "🔴";
                
                summary += `\`\`\`ml\n`;
                summary += `${direction} ${position.coin}\n`;
                summary += `├─ Size: ${Math.abs(position.szi).toFixed(4)} (${parseFloat(position.positionValue).toFixed(2)}$)\n`;
                summary += `├─ Entry Price: ${parseFloat(position.entryPx).toFixed(4)}$\n`;
                summary += `├─ Leverage: ${position.leverage.value}x\n`;
                summary += `├─ PnL: ${pnl.toFixed(4)}$ (${roe.toFixed(2)}%) ${pnlEmoji}\n`;
                summary += `└─ Liquidation: ${parseFloat(position.liquidationPx).toFixed(4)}$\n`;
                summary += `\`\`\`\n`;
            });

            // Add timestamp footer
            const timestamp = new Date().toLocaleTimeString('en-US');
            summary += `\n⏰ *Last updated at ${timestamp}*`;

            await message.reply(summary);
        } 
        catch (error) {
            console.error('Error:', error);
            await message.reply('❌ Error fetching positions. Please verify the address and try again.');
        }
    }

    if (message.content.startsWith('!track')) {
            console.log('Track command received');
            const address = message.content.split(' ')[1];
            await tracker.trackWallet(address);
            message.reply(`✅ Now tracking address: ${address}`);
    }

    if (message.content.startsWith('!untrack')) {
        console.log('Untrack command received');
        const address = message.content.split(' ')[1];
        await tracker.untrackWallet(address);
        message.reply(`✅ Now untracking address: ${address}`);
    }

    if (message.content.startsWith('!list')) {
        console.log('List command received');
        const addresses = tracker.listTrackedWallets();
        message.reply(`🕵️‍♂️ Tracked addresses: ${addresses.join(', ')}`);
    }
});

client.login(CONFIG.TOKEN);




