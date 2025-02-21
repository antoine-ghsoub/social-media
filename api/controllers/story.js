// controllers/story.js
import { db } from "../connect.js";
import jwt from "jsonwebtoken";

// Get stories for the current user (limited to 4 for now)
export const getStories = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    console.log("getStories – User ID:", userInfo.id);

    const q = `
      SELECT s.*, u.name 
      FROM stories AS s 
      JOIN users AS u ON (u.id = s.userId)
      LEFT JOIN relationships AS r 
        ON (s.userId = r.followedUserId AND r.followerUserId = ?) 
      LIMIT 4
    `;
    db.query(q, [userInfo.id], (err, data) => {
      if (err) {
        console.error("DB query error in getStories:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json(data);
    });
  });
};

// Add a new story (adjusted to match your table schema)
export const addStory = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Log the received data for debugging
    console.log("addStory – Request body:", req.body);
    console.log("addStory – User ID:", userInfo.id);

    // Remove createdAt since the stories table only has `img` and `userId`
    const q = "INSERT INTO stories(`img`, `userId`) VALUES (?)";
    const values = [
      req.body.img, // should be the filename returned from the upload route
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) {
        console.error("DB query error in addStory:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json("Story has been created.");
    });
  });
};

// Delete a story
export const deleteStory = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM stories WHERE `id` = ? AND `userId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) {
        console.error("DB query error in deleteStory:", err);
        return res.status(500).json(err);
      }
      if (data.affectedRows > 0)
        return res.status(200).json("Story has been deleted.");
      return res.status(403).json("You can delete only your story!");
    });
  });
};
