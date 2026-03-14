const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// ===== COINS DATA FILE =====
const coinsFile = path.join(__dirname, "coins.json");

// create file if not exist
if (!fs.existsSync(coinsFile)) {
  fs.writeFileSync(coinsFile, JSON.stringify([], null, 2));
}

function readCoins() {
  return JSON.parse(fs.readFileSync(coinsFile));
}

function saveCoins(data) {
  fs.writeFileSync(coinsFile, JSON.stringify(data, null, 2));
}

// ===== Routes =====

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== COINS API =====

// get all coins
app.get("/api/coins", (req, res) => {
  res.json(readCoins());
});

// add coin pack
app.post("/api/coins/add", (req, res) => {
  const { coins, bonus, price, oldPrice } = req.body;

  if (!coins || !price) {
    return res.status(400).json({ error: "Coins and price required" });
  }

  const data = readCoins();

  data.push({
    coins,
    bonus,
    price,
    oldPrice,
  });

  saveCoins(data);

  res.json({ message: "Coin pack added" });
});

// delete coin pack
app.post("/api/coins/delete", (req, res) => {
  const { index } = req.body;

  const data = readCoins();

  if (index === undefined || !data[index]) {
    return res.status(400).json({ error: "Invalid index" });
  }

  data.splice(index, 1);

  saveCoins(data);

  res.json({ message: "Coin pack deleted" });
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