const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const db = require('./db'); // Import database connection

const app = express();
const PORT = 5000;

// Middleware
// app.use(cors());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
})); // Adjust the origin as needed
app.use(bodyParser.json()); // Parse JSON bodies

// Routes
// GET request: Fetch all data
// app.post('/api/cards', async (req, res) => {
//     try {
//         console.log("req.body==>", req.body);

//         const { league, startDate, endDate } = req.body;

//         // Start building the SQL query
//         let query = 'SELECT * FROM cards_cards WHERE 1=1'; // 1=1 is a way to ensure the query is always valid.

//         const queryParams = [];

//         // Filter by league if provided
//         if (league) {
//             query += ' AND league = ?';
//             queryParams.push(league);
//         }

//         // Filter by startDate if provided
//         if (startDate) {
//             query += ' AND date >= ?';
//             queryParams.push(startDate);
//         }

//         // Filter by endDate if provided
//         if (endDate) {
//             query += ' AND date <= ?';
//             queryParams.push(endDate);
//         }

//         // Execute the query with the dynamically built conditions
//         const rows = await db.query(query, queryParams);
//         console.log("rows==>", rows);

//         res.json(rows); // Send the filtered data as the response

//     } catch (err) {
//         console.error('Error fetching data:', err);
//         res.status(500).json({ message: 'Database error' });
//     }
// });



// app.get('api/cards', async (req, res) => {
//     try {
//         return res.status(200)
//     } catch (e) {
//         console.error('Error fetching data:', e);

//     }
// })

app.post('/api/cards', async (req, res) => {
    try {
        console.log("here======>")
        // Extract startDate, endDate, and league from the request body
        const { startDate, endDate, league } = req.body;

        // Ensure the required parameters are provided
        if (!startDate || !endDate || !league) {
            return res.status(400).json({ message: 'Missing required parameters' });
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
        console.log("rows====>", rows)
        // Respond with the filtered data
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Database error' });
    }
});


// PUT request: Update user data
// app.put('/api/users/:id', async (req, res) => {
//     const { id } = req.params;
//     const { name, email } = req.body;

//     if (!name || !email) {
//         return res.status(400).json({ message: 'Name and email are required' });
//     }

//     try {
//         const [result] = await db.query(
//             'UPDATE users SET name = ?, email = ? WHERE id = ?',
//             [name, email, id]
//         );

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         res.json({ message: 'User updated successfully' });
//     } catch (err) {
//         console.error('Error updating data:', err);
//         res.status(500).json({ message: 'Database error' });
//     }
// });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
