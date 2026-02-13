const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// 1. הגדרת החיבור למסד הנתונים
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "root", // <--- שים כאן את הסיסמה שבחרת בהתקנה!
  database: "company_meetings",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// בדיקה שהחיבור עובד
db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to MySQL database!");
    connection.release();
  }
});

// --- Routes (נתיבים) ---

// סעיף 2.א: החזרת כל קבוצות הפיתוח
app.get("/api/teams", (req, res) => {
  const sql = "SELECT * FROM development_teams";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching teams:", err);
      res.status(500).send("Error fetching teams");
    } else {
      res.json(results);
    }
  });
});

// --- סעיף 2.ב: החזרת כל הפגישות של קבוצה לפי קוד קבוצה ---
app.get("/api/meetings/:teamId", (req, res) => {
  // :teamId הוא פרמטר דינמי שנקבל מהכתובת
  const teamId = req.params.teamId;
  const sql = "SELECT * FROM meetings WHERE team_id = ?";

  db.query(sql, [teamId], (err, results) => {
    if (err) {
      console.error("Error fetching meetings:", err);
      res.status(500).send("Error fetching meetings");
    } else {
      res.json(results);
    }
  });
});

// --- סעיף 2.ג + בונוס: הוספת פגישה חדשה עם בדיקת חפיפה ---
// --- גרסה מתוקנת לדיבאג: הוספת פגישה עם בדיקת חפיפה ---
app.post("/api/meetings", (req, res) => {
let { team_id, start_time, end_time, description, room_name } = req.body;

    // --- התיקון הקריטי מתחיל כאן ---
    // הסרת האות T והחלפתה ברווח, כדי ש-MySQL יבין שזה תאריך ושעה
    // (React שולח: "2026-02-13T10:00", MySQL רוצה: "2026-02-13 10:00")
    if (start_time) start_time = start_time.replace('T', ' ');
    if (end_time) end_time = end_time.replace('T', ' ');
    // --- התיקון מסתיים כאן ---

    console.log("----- DEBUG -----");
    console.log("Checking Time for SQL:", start_time, "->", end_time); 
    // עכשיו תוכלי לראות בטרמינל בדיוק מה נשלח לבדיקה

    const checkSql = `
        SELECT * FROM meetings 
        WHERE team_id = ? 
        AND start_time < ? 
        AND end_time > ?
    `;
  // הערה: סדר הפרמטרים קריטי! [team_id, end_time, start_time]
  db.query(
    checkSql,
    [team_id, end_time, start_time],
    (checkErr, checkResults) => {
      if (checkErr) {
        console.error("SQL Error during check:", checkErr);
        return res.status(500).send("Error checking conflicts");
      }

      console.log("Conflicts found (number of meetings):", checkResults.length);

      // אם המערך לא ריק - סימן שמצאנו פגישה חופפת
      if (checkResults.length > 0) {
        console.log("CONFLICT DETECTED! Rejecting request.");
        return res.status(409).json({
          message: "CONFLICT: This team already has a meeting at this time!",
        });
      }

      console.log("No conflict. Saving meeting...");

      // אם אין חפיפה - שומרים
      const insertSql = `
            INSERT INTO meetings (team_id, start_time, end_time, description, room_name)
            VALUES (?, ?, ?, ?, ?)
        `;

      db.query(
        insertSql,
        [team_id, start_time, end_time, description, room_name],
        (insertErr, result) => {
          if (insertErr) {
            console.error("SQL Error during insert:", insertErr);
            res.status(500).send("Error adding meeting");
          } else {
            console.log("Meeting saved successfully! ID:", result.insertId);
            res
              .status(201)
              .json({ message: "Meeting added!", id: result.insertId });
          }
        },
      );
    },
  );
});

// הרצת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
