import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// export const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

export const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
  if (err) {
    console.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล:", err);
    return;
  }
  console.log("เชื่อมต่อกับฐานข้อมูล MySQL สำเร็จ");
});
