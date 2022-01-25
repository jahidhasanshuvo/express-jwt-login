import express from "express";
import jwt from "jsonwebtoken";
import env from "dotenv";

////////// config //////////
const app = express();
env.config();
app.use(express.json());
const PORT = 4000;

//////////////////////// database ////////////////
const posts = ["post 1", "post 2"];
const users = [
  {
    username: "demo",
    email: "demo@gmail.com",
    password: "1234",
  },
  {
    username: "test",
    email: "test@gmail.com",
    password: "1234",
  },
];
const refresh_token = [];
///////////////////////// helpers ///////////////////
function authentatication(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function generateAccessToken(data) {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 20 });
}

///////////////////////// api endpoint ///////////////////////

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = users.filter((x) => x.username == username)[0]?.password;
  if (password == req.body.password) {
    const token = generateAccessToken({ username: username });

    const refreshToken = jwt.sign(
      { username: username },
      process.env.REFRESH_TOKEN_SECRET
    );
    refresh_token.push(refreshToken);
    return res.json({ access_token: token, refresh_token: refreshToken });
  } else {
    return res.sendStatus(401);
  }
});

app.get("/posts", authentatication, (req, res) => {
  return res.json({ posts: posts });
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  if (!refresh_token.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
    return res.json({
      access_token: generateAccessToken({ user: user.username }),
    });
  });
  return res.sendStatus(403);
});

app.listen(PORT, () => {
  console.log("working");
});
