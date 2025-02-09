// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const db = require("./db"); // Import database connection
// require('dotenv').config();

// const app = express();
// const PORT = 5000;

// // Use CORS middleware to allow cross-origin requests
// app.use(cors({
//   origin: '*', // Allow requests from this frontend URL
// }));

// // Middleware to parse JSON body data
// app.use(bodyParser.json()); 

// // API endpoint for fetching data
// app.post("/api/cards", async (req, res) => {
//     console.log("⛳ API FROM FRONTEND IS ARRIVED! ⛳");
//     try {
//         console.log("req.body==>", req.body);
        
//         const { startDate, endDate, league, category } = req.body;
        
//         // Validate required parameters
//         if (!startDate || !endDate || !league) {
//             return res.status(400).json({ message: "Missing required parameters" });
//         }

//         const query = `
//             WITH FilteredEvents AS (
//                 SELECT id, event_holding_id
//                 FROM events
//                 WHERE event_date_date BETWEEN ? AND ?
//                 AND event_league_int = ?
//             ),
//             FilteredDecks AS (
//                 SELECT d.*
//                 FROM decks d
//                 JOIN FilteredEvents fe ON d.event_holding_id = fe.event_holding_id
//             ),
//             FilteredCardsByCategory AS (
//                 SELECT c.*
//                 FROM cards c
//                 WHERE EXISTS (
//                     SELECT 1
//                     FROM FilteredDecks fd
//                     WHERE c.deck_ID_var = fd.deck_ID_var
//                 )
//                 AND c.name_var = ?
//                 AND c.count_int > 1
//             ),
//             RelatedDecks AS (
//                 SELECT DISTINCT d.*, fc.image_var
//                 FROM decks d
//                 JOIN FilteredCardsByCategory fc ON d.deck_ID_var = fc.deck_ID_var
//             ),
//             AllRelatedCards AS (
//                 SELECT c.*
//                 FROM cards c
//                 WHERE EXISTS (
//                     SELECT 1
//                     FROM RelatedDecks rd
//                     WHERE c.deck_ID_var = rd.deck_ID_var
//                 )
//             ),
//             CardCounts AS (
//                 SELECT
//                     category_int,
//                     image_var,
//                     REPLACE(name_var, ' ', '') AS name_var,
//                     count_int,
//                     COUNT(*) AS count_frequency
//                 FROM (
//                     SELECT name_var, count_int, image_var, category_int
//                     FROM AllRelatedCards
//                 ) AS subquery
//                 GROUP BY name_var, count_int
//             ),
//             CardTotals AS (
//                 SELECT
//                     name_var,
//                     SUM(count_frequency) AS total_count
//                 FROM CardCounts
//                 GROUP BY name_var
//             ),
//             FinalResults AS (
//                 SELECT
//                     cc.category_int,
//                     cc.image_var,
//                     cc.name_var,
//                     GROUP_CONCAT(cc.count_int ORDER BY cc.count_int ASC) AS count_array,
//                     GROUP_CONCAT(cc.count_frequency ORDER BY cc.count_int ASC) AS counts_array
//                 FROM CardCounts cc
//                 JOIN CardTotals ct ON cc.name_var = ct.name_var
//                 GROUP BY cc.name_var
//             )
//             SELECT
//                 category_int,
//                 image_var,
//                 name_var,
//                 count_array AS COUNT,
//                 counts_array
//             FROM FinalResults;
//         `;

//         // ,
//         //         percentage_array
//         // Execute the query with parameters
//         const [rows] = await db.query(query, [startDate, endDate, league, category]);
//         console.log("rows==>", rows);
        
//         // const filtered_rows = rows[0]?.total_events_count || 0;

//         const events_count_query = `
//             SELECT COUNT(*) AS total_events_count
//             FROM events
//             WHERE event_date_date BETWEEN ? AND ?;
//         `;

//         const events_count = await db.query(events_count_query, [startDate, endDate]);
//         const filtered_events_count = events_count[0][0]?.total_events_count || 0;
        
//         console.log("😀😀😀😀filtered_events_count==>", filtered_events_count);
        
//         const decks_count_query = `
//             SELECT COUNT(*) AS total_decks_count
//             FROM decks
//             WHERE deck_date_date BETWEEN ? AND ?;
//         `

//         const [decks_count] = await db.query(decks_count_query, [startDate, endDate]);
//         const filtered_decks_count = decks_count[0]?.total_decks_count || 0;

//         console.log("decks_count==>", filtered_decks_count);

//         const specific_decks_count_query = `
//             WITH FilteredEvents AS (
//                 SELECT id, event_holding_id
//                 FROM events
//                 WHERE event_date_date BETWEEN ? AND ?
//                 AND event_league_int = ?
//             ),
//             FilteredDecks AS (
//                 SELECT d.deck_ID_var
//                 FROM decks d
//                 JOIN FilteredEvents fe ON d.event_holding_id = fe.event_holding_id
//             ),
//             FilteredCardsByCategory AS (
//                 SELECT c.*
//                 FROM cards c
//                 WHERE EXISTS (
//                     SELECT 1
//                     FROM FilteredDecks fd
//                     WHERE c.deck_ID_var = fd.deck_ID_var
//                 )
//                 AND c.name_var = ?
//                 AND c.count_int > 1
//             ),
//             RelatedDecks AS (
//                 SELECT DISTINCT d.event_holding_id, d.place_var, d.deck_ID_var
//                 FROM decks d
//                 JOIN FilteredCardsByCategory fc ON d.deck_ID_var = fc.deck_ID_var
//             )
//             SELECT COUNT(*) AS specific_count FROM RelatedDecks	
//         `;

//         const [specific_decks_count] = await db.query(specific_decks_count_query, [startDate, endDate, league, category]);
//         const filtered_specific_decks_count = specific_decks_count[0]?.specific_count || 0;
        
//         console.log("specific_decks_count==>", filtered_specific_decks_count);
//         // console.log("events_count==>", events_count[0][0].total_events_count);
        
//         // Check if rows are found
//         if (rows.length > 0) {
//             console.log("👌 DATA FOUND, RETURNING BACK TO FRONTEND 👌");
//             // console.log("rows====>", rows);
//             res.status(200).json({ rows, filtered_events_count, filtered_decks_count, filtered_specific_decks_count }); // Send the data to the frontend
//         } else {
//             res.status(200).json({ rows, filtered_events_count, filtered_decks_count, filtered_specific_decks_count });
//         }
//     } catch (err) {
//         console.error("Error fetching data:", err);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });

// app.get("/api/card-category", async (req, res) => {
//     console.log("🍖 API FROM FRONTEND IS ARRIVED! 🍖");
//     try {
//         const query = `SELECT * FROM deck_categories1`;
//         const [deck_categories1] = await db.query(query);
//         // console.log("deck_categories1===>", deck_categories1);
        
//         // Send the actual data in the response
//         res.status(200).json(deck_categories1);
//     } catch (err) {
//         console.error("Error fetching data:", err);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// });

// app.get("/api/day-card", async(req, res) => {
//     console.log("📆 API FROM FRONTEND IS ARRIVED! 📆");
//     try {
//         const query = `
//             SELECT 
//                 q1.event_date_date, 
//                 q1.event_title_var, 
//                 q1.deck_ID_var, 
//                 q2.event_count
//             FROM (
//                 SELECT 
//                     events.event_date_date, 
//                     events.event_title_var, 
//                     decks.deck_ID_var
//                 FROM events
//                 INNER JOIN decks
//                     ON events.event_holding_id = decks.event_holding_id
//                 GROUP BY events.event_date_date
//             ) AS q1
//             INNER JOIN (
//                 SELECT 
//                     event_date_date, 
//                     COUNT(*) AS event_count
//                 FROM events
//                 GROUP BY event_date_date
//             ) AS q2
//             ON q1.event_date_date = q2.event_date_date
//             ORDER BY q1.event_date_date DESC;
//         `;
//         const [event_per_day_result] = await db.query(query);

//         console.log("event_per_day_result==>", event_per_day_result);
        
//         res.status(200).json(event_per_day_result);
//         // if (rows.length > 0) {
//         //     console.log("👌 DATA FOUND, RETURNING BACK TO FRONTEND 👌");
//         //     // console.log("rows====>", rows);
//         //     res.status(200).json({ rows, filtered_events_count, filtered_decks_count, filtered_specific_decks_count }); // Send the data to the frontend
//         // } else {
//         //     res.status(200).json({ rows, filtered_events_count, filtered_decks_count, filtered_specific_decks_count });
//         // }
//     } catch (err) {
//         console.error("Error fetching data:", err);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// })

// app.post("/api/place-card", async(req, res) => {
//     console.log("🏢 API FROM FRONTEND IS ARRIVED! 🏢");
//     try {
//         const { page, pageSize } = req.body;
//         const offset = (page - 1) * pageSize;
//         const query = `
//             SELECT 
//                 e.event_holding_id, 
//                 e.event_date_date, 
//                 e.event_title_var, 
//                 e.event_place_var, 
//                 d.deck_ID_var
//             FROM events AS e
//             LEFT JOIN decks AS d
//                 ON e.event_holding_id = d.event_holding_id
//             GROUP BY e.event_place_var
//             ORDER BY e.id
//             LIMIT ${pageSize} OFFSET ${offset};
//         `;
//         const [events_result] = await db.query(query);
//         res.status(200).json(events_result);
//     } catch (err) {
//         console.error("Error fetching data:", err);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// })

// app.get("/api/place-card/total", async(req, res) => {
//     console.log("🏢🏢👨‍💼 API FROM FRONTEND IS ARRIVED! 🏢👨‍💼");
//     try {
//         const query = `SELECT COUNT(*) AS total_events_count FROM events`;
//         const [events_count] = await db.query(query);
//         console.log("events_count🍕🍕🍕==>", events_count[0]?.total_events_count || 0);
//         res.status(200).json(events_count[0]?.total_events_count || 0);
//     } catch (err) {
//         console.error("Error fetching data:", err);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// })
// // Start the server
// app.listen(PORT, () => {
//     console.log(`🐎🐎🐎 Server is running on http://localhost:${PORT} 🐎🐎🐎`);
// });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const cardRoutes = require("./routes/cards");
const dateRoutes = require("./routes/dates");
const placeRoutes = require("./routes/places");

const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.use("/api", cardRoutes);
app.use("/api", dateRoutes);
app.use("/api", placeRoutes);

app.listen(PORT, () => {
  console.log(`🐎🐎🐎Server running on port ${PORT}🐎🐎🐎`);
});