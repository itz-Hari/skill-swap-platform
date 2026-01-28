const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const query = `
    SELECT 
      u.id,
      u.name,
      s.skill_name,
      s.skill_type
    FROM users u
    LEFT JOIN skills s ON u.id = s.user_id
  `;

  db.query(query, (err, rows) => {
    if (err) throw err;

    // Group skills by user
    const usersMap = {};

    rows.forEach(row => {
      if (!usersMap[row.id]) {
        usersMap[row.id] = {
          id: row.id,
          name: row.name,
          teach: [],
          learn: []
        };
      }

      if (row.skill_type === "teach") {
        usersMap[row.id].teach.push(row.skill_name);
      }
      if (row.skill_type === "learn") {
        usersMap[row.id].learn.push(row.skill_name);
      }
    });

    res.render("home", {
      user: req.session.user,
      users: Object.values(usersMap)
    });
  });
});

module.exports = router;