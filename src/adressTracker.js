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

    async trackWallet(address) {
        const positions = await getPositions(address);
        this.trackedWallets.set(address, positions);
    }

    async untrackWallet(address) {
        this.trackedWallets.delete(address);
    }

    async checkChanges() {
        console.log('Checking changes...');
        console.log(this.trackedWallets);
        for (const [address, oldPositions] of this.trackedWallets.entries()) {
            const newPositions = await getPositions(address);
            
            if (JSON.stringify(oldPositions) !== JSON.stringify(newPositions)) {

                const newTrades = newPositions.filter(newPos => 
                    !oldPositions.some(oldPos => oldPos.position.coin === newPos.position.coin));
                
                const closedTrades = oldPositions.filter(oldPos => 
                    !newPositions.some(newPos => newPos.position.coin === oldPos.position.coin));

                if (this.notificationChannel) {
                    this.notifyChanges(address, newTrades, closedTrades);
                }

                console.log('New trades: ', JSON.stringify(newTrades, null, 2));
                console.log('Closed trades: ', JSON.stringify(closedTrades, null, 2));

                this.trackedWallets.set(address, newPositions);
            }
        }
    }

    notifyChanges(address, newTrades, closedTrades) {
        // Notify new positions
        for (const trade of newTrades) {
            const direction = parseFloat(trade.position.szi) > 0 ? "LONG" : "SHORT";
            const message = `🔔 New position for ${address.slice(0, 6)}...${address.slice(-4)}:\n` +
                `\`\`\`ml\n` +
                `${direction} ${trade.position.coin}\n` +
                `Size: ${Math.abs(trade.position.szi).toFixed(4)}\n` +
                `Entry Price: ${parseFloat(trade.position.entryPx).toFixed(2)}$\n` +
                `\`\`\``;
            this.notificationChannel.send(message);
        }

        // Notify closed positions
        for (const trade of closedTrades) {
            const message = `🔔 Position closed for ${address.slice(0, 6)}...${address.slice(-4)}:\n` +
                `\`\`\`ml\n` +
                `${trade.position.coin} position closed\n` +
                `\`\`\``;
            this.notificationChannel.send(message);
        }
    }

    listTrackedWallets() {
        return Array.from(this.trackedWallets.keys());
    }

}

export const tracker = new PositionTracker();