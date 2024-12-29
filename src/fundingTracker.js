import { CONFIG } from '../config.js';

class FundingTracker {
    constructor() {
        this.alerts = new Map(); // Map < coin, {treshhold: number, above: boolean}
        this.notificationChannel = null;
    }

    setNotificationChannel(channel) {
        this.notificationChannel = channel;
    }

    addAlert(coin, treshhold, above = true) {
        this.alerts.set(coin.toUpperCase(), {treshhold: parseFloat(treshhold), above: above});
    }

    removeAlert(coin) {
        this.alerts.delete(coin.toUpperCase());
    }

    checkFundingAlerts() {
        for (const [coin, alert] of this.alerts.entries()) {
            const fundingRate = getFundingRates(coin);
            if (alert.above && fundingRate > alert.treshhold) {
                this.notifyAlert(coin, alert.treshhold, fundingRate);
            }
        }
    }

    notifyAlert(coin, treshhold, fundingRate) {
        if (this.notificationChannel) {
            this.notificationChannel.send(`🚨 Alert: ${coin} is above ${treshhold} with a funding rate of ${fundingRate} Annualized`);
        }
    }


}