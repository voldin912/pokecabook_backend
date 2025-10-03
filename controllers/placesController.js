const db = require("../config/db");

exports.getPlaces = async (req, res) => {
  console.log("🏢 API FROM FRONTEND IS ARRIVED! 🏢");
  try {
    const { page, pageSize } = req.body;
    const offset = (page - 1) * pageSize;
    const query = `
      WITH filtered_events AS (
        SELECT * FROM events
        ORDER BY id DESC
        LIMIT ${pageSize} OFFSET ${offset}
      ),
      filtered_decks AS (
        SELECT deck_ID_var, event_holding_id FROM decks
        GROUP BY event_holding_id
      )
      SELECT filtered_events.*, filtered_decks.deck_ID_var
      FROM filtered_events
      JOIN filtered_decks ON filtered_events.event_holding_id = filtered_decks.event_holding_id
    `
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

exports.getPlacesDetails = async (req, res) => {
  console.log("🏢🏢👨‍💼 API FROM FRONTEND IS ARRIVED! 🏢👨‍💼");
  try {
    const { id } = req.params;
    const query = `SELECT d.event_holding_id, d.deck_ID_var, d.rank_int, d.point_int FROM decks as d WHERE event_holding_id = ? ORDER BY point_int DESC, id ASC`;
    const [events_result] = await db.query(query);
    console.log('events_result==', events_result);
    res.status(200).json(events_result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
