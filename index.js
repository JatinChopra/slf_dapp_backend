const express = require("express");
const app = express();
const PORT = 80;

const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan"); // request logging
const mongoose = require("mongoose"); // database connection

const metaDataModel = require("./db/metaDataModal");
app.use(
  cors({
    origin: [
      "https://slf-git-main-jatinchopras-projects.vercel.app",
      "https://slf-phi.vercel.app",
    ],
    credentials: true, // If you need to send cookies or auth headers
  })
);

require("dotenv").config();

// middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/addmetaData", async (req, res) => {
  let metaData = req.body.metaDataWithDuration;
  console.log(req.body.metaDataWithDuration);
  try {
    let metadata = new metaDataModel(metaData);
    console.log("Prepared metadata");
    console.log(metadata);
    await metadata.save();
    return res.status(200).json({ message: "Data successfully added to db" });
  } catch (e) {
    return res.status(400).json({ message: "Error adding data to db" });
  }
});

app.get("/getmetaData", async (req, res) => {
  let data = await metaDataModel.find();

  const filteredData = data.map((item) => {
    const { animation_url, ...rest } = item.toObject();
    return rest;
  });

  console.log(data);
  return res.status(200).json(filteredData);
});

// Fetch song metadata from database
async function getSongMetadata(songId) {
  return await metaDataModel.findById(songId);
}

app.get("/play/:songId", async (req, res) => {
  const songId = req.params.songId;
  const metadata = await getSongMetadata(songId);
  if (!metadata) return res.status(404).send("Song not found");
  const ipfsURL = metadata.animation_url;

  console.log(req.headers.referer);
  // Check referer
  if (
    !req.headers.referer ||
    !req.headers.referer.includes("slf-phi.vercel.app")
  ) {
    return res.status(403).send("Unauthorized");
  }
  try {
    const response = await axios({
      url: ipfsURL,
      method: "GET",
      responseType: "stream",
      headers: req.headers.range ? { Range: req.headers.range } : {},
    });

    if (req.headers.range) {
      res.status(206);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Range", response.headers["content-range"]);
    } else {
      res.status(200);
    }
    // Set headers to prevent caching
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.setHeader("Content-Security-Policy", "media-src 'self'");
    res.setHeader("Content-Type", response.headers["content-type"]);
    // res.setHeader('Content-Disposition', 'inline; filename="*&().mp3"');
    // res.setHeader('Content-Disposition', 'attachment; filename=""');
    // res.setHeader('Content-Disposition', 'inline' );
    res.setHeader("Content-Disposition", 'inline; filename="file.xyz"');

    res.setHeader("Transfer-Encoding", "chunked");
    res.removeHeader("Content-Length");
    res.removeHeader("Accept-Ranges");
    response.data.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error streaming the file");
  }
});

// connect to db , then start the server
mongoose
  .connect(process.env.DB_URL, { dbName: "nftMusicApp" })
  .then(() => {
    console.log("DB connected");
    app.listen(PORT, () => {
      console.log("server is running");
    });
  })
  .catch((e) => {
    console.log("Error while connecting to DB.");
    console.log(e);
  });
