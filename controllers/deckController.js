const db = require("../config/db");

exports.getDecks = async (req, res) => {
  console.log("🏢 API FROM FRONTEND IS ARRIVED!!!!!!!!!!!!!!! 🏢");
  try {
    const { page, pageSize, filter } = req.body;
    const offset = (page - 1) * pageSize;
    console.log("filter==", filter);

    const cd_query = `
      SELECT conds from deck_categories1 WHERE category1_var = ?
      `
    const [conditions] = await db.query(cd_query,[filter.category])
    const conds = conditions[0].conds.length > 0 ? JSON.parse(conditions[0].conds) : "";

    let having_cond = "";
    let select_cond = "";
    let requiredPairsSQL = "";
    let whereConditions = "";
    if (conds.length > 0) {
        conds.forEach((item,index) => {
            let operator;
            switch(item.cardCondition) {
            case "eql": 
                operator = "=";
                break;
            case "gte":
                operator = ">=";
                break;
            case "lte":
                operator = "<=";
                break;
            case "ueq":
                operator = "!=";
                break;
            default:
                operator = "=";
                break;
            }
            having_cond += ` AND count_val_${index+1} ${operator} ${item.cardNumber}`;
            select_cond += `SUM(CASE WHEN name_var = '${item.cardName}' THEN c.count_int ELSE 0 END) AS count_val_${index+1}`;
            // Append SQL for RequiredPairs table
            requiredPairsSQL += `    SELECT '${item.cardName}' AS name_var, ${item.cardNumber} AS required_count, '${operator}' AS operator`;
            whereConditions += `    (rp.operator = '${operator}' AND dcc.count_int ${operator} rp.required_count)`;

            // Add UNION ALL for all but the last entry
            if (index < conds.length - 1) {
                requiredPairsSQL += " UNION ALL";
                whereConditions += " OR";
            }
        })
    }
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
      RequiredPairs AS (
          ${requiredPairsSQL}
      ),
      DeckCardCounts AS (
          SELECT 
              c.deck_ID_var,
              REPLACE(c.name_var, ' ', '') AS name_var,
              c.count_int,
              COUNT(*) AS pair_count
          FROM cards c
          WHERE EXISTS (
              SELECT 1
              FROM FilteredDecks fd
              WHERE c.deck_ID_var = fd.deck_ID_var
          )
          GROUP BY c.deck_ID_var, REPLACE(c.name_var, ' ', ''), c.count_int
      ),
      FilteredValidDecks AS (
          SELECT dcc.deck_ID_var as deck_id
          FROM DeckCardCounts dcc
          JOIN RequiredPairs rp ON REPLACE(dcc.name_var, ' ', '') = rp.name_var
          WHERE 
              ${whereConditions}
          GROUP BY dcc.deck_ID_var
          HAVING COUNT(DISTINCT dcc.name_var) >= (SELECT COUNT(*) FROM RequiredPairs)
      )
      SELECT d.* from FilteredValidDecks fvd LEFT JOIN decks d on fvd.deck_id = d.deck_ID_var
      ORDER BY d.rank_int DESC
      
    `
    const [decks_result] = await db.query(query, [filter.startDate, filter.endDate, filter.league])
    res.status(200).json(decks_result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getTotalDecks = async (req, res) => {
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

exports.getDecksDetails = async (req, res) => {
  console.log("🏢🏢👨‍💼 API FROM FRONTEND IS ARRIVED! 🏢👨‍💼");
  try {
    const { id } = req.params;
    const query = `SELECT d.event_holding_id, d.deck_ID_var, d.rank_int, d.point_int FROM decks as d WHERE event_holding_id = ${id} ORDER BY point_int DESC, id ASC`;
    const [events_result] = await db.query(query);
    console.log('events_result==', events_result);
    res.status(200).json(events_result);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
