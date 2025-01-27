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
        
        const { startDate, endDate, league, category } = req.body;
        
        // const filteredCategory = '%' + category + '%';
        console.log("league===>", league);
        console.log("category===>", category);
        
        // const category = "ソウブレイズex";

        // Validate required parameters
        if (!startDate || !endDate || !league) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        // Define the MySQL query
        // const prev_query = `
        //     SELECT
        //         category_var,
        //         name_var,
        //         count_int,
        //         image_var,
        //         GROUP_CONCAT(count_int ORDER BY count_int ASC) AS counts,
        //         GROUP_CONCAT(card_count ORDER BY count_int ASC) AS card_counts,
        //         GROUP_CONCAT(ROUND((card_count / cards_total) * 100, 2) ORDER BY count_int ASC) AS percentages
        //     FROM
        //     (SELECT
        //         category_var,
        //         name_var,
        //         count_int,
        //         image_var,
        //         COUNT(*) AS card_count,
        //         (SELECT COUNT(*) FROM cards_cards d
        //          WHERE d.name_var = c.name_var
        //            AND league_var = ? 
        //            AND date_date BETWEEN ? AND ?) AS cards_total
        //     FROM
        //         cards_cards c
        //     WHERE 
        //         league_var = ? 
        //         AND date_date BETWEEN ? AND ?
        //     GROUP BY 
        //         category_var, name_var, count_int) AS result
        //     GROUP BY name_var;
        // `;

        const query = `
            WITH FilteredEvents AS (
                SELECT id, event_holding_id
                FROM events
                WHERE event_date_date BETWEEN ? AND ?
                AND event_league_int = ?
            ),
            FilteredDecks AS (
                SELECT d.*
                FROM decks d
                JOIN FilteredEvents fe ON d.event_holding_id = fe.event_holding_id
            ),
            FilteredCardsByCategory AS (
                SELECT c.*
                FROM cards c
                WHERE EXISTS (
                    SELECT 1
                    FROM FilteredDecks fd
                    WHERE c.deck_ID_var = fd.deck_ID_var
                )
                AND c.name_var = ?
            ),
            RelatedDecks AS (
                SELECT DISTINCT d.*, fc.image_var
                FROM decks d
                JOIN FilteredCardsByCategory fc ON d.deck_ID_var = fc.deck_ID_var
            ),
            AllRelatedCards AS (
                SELECT c.*
                FROM cards c
                WHERE EXISTS (
                    SELECT 1
                    FROM RelatedDecks rd
                    WHERE c.deck_ID_var = rd.deck_ID_var
                )
            ),
            CardCounts AS (
                SELECT
                    category_int,
                    image_var,
                    name_var,
                    count_int,
                    COUNT(*) AS count_frequency
                FROM (
                    SELECT name_var, count_int, image_var, category_int
                    FROM AllRelatedCards
                ) AS subquery
                GROUP BY name_var, count_int
            ),
            CardTotals AS (
                SELECT
                    name_var,
                    SUM(count_frequency) AS total_count
                FROM CardCounts
                GROUP BY name_var
            ),
            FinalResults AS (
                SELECT
                    cc.category_int,
                    cc.image_var,
                    cc.name_var,
                    GROUP_CONCAT(cc.count_int ORDER BY cc.count_int ASC) AS count_array,
                    GROUP_CONCAT(cc.count_frequency ORDER BY cc.count_int ASC) AS counts_array,
                    GROUP_CONCAT(
                        ROUND((cc.count_frequency * 100.0 / ct.total_count), 2)
                        ORDER BY cc.count_int ASC
                    ) AS percentage_array
                FROM CardCounts cc
                JOIN CardTotals ct ON cc.name_var = ct.name_var
                GROUP BY cc.name_var
            )
            SELECT
                category_int,
                image_var,
                name_var,
                count_array AS COUNT,
                counts_array,
                percentage_array
            FROM FinalResults;
        `;
        const query2 = `
            WITH FilteredEvents AS (
                SELECT id, event_holding_id
                FROM events
                WHERE event_date_date BETWEEN ? AND ?  -- Start date and end date placeholders
                AND event_league_int = ?  -- Event league ID placeholder
            ),
            FilteredDecks AS (
                SELECT d.*
                FROM decks d
                JOIN FilteredEvents fe ON d.event_holding_id = fe.event_holding_id
            ),
            FilteredCardsByCategory AS (
                SELECT c.*
                FROM cards c
                WHERE EXISTS (
                    SELECT 1
                    FROM FilteredDecks fd
                    WHERE c.deck_ID_var = fd.deck_ID_var
                )
                AND c.name_var = ?  -- Card name placeholder
            ),
            RelatedDecks AS (
                SELECT DISTINCT d.*, fc.image_var
                FROM decks d
                JOIN FilteredCardsByCategory fc ON d.deck_ID_var = fc.deck_ID_var
            ),
            AllRelatedCards AS (
                SELECT c.*
                FROM cards c
                WHERE EXISTS (
                    SELECT 1
                    FROM RelatedDecks rd
                    WHERE c.deck_ID_var = rd.deck_ID_var
                )
            ),
            CardCounts AS (
                SELECT
                    category_int,
                    image_var,
                    name_var,
                    count_int,
                    COUNT(*) AS count_frequency
                FROM AllRelatedCards
                GROUP BY name_var, count_int, category_int, image_var
            ),
            CardTotals AS (
                SELECT
                    name_var,
                    SUM(count_frequency) AS total_count
                FROM CardCounts
                GROUP BY name_var
            ),
            FinalResults AS (
                SELECT
                    cc.category_int,
                    cc.image_var,
                    cc.name_var,
                    GROUP_CONCAT(cc.count_int ORDER BY cc.count_int ASC) AS count_array,
                    GROUP_CONCAT(cc.count_frequency ORDER BY cc.count_int ASC) AS counts_array,
                    GROUP_CONCAT(
                        ROUND((cc.count_frequency * 100.0 / ct.total_count), 2)
                        ORDER BY cc.count_int ASC
                    ) AS percentage_array
                FROM CardCounts cc
                JOIN CardTotals ct ON cc.name_var = ct.name_var
                GROUP BY cc.category_int, cc.image_var, cc.name_var
            )
            SELECT
                category_int,
                image_var,
                name_var,
                count_array AS COUNT,
                counts_array,
                percentage_array
            FROM FinalResults;
        `;

        // Execute the query with parameters
        const [rows] = await db.query(query, [startDate, endDate, league, category]);
        
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