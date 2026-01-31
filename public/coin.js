const coinsData = [
    {
        coins: 5000,
        bonus: 1500,
        price: 500,
        oldPrice: 700
    },
    {
        coins: 10000,
        bonus: 4000,
        price: 950,
        oldPrice: 1000
    },
    {
        coins: 15000,
        bonus: 5000,
        price: 1450,
        oldPrice: 2000
    },
    {
        coins: 40000,
        bonus: 10000,
        price: 1999,
        oldPrice: 2600
    },
    {
        coins: 50000,
        bonus: 50000,
        price: 2500,
        oldPrice: 4000
    }
];

const container = document.getElementById("coinContainer");

coinsData.forEach(item => {
    const div = document.createElement("div");

    div.onclick = () => openPayment(item.price, `${item.coins} + ${item.bonus} Bonus`);

    div.innerHTML = `
        <div class="space-y-3 coin">
            <div class="border rounded-xl p-4 flex justify-between items-center bg-white hover:border-green-500 transition cursor-pointer" onclick="openPayment(${item.price}, '${item.coins} + ${item.bonus} Bonus')">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🪙</span>
                    <div>
                        <p class="font-bold">${item.coins} <span class="text-green-600">+${item.bonus}</span></p>
                        <p class="text-gray-400 text-sm">₹${item.price}  <span class="line-through text-xs">₹${item.oldPrice}</span></p>
                    </div>
                </div>
                <button class="bg-green-600 text-white px-5 py-1 rounded-full text-sm font-bold">Buy</button>
            </div>
        </div>
    `;

    container.appendChild(div);
});
