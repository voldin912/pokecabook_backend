const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db"); // Import database connection
require('dotenv').config();

const app = express();
const PORT = 5000;

// Use CORS middleware to allow cross-origin requests
app.use(cors({
  origin: '*', // Allow requests from this frontend URL
}));

// Middleware to parse JSON body data
app.use(bodyParser.json()); 

// API endpoint for fetching data
app.post("/api/cards", async (req, res) => {
    console.log("⛳ API FROM FRONTEND IS ARRIVED! ⛳");
    try {
        console.log("req.body==>", req.body);
        
        const { startDate, endDate, league } = req.body;

        // Validate required parameters
        if (!startDate || !endDate || !league) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        // Define the MySQL query
        const query = `
            SELECT
                category_var,
                name_var,
                count_int,
                image_var,
                GROUP_CONCAT(count_int ORDER BY count_int ASC) AS counts,
                GROUP_CONCAT(card_count ORDER BY count_int ASC) AS card_counts,
                GROUP_CONCAT(ROUND((card_count / cards_total) * 100, 2) ORDER BY count_int ASC) AS percentages
            FROM
            (SELECT
                category_var,
                name_var,
                count_int,
                image_var,
                COUNT(*) AS card_count,
                (SELECT COUNT(*) FROM cards_cards d
                 WHERE d.name_var = c.name_var
                   AND league_var = ? 
                   AND date_date BETWEEN ? AND ?) AS cards_total
            FROM
                cards_cards c
            WHERE 
                league_var = ? 
                AND date_date BETWEEN ? AND ?
            GROUP BY 
                category_var, name_var, count_int) AS result
            GROUP BY name_var;
        `;

        // Execute the query with parameters
        const [rows] = await db.query(query, [league, startDate, endDate, league, startDate, endDate]);
        
        // Check if rows are found
        if (rows.length > 0) {
            console.log("👌 DATA FOUND, RETURNING BACK TO FRONTEND 👌");
            console.log("rows====>", rows);
            res.status(200).json(rows); // Send the data to the frontend
        } else {
            res.status(200).json(rows);
        }
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🐎🐎🐎 Server is running on http://localhost:${PORT} 🐎🐎🐎`);
});