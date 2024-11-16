const express = require("express");
const router = express.Router();
const pool = require("../db/config"); // Import the database pool

router.get("/getdata", async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT *
      FROM ztbl_Servers
    `);

    res.status(200).json(results);
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "Error retrieving data" });
  }
});

module.exports = router;
