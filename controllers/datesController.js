const db = require("../config/db");
const axios = require("axios");

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

exports.getDatesDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("req.params.id==>", id);

    const query = `SELECT * FROM decks WHERE deck_date_date = ?;`;

    // Using a parameterized query to prevent SQL injection
    const [events_result] = await db.query(query, [id]);

    console.log("events_result==", events_result);
    res.status(200).json(events_result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getDatesDetailsEnhanced = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("req.params.id==>", id);

    // Get basic deck data
    const query = `SELECT * FROM decks WHERE deck_date_date = ?;`;
    const [events_result] = await db.query(query, [id]);

    console.log("enhanced_events_result==", events_result);
    res.status(200).json(events_result);
  } catch (err) {
    console.error("Error fetching enhanced data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Function to scrape player information
async function scrapePlayerInfo(event_holding_id, deck_ID_var) {
  try {
    // First, get the event result page to find player information
    const eventUrl = `https://players.pokemon-card.com/event_result_detail_search?event_holding_id=${event_holding_id}&offset=0&per_page=100`;

    const response = await axios.get(eventUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Parse the HTML to extract player information
    const html = response.data;

    // Extract player information using regex or HTML parsing
    // This is a simplified example - you'll need to adjust based on actual HTML structure
    const playerNameMatch = html.match(/ユーザー名:\s*([^<]+)/);
    const playerIdMatch = html.match(/プレイヤーID:\s*([^<]+)/);
    const regionMatch = html.match(/【([^】]+)】/);

    return {
      player_name: playerNameMatch ? playerNameMatch[1].trim() : "Unknown",
      player_id: playerIdMatch ? playerIdMatch[1].trim() : "Unknown",
      region: regionMatch ? regionMatch[1].trim() : "Unknown"
    };
  } catch (error) {
    console.error("Error scraping player info:", error);
    return {
      player_name: "Unknown",
      player_id: "Unknown",
      region: "Unknown"
    };
  }
}
