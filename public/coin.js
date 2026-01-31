const coinsData = [
    {
        coins: 5000,
        bonus: 1500,
        price: 400,
        oldPrice: 500
    },
    {
        coins: 10000,
        bonus: 4000,
        price: 800,
        oldPrice: 1000
    },
    {
        coins: 10000,
        bonus: 4000,
        price: 800,
        oldPrice: 1000
    },
    {
        coins: 10000,
        bonus: 4000,
        price: 800,
        oldPrice: 1000
    },
    {
        coins: 10000,
        bonus: 4000,
        price: 800,
        oldPrice: 1000
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
