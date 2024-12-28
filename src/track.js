import { tracker } from './adressTracker.js';

export async function handleTrackCommand(message) {
    const address = message.content.split(' ')[1];
    if (!address) {
        return message.reply('Please provide an address. Usage: !track 0x123...');
    }

    await tracker.trackWallet(address);
    message.reply(`✅ Now tracking address: ${address}`);
}

export async function handleUntrackCommand(message) {
    const address = message.content.split(' ')[1];
    if (!address) {
        return message.reply('Please provide an address. Usage: !untrack 0x123...');
    }
    await tracker.untrackWallet(address);
    message.reply(`✅ Now untracking address: ${address}`);
}