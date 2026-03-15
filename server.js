const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const fs = require("fs");

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Define coins content path
const coinsFilePath = path.join(__dirname, "coins.json");

// Helper function to read coins
const readCoins = () => {
  try {
    const data = fs.readFileSync(coinsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading coins.json:", error);
    return [];
  }
};

// Helper function to write coins
const writeCoins = (data) => {
  try {
    fs.writeFileSync(coinsFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Error writing coins.json:", error);
    return false;
  }
};

// ===== Routes =====

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== Coins API =====
app.get("/coins", (req, res) => {
  const coins = readCoins();
  res.json(coins);
});

app.post("/add", (req, res) => {
  const { coins, bonus, price, oldPrice } = req.body;
  if (!coins || !price) {
    return res.status(400).json({ error: "Coins and price are required" });
  }

  const currentCoins = readCoins();
  const newCoin = {
    coins: parseInt(coins) || 0,
    bonus: parseInt(bonus) || 0,
    price: parseInt(price) || 0,
    oldPrice: parseInt(oldPrice) || 0
  };

  currentCoins.push(newCoin);
  
  if (writeCoins(currentCoins)) {
    res.json({ message: "Coin added successfully", data: newCoin });
  } else {
    res.status(500).json({ error: "Failed to save coin" });
  }
});

app.post("/delete", (req, res) => {
  const { index } = req.body;
  if (index === undefined || index < 0) {
    return res.status(400).json({ error: "Valid index is required" });
  }

  const currentCoins = readCoins();
  
  if (index >= currentCoins.length) {
    return res.status(404).json({ error: "Coin not found" });
  }

  currentCoins.splice(index, 1);
  
  if (writeCoins(currentCoins)) {
    res.json({ message: "Coin deleted successfully" });
  } else {
    res.status(500).json({ error: "Failed to delete coin" });
  }
});

// ===== Payment API =====
app.post("/api/pay", (req, res) => {
  const { utr } = req.body;

  if (!utr) {
    return res.status(400).json({ error: "UTR is required" });
  }

  console.log(
    `[PAYMENT RECEIVED] UTR: ${utr} | Time: ${new Date().toLocaleString()}`
  );

  res.json({ message: "Verification in progress" });
});

// ===== ShareChat Profile API =====
app.post("/api/profile-data", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const url = `https://sharechat.com/profile/${username}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const stats = [];

    // followers / following / posts
    $('.Fz\\(\\$fzbutton\\).Lh\\(\\$lhbutton\\).Fw\\(\\$fwbutton\\)').each(
      (i, el) => {
        stats.push($(el).text().trim());
      }
    );

    const nameSelector =
      ".Whs\\(nw\\).Ovx\\(h\\).Tov\\(e\\).Maw\\(100\\%\\).Fz\\(\\$fzbutton\\).Fw\\(\\$fwbutton\\)";
    const imgSelector =
      "img.Pos\\(a\\).W\\(\\$8xl\\).H\\(\\$8xl\\).Bdrs\\(50\\%\\)";

    res.json({
      username,
      name: $(nameSelector).first().text().trim() || username,
      followers: stats[0] || "0",
      following: stats[1] || "0",
      posts: stats[2] || "0",
      image:
        $(imgSelector).attr("src") ||
        "https://www.w3schools.com/howto/img_avatar.png",
    });
  } catch (error) {
    console.error("PROFILE FETCH ERROR:", error.message);
    res.status(500).json({ error: "Profile Not Found or Blocked" });
  }
});

// ===== EXPORT FOR VERCEL =====
module.exports = app;

// ===== LOCAL DEV ONLY =====
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}