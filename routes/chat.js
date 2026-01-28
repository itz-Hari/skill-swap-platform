const express = require("express");
const db = require("../db");
const router = express.Router();

/* =========================
   OPEN CHAT PAGE
========================= */
router.get("/:requestId", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const requestId = req.params.requestId;
  const userId = req.session.user.id;

  const requestQuery = `
    SELECT *
    FROM requests
    WHERE id = ?
      AND status = 'accepted'
      AND (sender_id = ? OR receiver_id = ?)
  `;

  db.query(requestQuery, [requestId, userId, userId], (err, reqResult) => {
    if (err) throw err;

    if (!reqResult || reqResult.length === 0) {
      return res.redirect("/dashboard");
    }

    const messagesQuery = `
      SELECT id, sender_id, message, created_at
      FROM messages
      WHERE request_id = ?
      ORDER BY created_at ASC
    `;

    db.query(messagesQuery, [requestId], (err, messages) => {
      if (err) throw err;

      res.render("chat", {
        user: req.session.user,
        requestId,
        messages: messages || []
      });
    });
  });
});

/* =========================
   SEND MESSAGE
========================= */
router.post("/send", (req, res) => {
  if (!req.session.user) return res.sendStatus(401);

  const { request_id, message } = req.body;
  const sender_id = req.session.user.id;

  if (!message || !message.trim()) return res.sendStatus(400);

  db.query(
    `INSERT INTO messages (request_id, sender_id, message)
     VALUES (?, ?, ?)`,
    [request_id, sender_id, message],
    (err) => {
      if (err) throw err;
      res.sendStatus(200);
    }
  );
});

module.exports = router;