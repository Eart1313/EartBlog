import { db } from "../db.js";
import jwt from "jsonwebtoken";

export const getPosts = (req, res) => {
  const q = req.query.category
    ? `SELECT posts.id,posts.title,posts.desc,posts.img,posts.date,users.username,posts.uid,category_id, name as category FROM posts
    INNER JOIN post_category
    ON posts.id = post_category.post_id
    INNER JOIN categories
    ON categories.id = post_category.category_id
    INNER JOIN users
    ON users.id = posts.uid
    WHERE name = ?  
    ORDER BY posts.id DESC;
  `
    : `SELECT posts.id,posts.title,posts.desc,posts.img,posts.date,users.username,posts.uid,category_id, name as category FROM posts
    INNER JOIN post_category
    ON posts.id = post_category.post_id
    INNER JOIN categories
    ON categories.id = post_category.category_id
    INNER JOIN users
    ON users.id = posts.uid
    ORDER BY posts.id DESC;
  `;
  db.query(q, [req.query.category], (err, data) => {
    if (err) return res.json(err);

    return res.status(200).json(data);
  });
};

export const getPost = (req, res) => {
  const q = `SELECT posts.id,posts.title,posts.desc,posts.img,posts.date,users.username,posts.uid,category_id,users.img as userImg, name as category FROM posts
  INNER JOIN post_category
  ON posts.id = post_category.post_id
  INNER JOIN categories
  ON categories.id = post_category.category_id
  INNER JOIN users
  ON users.id = posts.uid
  WHERE posts.id = ?
  `;

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.json(err);

    return res.status(200).json(data);
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_TOKEN, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");

    const insertPostQuery = `
      INSERT INTO posts (title, \`desc\`, img, \`date\`, uid) VALUES (?, ?, ?, ?, ?);
    `;

    const insertCategoryQuery = `
      INSERT INTO post_category (category_id, post_id) VALUES (?, ?);
    `;
    if (!req.body.title) {
      res.json({ messege: "please fill title!" });
    }
    if (!req.body.desc) {
      res.json({ messege: "please fill description!" });
    }
    if (!req.body.imgUrl) {
      res.json({ messege: "please upload an image!" });
    }
    if (!req.body.date) {
      res.json({ messege: "please fill date!" });
    }
    if (!req.body.category) {
      res.json({ messege: "please fill date!" });
    }

    db.beginTransaction((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Internal Server Error");
      }

      db.query(
        insertPostQuery,
        [
          req.body.title,
          req.body.desc,
          req.body.imgUrl,
          req.body.date,
          userInfo.id,
        ],
        (err, result) => {
          if (err) {
            console.error(err);
            return db.rollback(() => {
              res.status(400).json(err);
            });
          }

          const postId = result.insertId;

          db.query(
            "SELECT id FROM categories WHERE name = ? LIMIT 1",
            [req.body.category],
            (err, result) => {
              if (err) {
                console.error(err);
                return db.rollback(() => {
                  res.status(400).json(err);
                });
              }

              const categoryId = result[0].id;

              db.query(
                insertCategoryQuery,
                [categoryId, postId],
                (err, result) => {
                  if (err) {
                    console.error(err);
                    return db.rollback(() => {
                      res.status(400).json(err);
                    });
                  }

                  db.commit((err) => {
                    if (err) {
                      console.error(err);
                      return db.rollback(() => {
                        res.status(500).json("Internal Server Error");
                      });
                    }

                    return res.status(200).json("Post has been added!");
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_TOKEN, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");

    const postId = req.params.id;
    const q = "DELETE FROM posts WHERE id = ? AND uid = ?";

    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) return res.status(403).json("You can delete only your post");

      return res.json("Post has been deleted!");
    });
  });
};

export const updatePost = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json("Not authenticated!");

  const q = `UPDATE posts
  SET title = ? , posts.desc = ? , img = ?
  WHERE posts.id = ?`;

  const q2 = `UPDATE post_category 
  SET category_id = ?
  WHERE post_id = ?`;

  db.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json("internal server error");
    }

    db.query(
      q,
      [req.body.title, req.body.desc, req.body.imgUrl, req.params.id],
      (err, data) => {
        if (err) {
          console.log(err);
          return db.rollback(() => {
            res.status(400).json(err);
          });
        }
      }
    );

    //get category id
    db.query(
      `SELECT id FROM categories WHERE name = ?`,
      [req.body.category],
      (err, data) => {
        if (err) {
          console.log(err);
          return db.rollback(() => {
            res.status(400).json("");
          });
        }
        const category_id = data[0].id;

        //insert category in category table
        db.query(q2, [category_id, req.params.id], (err, data) => {
          if (err) {
            console.log(err);
            return db.rollback(() => {
              res.status(400).json(err);
            });
          }
        });
      }
    );

    db.commit((err) => {
      if (err) {
        console.log(err);
        return db.rollback(() => {
          res.status(400).json(err);
        });
      }
      return res.status(200).json("post updated successfully");
    });
  });
};
