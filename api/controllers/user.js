import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  const userId = req.params.userId;
  console.log("GET /users/find/", userId); // <-- Debug log

  const q = "SELECT * FROM users WHERE id=?";

  db.query(q, [userId], (err, data) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json(err);
    }
    console.log("Query result:", data); // <-- Debug log

    if (!data.length) return res.status(404).json("User not found!");
    const { password, ...info } = data[0];
    return res.json(info);
  });
};

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Query order: name, city, website, profilePic, coverPic, id
    const q =
      "UPDATE users SET `name`=?, `city`=?, `website`=?, `profilePic`=?, `coverPic`=? WHERE id=? ";

    db.query(
      q,
      [
        req.body.name,
        req.body.city,
        req.body.website,
        req.body.profilePic,
        req.body.coverPic,
        userInfo.id,
      ],
      (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.affectedRows > 0) return res.json("Updated!");
        return res.status(403).json("You can update only your account!");
      }
    );
  });
};

export const searchUsers = (req, res) => {
  const searchQuery = "%" + req.query.query + "%";
  const q = "SELECT id, name, username, profilePic FROM users WHERE name LIKE ? OR username LIKE ?";
  db.query(q, [searchQuery, searchQuery], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

