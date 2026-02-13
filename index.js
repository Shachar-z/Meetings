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

// הרצת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
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

// --- סעיף 2.ג: הוספת פגישה חדשה ---
app.post("/api/meetings", (req, res) => {
  // הנתונים מגיעים בגוף הבקשה (Body)
  const { team_id, start_time, end_time, description, room_name } = req.body;

  const sql = `
        INSERT INTO meetings (team_id, start_time, end_time, description, room_name)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [team_id, start_time, end_time, description, room_name],
    (err, result) => {
      if (err) {
        console.error("Error adding meeting:", err);
        res.status(500).send("Error adding meeting");
      } else {
        // מחזירים את ה-ID של הפגישה החדשה שנוצרה
        res
          .status(201)
          .json({ message: "Meeting added!", id: result.insertId });
      }
    },
  );
});
