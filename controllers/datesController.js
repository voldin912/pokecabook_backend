const db = require("../config/db");

exports.getEventByDay = async (req, res) => {
  try {
    const query = `
                SELECT 
                    q1.event_date_date, 
                    q1.event_title_var, 
                    q1.deck_ID_var, 
                    q2.event_count
                FROM (
                    SELECT 
                        events.event_date_date, 
                        events.event_title_var, 
                        decks.deck_ID_var
                    FROM events
                    INNER JOIN decks
                        ON events.event_holding_id = decks.event_holding_id
                    GROUP BY events.event_date_date
                ) AS q1
                INNER JOIN (
                    SELECT 
                        event_date_date, 
                        COUNT(*) AS event_count
                    FROM events
                    GROUP BY event_date_date
                ) AS q2
                ON q1.event_date_date = q2.event_date_date
                ORDER BY q1.event_date_date DESC;
    `;

    const [event_per_day_result] = await db.query(query);
    res.status(200).json(event_per_day_result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
