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
        this.alerts.set(coin.toUpperCase(), {
            treshhold: parseFloat(treshhold), 
            above: above, 
            lastState: false
        });
    }

    removeAlert(coin) {
        this.alerts.delete(coin.toUpperCase());
    }

    checkFundingAlerts() {
        for (const [coin, alert] of this.alerts.entries()) {
            const fundingRate = getFundingRates(coin);
            if (alert.above && fundingRate > alert.treshhold && !alert.lastState) {
                this.notifyAlert(coin, alert.treshhold, fundingRate);
                alert.lastState = true;
            } else if (!alert.above && fundingRate < alert.treshhold && alert.lastState) {
                this.notifyAlert(coin, alert.treshhold, fundingRate);
                alert.lastState = false;
            }
        }
    }

    notifyAlert(coin, treshhold, fundingRate) {
        if (this.notificationChannel) {
            this.notificationChannel.send(`🚨 Alert: ${coin} is above ${treshhold}% with a funding rate of ${fundingRate}% Annualized`);
        }
    }

    listAlerts() {
        const alerts = [];
        this.alerts.forEach((alert, coin) => {
            const status = alert.lastState ? '↗️' : '↘️';
            alerts.push(`${coin}: ${status} ${alert.treshhold}% (${alert.above ? 'above' : 'below'})`);
        });
        return alerts.join('\n');
    }
}

export const fundingTracker = new FundingTracker();