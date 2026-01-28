const express = require("express");
const db = require("../db");
const router = express.Router();

/* VIEW PROFILE */
router.get("/profile/:id", (req, res) => {
  const profileId = req.params.id;
  const loggedUser = req.session.user;

  db.query(
    "SELECT id, name, email, phone, location, title FROM users WHERE id = ?",
    [profileId],
    (err, users) => {
      if (users.length === 0) return res.send("User not found");

      db.query(
        "SELECT skill_name, skill_type, category FROM skills WHERE user_id = ?",
        [profileId],
        (err, skills) => {
          res.render("profile", {
            profile: users[0],
            skills,
            isOwner: loggedUser && loggedUser.id == profileId,
            user: loggedUser
          });
        }
      );
    }
  );
});

/* UPDATE PROFILE INFO */
router.post("/profile/edit", (req, res) => {
  const { name, phone, location, title } = req.body;

  db.query(
    "UPDATE users SET name=?, phone=?, location=?, title=? WHERE id=?",
    [name, phone, location, title, req.session.user.id],
    () => res.redirect("/profile/" + req.session.user.id)
  );
});

/* ADD SKILL */
router.post("/profile/skill/add", (req, res) => {
  const { skill_name, skill_type, category } = req.body;

  db.query(
    "INSERT INTO skills (user_id, skill_name, skill_type, category) VALUES (?, ?, ?, ?)",
    [req.session.user.id, skill_name, skill_type, category],
    () => res.redirect("/profile/" + req.session.user.id)
  );
});
/* delete route */
router.post("/profile/skill/delete/:skill", (req, res) => {
  const skillName = req.params.skill;

  db.query(
    "DELETE FROM skills WHERE user_id=? AND skill_name=?",
    [req.session.user.id, skillName],
    () => res.redirect("/profile/" + req.session.user.id)
  );
});

module.exports = router;