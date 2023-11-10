import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  //Check Exist User
  const checkQuery = "SELECT * FROM users WHERE email = ? or username = ?";

  db.query(checkQuery, [req.body.email, req.body.username], (err, data) => {
    if (err) {
      return res.json(err);
    }

    if (data.length) {
      return res.status(409).json("User or email already exists!");
    }

    // Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const insertQuery =
      "INSERT INTO users(`username`,`email`,`password`) VALUES (?,?,?)";
    const values = [req.body.username, req.body.email, hash];
    db.query(insertQuery, values, (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json("User has been created.");
    });
  });
};

export const login = (req, res) => {
  //check user
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) return res.status(404).json("User not found");

    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Wrong username or password!");

    const token = jwt.sign({ id: data[0].id }, process.env.JWT_TOKEN);
    const { password, ...other } = data[0];

    res
      .cookie("token", token, {
        sameSite: "None",
        secure: true,
        maxAge: 900000,
        httpOnly: true,
      })
      .status(200)
      .json(other);
  });
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    // sameSite: "None",
    secure: true,
    maxAge: 900000,
    httpOnly: true,
  });
  res.json("User has been logout.");
};
