const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "company_meetings",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to MySQL database!");
    connection.release();
  }
});

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

app.get("/api/meetings/:teamId", (req, res) => {
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

app.post("/api/meetings", (req, res) => {
let { team_id, start_time, end_time, description, room_name } = req.body;

    if (start_time) start_time = start_time.replace('T', ' ');
    if (end_time) end_time = end_time.replace('T', ' ');
    console.log("----- DEBUG -----");
    console.log("Checking Time for SQL:", start_time, "->", end_time); 

    const checkSql = `
        SELECT * FROM meetings 
        WHERE team_id = ? 
        AND start_time < ? 
        AND end_time > ?
    `;
  db.query(
    checkSql,
    [team_id, end_time, start_time],
    (checkErr, checkResults) => {
      if (checkErr) {
        console.error("SQL Error during check:", checkErr);
        return res.status(500).send("Error checking conflicts");
      }

      console.log("Conflicts found (number of meetings):", checkResults.length);

      if (checkResults.length > 0) {
        console.log("CONFLICT DETECTED! Rejecting request.");
        return res.status(409).json({
          message: "CONFLICT: This team already has a meeting at this time!",
        });
      }

      console.log("No conflict. Saving meeting...");

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
