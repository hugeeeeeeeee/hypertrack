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