const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Put your index.html in a 'public' folder

// Route to handle payment submission
app.post('/api/pay', (req, res) => {
    const { utr } = req.body;

    if (!utr) {
        return res.status(400).send("UTR is required");
    }

    // Since there is no database, we just log it to the terminal
    console.log(`[PAYMENT RECEIVED] UTR: ${utr} | Time: ${new Date().toLocaleString()}`);

    res.status(200).json({ message: "Verification in progress" });
});


app.post('/api/profile-data', async (req, res) => {
    try {
        const { username } = req.body;
        const url = `https://sharechat.com/profile/${username}`;
        
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        
        const $ = cheerio.load(data);
        const stats = [];

        // Stats fetching logic
        $('.Fz\\(\\$fzbutton\\).Lh\\(\\$lhbutton\\).Fw\\(\\$fwbutton\\)').each((i, el) => {
            stats.push($(el).text().trim());
        });

        // Name and Image extraction based on your provided classes
        const nameClass = '.Whs\\(nw\\).Ovx\\(h\\).Tov\\(e\\).Maw\\(100\\%\\).Fz\\(\\$fzbutton\\).Fw\\(\\$fwbutton\\)';
        const imgSelector = 'img.Pos\\(a\\).W\\(\\$8xl\\).H\\(\\$8xl\\).Bdrs\\(50\\%\\)';

        res.json({
            username: username,
            name: $(nameClass).first().text().trim() || username,
            followers: stats[0] || "0",
            following: stats[1] || "0",
            posts: stats[2] || "0",
            image: $(imgSelector).attr('src') || "https://www.w3schools.com/howto/img_avatar.png"
        });
    } catch (e) {
        res.status(500).json({ error: "Profile Not Found" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});