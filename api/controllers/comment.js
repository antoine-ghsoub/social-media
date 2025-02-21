import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

// GET COMMENTS
export const getComments = (req, res) => {
  const q = `
    SELECT 
      c.id, 
      c.descr AS description, 
      c.createdAt, 
      c.userId, 
      u.name AS commenterName, 
      u.profilePic AS commenterPic 
    FROM comments AS c 
    JOIN users AS u ON u.id = c.userId
    WHERE c.postId = ? 
    ORDER BY c.createdAt DESC
  `;
  
  db.query(q, [req.query.postId], (err, data) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};

// ADD COMMENT
export const addComment = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json("Token is not valid!");
    }

    if (!req.body.desc || !req.body.postId) {
      console.error("Missing comment text or postId in request body:", req.body);
      return res.status(400).json("Missing required fields.");
    }

    const q = `
      INSERT INTO comments(\`descr\`, \`createdAt\`, \`userId\`, \`postId\`) 
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      req.body.desc,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
      req.body.postId,
    ];

    db.query(q, values, (err, data) => {
      if (err) {
        console.error("DB query error in addComment:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json("Comment has been created.");
    });
  });
};

// DELETE COMMENT
export const deleteComment = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const commentId = req.params.id;
    const q = "DELETE FROM comments WHERE `id` = ? AND `userId` = ?";

    db.query(q, [commentId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0)
        return res.status(200).json("Comment has been deleted!");
      return res.status(403).json("You can delete only your comment!");
    });
  });
};
