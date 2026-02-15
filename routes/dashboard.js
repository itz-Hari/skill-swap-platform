const express = require("express");
const db = require("../db");
const router = express.Router();

/* =========================
   DASHBOARD PAGE
========================= */
router.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const userId = req.session.user.id;

  // 🔹 Incoming (PENDING only)
  const incomingQuery = `
    SELECT r.*, u.name AS sender_name
    FROM requests r
    JOIN users u ON r.sender_id = u.id
    WHERE r.receiver_id = ?
      AND r.status = 'pending'
    ORDER BY r.id DESC
  `;

  // 🔹 Sent (PENDING only)
  const outgoingQuery = `
    SELECT r.*, u.name AS receiver_name
    FROM requests r
    JOIN users u ON r.receiver_id = u.id
    WHERE r.sender_id = ?
      AND r.status = 'pending'
    ORDER BY r.id DESC
  `;

  // 🔹 Archived (ACCEPTED + REJECTED)
  const archivedQuery = `
    SELECT r.*, 
           us.name AS sender_name,
           ur.name AS receiver_name
    FROM requests r
    JOIN users us ON r.sender_id = us.id
    JOIN users ur ON r.receiver_id = ur.id
    WHERE (r.sender_id = ? OR r.receiver_id = ?)
      AND r.status IN ('accepted', 'rejected')
    ORDER BY r.id DESC
  `;

  db.query(incomingQuery, [userId], (err, incoming) => {
    if (err) throw err;

    db.query(outgoingQuery, [userId], (err, outgoing) => {
      if (err) throw err;

      db.query(archivedQuery, [userId, userId], (err, archived) => {
        if (err) throw err;

        // ✅ THIS IS THE IMPORTANT PART
        res.render("dashboard", {
          user: req.session.user,
          incoming,
          outgoing,
          archived,
          success: req.query.success || null,
          error: req.query.error || null
        });
      });
    });
  });
});

/* =========================
   SEND REQUEST
========================= */
router.post("/request", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const sender_id = req.session.user.id;
  const { receiver_id, skill_offer, skill_need, message } = req.body;

  db.query(
    `INSERT INTO requests 
     (sender_id, receiver_id, skill_offer, skill_need, message, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [sender_id, receiver_id, skill_offer, skill_need, message],
    () => res.redirect("/dashboard?success=Request sent successfully")
  );
});

/* =========================
   ACCEPT REQUEST
========================= */
router.post("/accept/:id", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  db.query(
    `UPDATE requests SET status = 'accepted' WHERE id = ?`,
    [req.params.id],
    () => res.redirect("/dashboard?success=Request accepted")
  );
});

/* =========================
   REJECT REQUEST
========================= */
router.post("/reject/:id", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  db.query(
    `UPDATE requests SET status = 'rejected' WHERE id = ?`,
    [req.params.id],
    () => res.redirect("/dashboard?error=Request rejected")
  );
});

/* =========================
   DELETE SENT REQUEST
========================= */
router.post("/delete/:id", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  db.query(
    "DELETE FROM requests WHERE id = ? AND sender_id = ?",
    [req.params.id, req.session.user.id],
    () => res.redirect("/dashboard?success=Request deleted")
  );
});

module.exports = router;