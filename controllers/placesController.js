const db = require("../config/db");

exports.getPlaces = async (req, res) => {
  console.log("🏢 API FROM FRONTEND IS ARRIVED! 🏢");
  try {
    const { page, pageSize } = req.body;
    const offset = (page - 1) * pageSize;
    const query = `
        SELECT 
            e.event_holding_id, 
            e.event_date_date, 
            e.event_title_var, 
            e.event_place_var, 
            d.deck_ID_var
        FROM events AS e
        LEFT JOIN decks AS d
            ON e.event_holding_id = d.event_holding_id
        GROUP BY e.event_place_var
        ORDER BY e.id
        LIMIT ${pageSize} OFFSET ${offset};
    `;
    const [events_result] = await db.query(query);
    res.status(200).json(events_result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getTotalPlaces = async (req, res) => {
  console.log("🏢🏢👨‍💼 API FROM FRONTEND IS ARRIVED! 🏢👨‍💼");
  try {
    const query = `SELECT COUNT(*) AS total_events_count FROM events`;
    const [events_count] = await db.query(query);
    res.status(200).json(events_count[0]?.total_events_count || 0);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
