import fetch from 'node-fetch';

export async function getPositions(address) {
    try {
        const response = await fetch("https://api.hyperliquid.xyz/info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "clearinghouseState",
                user: address
            })
        });

        const data = await response.json();
        return data.assetPositions || [];
    } catch (error) {
        console.error('Error fetching positions:', error);
        return [];
    }
} 

export async function getFundingRates(coin) {
    try {
        coin = coin.toUpperCase();
        console.log("requesting funding rates for", coin);

        const response = await fetch("https://api.hyperliquid.xyz/info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "metaAndAssetCtxs"
            })
        });
        const data = await response.json();
        console.log("data recu de l'API");

        const universe = data[0].universe;
        const assets = data[1];

        console.log("universe", universe);
        console.log("assets", assets);

        for (let i = 0; i < universe.length; i++) {
            if (universe[i].name === coin) {
                console.log(assets[i].funding);
                return parseFloat(assets[i].funding*24*365*100);
            }
        }

    } catch (error) {
        console.error('Error fetching funding rates:', error);
        return 0;
    }
}

