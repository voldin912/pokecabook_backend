const db = require("../config/db");

exports.getCards = async (req, res) => {
  console.log("⛳ API FROM FRONTEND IS ARRIVED! ⛳");
  try {
    console.log("req.body==>", req.body);

    const { startDate, endDate, league, category } = req.body;

    if (!startDate || !endDate || !league) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const cd_query = `
        SELECT conds from deck_categories1 WHERE category1_var = ?
    `
    const [conditions] = await db.query(cd_query,[category])
    console.log("****conditions", conditions[0])
    const conds = conditions[0].conds.length > 0 ? JSON.parse(conditions[0].conds) : "";
    
    // let where_cond = "";
    // if(conds.length > 0) {
    //     conds.forEach(item => {
    //         switch(item.cardCondition) {
    //             case "eql": 
    //                 where_cond += `AND c.name_var = '${item.cardName}' AND c.count_int = ${item.cardNumber} `
    //                 break;
    //             case "gte":
    //                 where_cond += `AND c.name_var = '${item.cardName}' AND c.count_int >= ${item.cardNumber} `
    //                 break;
    //             case "lte":
    //                 where_cond += `AND c.name_var = '${item.cardName}' AND c.count_int <= ${item.cardNumber} `
    //                 break;
    //             case "ueq":
    //                 where_cond += `AND c.name_var = '${item.cardName}' AND c.count_int != ${item.cardNumber} `
    //                 break;
    //             default:
    //                 break;
    //         }
    //     })
    // }

    let having_cond = "";
    if (conds.length > 0) {
        conds.forEach(item => {
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
            having_cond += ` AND (REPLACE(name_var, ' ', '') = '${item.cardName}' AND SUM(c.count_int) ${operator} ${item.cardNumber})`;
        });
    }

    // FilteredCardsByCategory AS (
    //     SELECT c.*
    //     FROM cards c
    //     WHERE EXISTS (
    //         SELECT 1
    //         FROM FilteredDecks fd
    //         WHERE c.deck_ID_var = fd.deck_ID_var
    //     )
    //     ${where_cond}
    // ),
    // where_cond = where_cond == "" ? "true" : where_cond;
    // console.log("****where_cond", where_cond)
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
            SELECT 
                c.deck_ID_var,
                c.category_int,
                c.image_var,
                REPLACE(c.name_var, ' ', '') AS name_var,
                SUM(c.count_int) AS total_count
            FROM cards c
            WHERE EXISTS (
                SELECT 1
                FROM FilteredDecks fd
                WHERE c.deck_ID_var = fd.deck_ID_var
            )
            GROUP BY c.deck_ID_var, c.category_int, c.image_var, REPLACE(c.name_var, ' ', '')
            HAVING 1=1
            ${having_cond}
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
                REPLACE(name_var, ' ', '') AS name_var,
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
                GROUP_CONCAT(cc.count_frequency ORDER BY cc.count_int ASC) AS counts_array
            FROM CardCounts cc
            JOIN CardTotals ct ON cc.name_var = ct.name_var
            GROUP BY cc.name_var
        )
        SELECT
            category_int,
            image_var,
            name_var,
            count_array AS COUNT,
            counts_array
        FROM FinalResults;
    `;
    console.log(query)

    const [rows] = await db.query(query, [startDate, endDate, league]);
    
    const events_count_query = `
                SELECT COUNT(*) AS total_events_count
                FROM events
                WHERE event_date_date BETWEEN ? AND ?;
            `;
    
            const events_count = await db.query(events_count_query, [startDate, endDate, league]);
            const filtered_events_count = events_count[0][0]?.total_events_count || 0;
            
            // console.log("😀😀😀😀filtered_events_count==>", filtered_events_count);
            
            const decks_count_query = `
                SELECT COUNT(*) AS total_decks_count
                FROM decks
                WHERE deck_date_date BETWEEN ? AND ?;
            `
    
            const [decks_count] = await db.query(decks_count_query, [startDate, endDate]);
            const filtered_decks_count = decks_count[0]?.total_decks_count || 0;
    
            // console.log("decks_count==>", filtered_decks_count);
    
            const specific_decks_count_query = `
                WITH FilteredEvents AS (
                    SELECT id, event_holding_id
                    FROM events
                    WHERE event_date_date BETWEEN ? AND ?
                    AND event_league_int = ?
                ),
                FilteredDecks AS (
                    SELECT d.deck_ID_var
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
                    AND c.count_int > 1
                ),
                RelatedDecks AS (
                    SELECT DISTINCT d.event_holding_id, d.place_var, d.deck_ID_var
                    FROM decks d
                    JOIN FilteredCardsByCategory fc ON d.deck_ID_var = fc.deck_ID_var
                )
                SELECT COUNT(*) AS specific_count FROM RelatedDecks	
            `;
    
            const [specific_decks_count] = await db.query(specific_decks_count_query, [startDate, endDate, league, category]);
            const filtered_specific_decks_count = specific_decks_count[0]?.specific_count || 0;
            
            // console.log("specific_decks_count==>", filtered_specific_decks_count);
    
    res.status(200).json({ rows, filtered_events_count, filtered_decks_count, filtered_specific_decks_count });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCardCategories = async (req, res) => {
  try {
    const query = `SELECT * FROM deck_categories1`;
    const [deck_categories1] = await db.query(query);
    res.status(200).json(deck_categories1);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getAll = async (req, res) => {
    try {
        const query = `SELECT * FROM cards`;
        const [cards] = await db.query(query);
        res.status(200).json(cards)
    } catch (err) {
        console.error("error cards:", err);
        res.status(500).json({ message : "Internal Server error", error : err.message})
    }
}