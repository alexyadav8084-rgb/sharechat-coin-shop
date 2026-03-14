const container = document.getElementById("coinContainer");

async function loadCoins() {

    try {

        const res = await fetch("/api/coins");
        const coinsData = await res.json();

        container.innerHTML = "";

        coinsData.forEach(item => {

            const div = document.createElement("div");

            div.onclick = () => openPayment(item.price, `${item.coins} + ${item.bonus} Bonus`);

            div.innerHTML = `
                <div class="space-y-3 coin">
                    <div class="border rounded-xl p-4 flex justify-between items-center bg-white hover:border-green-500 transition cursor-pointer">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">
                                <img src="https://cdn4.sharechat.com/33d5318_1c8/tools/e7e57ba_1715942283598_sc.webp" class="spin">
                            </span>
                            <div>
                                <p class="font-bold">${item.coins} <span class="text-green-600">+${item.bonus}</span></p>
                                <p class="text-gray-400 text-sm">
                                    ₹${item.price} 
                                    <span class="line-through text-xs">₹${item.oldPrice}</span>
                                </p>
                            </div>
                        </div>

                        <button class="bg-green-600 text-white px-5 py-1 rounded-full text-sm font-bold">
                            Buy
                        </button>

                    </div>
                </div>
            `;

            container.appendChild(div);

        });

    } catch (error) {

        console.error("Coin load error:", error);

    }

}

// load coins on page start
loadCoins();