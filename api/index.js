import express from "express";
import postRouter from "./routes/posts.js";
import authRouterRouter from "./routes/auth.js";
import userRouter from "./routes/users.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://eart-blog-frontend.vercel.app/",
    credentials: true, // allow cookie
  })
);

//localstorage

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "database/");
//   },
//   filename: function (req, file, cb) {
//     const fileName = `${Date.now()}-${file.originalname}`;
//     cb(null, fileName);
//   },
// });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   folder: "Eartblogs",
//   allowedFormats: ["jpg", "png"],
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Eartblogs",
    format: async (req, file) => {
      if (file.mimetype === "image/jpeg") {
        return "jpeg";
      } else if (file.mimetype === "image/png") {
        return "png";
      } else {
        throw new Error("Invalid file format");
      }
    },
    public_id: (req, file) => `${Date.now()}-${uuidv4()}`,
  },
});

const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
const upload = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    const validTypes = ["image/jpeg", "image/png"];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format"));
    }
  },
});

app.post("/api/upload", upload.single("test"), (req, res) => {
  const file = req.file;
  try {
    res.status(200).json({ file });
  } catch (error) {
    console.log(error);
  }
});

//delete img on server
app.delete("/api/delete/:public_id", async (req, res) => {
  const { public_id } = req.params;

  try {
    const response = await cloudinary.uploader.destroy(public_id);

    if (response.result === "ok") {
      res.status(200).json({ message: "Image has been deleted!" });
    } else {
      res.status(400).json({ message: "Image cannot delete!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something wrong!", error });
  }
});

app.use("/api/post", postRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouterRouter);

app.get("/", (req, res) => {
  res.json("hello world ");
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Connected");
});
