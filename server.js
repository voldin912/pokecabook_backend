const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db"); // Import database connection
require('dotenv').config();

const app = express();
const PORT = 5000;

// Load allowed origin from .env file
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"];

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
    try {
        console.log("🎈 API FROM FRONTEND IS ARRIVED! 🎈");
        // Extract startDate, endDate, and league from the request body
        const { startDate, endDate, league } = req.body;

        // Ensure the required parameters are provided
        if (!startDate || !endDate || !league) {
            return res
                .status(400)
                .json({ message: "Missing required parameters" });
        }

        // Define the MySQL query
        const query = `
            WITH GroupedCounts AS (
    SELECT
        category,
        image,
        NAME,
        DATE_FORMAT(date_date, '%Y-%m-%d') AS date_date,
        COUNT AS temp_count, 
        COUNT(*) AS ROW_COUNT
    FROM
        cards_cards
    WHERE league = ? AND date_date BETWEEN ? AND ?
    GROUP BY
        category, NAME, COUNT
),
Aggregated AS (
    SELECT
        category,
        image,
        date_date,        
        NAME,
        SUM(temp_count * ROW_COUNT) AS total_weighted_count,
        SUM(ROW_COUNT) AS total_row_count
    FROM
        GroupedCounts
    GROUP BY
        category, NAME
)
SELECT
    a.category,
    a.name,
    b.image,
    GROUP_CONCAT(a.temp_count) AS row_counts, -- Aggregate row_count values
    GROUP_CONCAT(ROUND(a.row_count / b.total_row_count * 100, 2)) AS percentages, -- Aggregate percentage values
    b.total_row_count -- Include total_row_count in the output
FROM
    GroupedCounts a
JOIN
    Aggregated b
ON
    a.category = b.category AND a.name = b.name
GROUP BY
    a.category, a.name, b.image, b.total_row_count;

`;

        // Execute the query with parameters
        const rows = await db.query(query, [league, startDate, endDate]);
        // console.log("rows====>", rows);
        console.log("👌 THE ROW ARE RERTURN BACK ====> OK! 👌");
        // Respond with the filtered data
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ message: "Database error" });
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
    console.log(`Server is running on http://localhost:${PORT}`);
});
