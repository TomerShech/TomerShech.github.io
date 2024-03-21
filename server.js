const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const db = require("better-sqlite3")("word-list.db", { fileMustExist: true });
db.pragma("journal_mode = WAL");

app.use(cors());
app.use(express.json());

app.get("/random-word", (req, res) => {
  const randomWord = db
    .prepare(
      "SELECT * FROM words WHERE NOT(already_guessed) AND id IN (SELECT id FROM words ORDER BY RANDOM() LIMIT 1)"
    )
    .get();

  console.log(randomWord);
});

app.post("/check-word", (req, res) => {
  const { word } = req.body;
  const row = db
    .prepare("SELECT * FROM words WHERE NOT(already_guessed) AND entry = ?")
    .get(word);

  if (!row) {
    return res.status(404).json({ error: "אינני מכיר מילה זו." });
  }

  return res.status(200).json(row);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

process.on("exit", () => db.close());
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
