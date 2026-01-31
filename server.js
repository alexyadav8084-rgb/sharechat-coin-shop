const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// ===== Routes =====

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
