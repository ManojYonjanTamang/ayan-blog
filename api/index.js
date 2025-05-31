const express = require("express");
const app = express();
app.use(express.json());
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs");
const Post = require("./models/Post");
const cors = require("cors");
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use('/uploads', express.static(__dirname + '/uploads'));

const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const secret = "fdfwerdvfdg3423efertr34trfdfr2e";

const mongoose = require("mongoose");
console.log("Attempting to connect to MongoDB...");
mongoose.connect(
  "mongodb+srv://blog:0qp5wExVE2ZEwYi6@cluster0.8ovkv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
).then(() => {
  console.log("Successfully connected to MongoDB!");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

const User = require("./models/User");
const { spawn } = require('child_process');
const path = require('path');

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
  const userDoc = await User.findOne({ username });
    if (!userDoc) {
      res.status(400).json("User not found");
      return;
    }

  const passwordOk = bcrypt.compareSync(password, userDoc.password);
  if (passwordOk) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.cookie("token", token).json({
          username,
          id: userDoc._id,
        });
      }
    });
  } else {
    res.status(400).json("Invalid credentials");
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

app.get("/profile", async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, decoded) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.json(decoded);
    }
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});


app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
  const {originalname,path} = req.file;
  const parts = originalname.split(".");
  const extension = parts[parts.length - 1];
    newPath = path + "." + extension;
  fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, decoded) => {
    if (err) {
      res.status(400).json(err);
      return;
    } 

    const {title, summary, content} = req.body;
    try {
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: decoded.id,
      });
      const populatedPost = await Post.findById(postDoc._id).populate('author', ['username']);
      res.json(populatedPost);
    } catch (err) {
      res.status(400).json(err);
    }
  });
});

app.get("/post", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20);
    res.json(posts);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.get('/post/:id', async(req, res) => {
  const {id} = req.params;
  try {
    const postDoc = await Post.findById(id).populate('author', ['username']);
    if (!postDoc) {
      res.status(404).json('Post not found');
      return;
    }
    res.json(postDoc);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.post("/transcribe", async (req, res) => {
  const { url, improve } = req.body;
  if (!url) {
    res.status(400).json("URL is required");
    return;
  }

  try {
    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'video_to_text', 'video_to_text.py'),
      url,
      improve ? '--improve' : ''
    ]);

    let transcription = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      transcription += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        res.status(500).json({ error: error || 'Transcription failed' });
        return;
      }
      
      console.log("Python script output:", transcription); // Debug log
      
      // Extract the transcription and title from the output
      const transcriptMatch = transcription.match(/Original transcription:\n([\s\S]*?)(?:\nImproved transcription:|$)/);
      const improvedMatch = transcription.match(/Improved transcription:\n([\s\S]*?)(?:\n===VIDEO_TITLE_START===|$)/);
      
      // Extract title using the new markers
      const titleMatch = transcription.match(/===VIDEO_TITLE_START===\n([\s\S]*?)\n===VIDEO_TITLE_END===/);
      
      console.log("Title match:", titleMatch); // Debug log
      
      const result = {
        title: titleMatch ? titleMatch[1].trim() : 'Transcribed Video',
        original: transcriptMatch ? transcriptMatch[1].trim() : '',
        improved: improvedMatch ? improvedMatch[1].trim() : null
      };
      
      console.log("Sending response:", result); // Debug log
      res.json(result);
    });
  } catch (err) {
    console.error("API error:", err); // Debug log
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});