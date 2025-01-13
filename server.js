const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db"); // Import database connection
require('dotenv').config();

const app = express();
const PORT = 5000;

const allowedOrigins = [process.env.FRONTEND_URL, "http://162.43.45.35:80", "http://162.43.45.35"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error('Not allowed by CORS'));
            }
          },
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization'],
    })
); // Adjust the origin as needed

app.use(bodyParser.json()); // Parse JSON bodies

app.post("/api/cards", async (req, res) => {
    console.log("⛳ API FROM FRONTEND IS ARRIVED! ⛳");
    try {
        const { startDate, endDate, league } = req.body;

        // Ensure the required parameters are provided
        if (!startDate || !endDate || !league) {
            return res
                .status(400)
                .json({ message: "Missing required parameters" });
        }

        // Define the MySQL query
        const query = `
            SELECT
                category_var,
                name_var,
                count_int,
                image_var,
                GROUP_CONCAT(count_int
                    ORDER BY count_int ASC) AS counts,
                GROUP_CONCAT(card_count
                    ORDER BY count_int ASC) AS card_counts,
                GROUP_CONCAT(
                    ROUND((card_count / cards_total) * 100, 2)
                    ORDER BY count_int ASC
                ) AS percentages
            FROM
            (SELECT
                category_var,
                name_var,
                count_int,
                image_var,
                COUNT(*) AS card_count,
                (SELECT
                COUNT(*)
                FROM
                cards_cards d
                WHERE d.name_var = c.name_var
                and league_var = ?
                and date_date between ?
                and ?) AS cards_total
            FROM
                cards_cards c
            where league_var = ?
                and date_date between ?
                AND ?
            GROUP BY category_var,
                name_var,
                count_int) AS result
            GROUP BY name_var;
            `;

        // Execute the query with parameters
        const rows = await db.query(query, [league, startDate, endDate, league, startDate, endDate]);
        // console.log("rows====>", rows);
        console.log("👌 THE ROW ARE RERTURN BACK ====> OK! 👌");
        // Respond with the filtered data
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching data:", err);
        // res.status(500).json({ message: "Database error" });
    }
});

// PUT request: Update user data
app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        const [result] = await db.query(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name, email, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User updated successfully" });
    } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).json({ message: "Database error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🐎🐎🐎 Server is running on http://localhost:${PORT} 🐎🐎🐎`);
});