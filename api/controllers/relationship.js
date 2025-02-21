import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getRelationships = (req, res) => {
  let q;
  let param;
  if (req.query.followedUserId) {
    q = "SELECT followerUserId FROM relationships WHERE followedUserId = ?";
    param = req.query.followedUserId;
  } else if (req.query.followerUserId) {
    q = "SELECT followedUserId FROM relationships WHERE followerUserId = ?";
    param = req.query.followerUserId;
  } else {
    return res.status(400).json("Missing query parameter.");
  }

  db.query(q, [param], (err, data) => {
    if (err) return res.status(500).json(err);
    const ids = data.map((row) => row.followerUserId || row.followedUserId);
    return res.status(200).json(ids);
  });
};

export const addRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Use INSERT IGNORE to avoid duplicate follows.
    const q =
      "INSERT IGNORE INTO relationships (`followerUserId`, `followedUserId`) VALUES (?, ?)";
    const values = [userInfo.id, req.body.userId];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Following");
    });
  });
};

export const deleteRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";

    db.query(q, [userInfo.id, req.query.userId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Unfollow");
    });
  });
};
