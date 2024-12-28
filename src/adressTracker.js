import { getPositions } from './hyperliquidAPI.js';
import { CONFIG } from '../config.js';

class PositionTracker {
    constructor() {
        this.trackedWallets = new Map();
        this.notificationChannel = null;
    }

    setNotificationChannel(channel) {
        this.notificationChannel = channel;
    }

    async trackWallet(address, nickname = '') {
        const positions = await getPositions(address);
        this.trackedWallets.set(address, {positions: positions, nickname: nickname});
    }

    async untrackWallet(address) {
        this.trackedWallets.delete(address);
    }

    async checkChanges() {
        console.log('Checking changes...');
        console.log(this.trackedWallets);
        for (const [address, walletData] of this.trackedWallets.entries()) {
            const newPositions = await getPositions(address);
            
            if (JSON.stringify(walletData.positions) !== JSON.stringify(newPositions)) {

                const newTrades = newPositions.filter(newPos => 
                    !walletData.positions.some(oldPos => oldPos.position.coin === newPos.position.coin));
                
                const closedTrades = walletData.positions.filter(oldPos => 
                    !newPositions.some(newPos => newPos.position.coin === oldPos.position.coin));

                if (this.notificationChannel) {
                    this.notifyChanges(address, walletData.nickname, newTrades, closedTrades);
                }

                console.log('New trades: ', JSON.stringify(newTrades, null, 2));
                console.log('Closed trades: ', JSON.stringify(closedTrades, null, 2));

                this.trackedWallets.set(address, {...walletData, positions: newPositions});
            }
        }
    }

    notifyChanges(address, nickname,newTrades, closedTrades) {
        // Notify new positions
        for (const trade of newTrades) {
            const direction = parseFloat(trade.position.szi) > 0 ? "📈 LONG" : "📉 SHORT";
            const message = `🔔 New position for ${nickname}:\n` +
                `\`\`\`ml\n` +
                `${direction} ${trade.position.coin}\n` + 
                `Size: ${Math.abs(trade.position.szi).toFixed(4)}\n` +
                `Entry Price: $${parseFloat(trade.position.entryPx).toFixed(2)}\n` +
                `Leverage: ${trade.position.leverage.value}x\n` +
                `Liquidation: $${parseFloat(trade.position.liquidationPx).toFixed(4)}\n` +
                `\`\`\``;
            this.notificationChannel.send(message);
        }

        // Notify closed positions
        for (const trade of closedTrades) {
            console.log(trade);
            const pnl = parseFloat(trade.position.unrealizedPnl);
            const roe = parseFloat(trade.position.returnOnEquity) * 100;
            const pnlEmoji = pnl >= 0 ? "🟢" : "🔴";

            const message = `🔔 Position closed for ${nickname}:\n` +
                `\`\`\`ml\n` +
                `${trade.position.coin} position closed\n` +
                `PnL: ${pnl.toFixed(4)}$ (${roe.toFixed(2)}%) ${pnlEmoji}\n` +
                `\`\`\``;
                
            this.notificationChannel.send(message);
        }
    }

    listTrackedWallets() {
        const wallets = [];
        this.trackedWallets.forEach((data, address) => {
            if (data.nickname) {
                wallets.push(`${data.nickname} (${address})`);
            } else {
                wallets.push(`${address}`);
            }
        });
        return wallets;
    }

}

export const tracker = new PositionTracker();