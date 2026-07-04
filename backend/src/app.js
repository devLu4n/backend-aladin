const express = require("express");
const cors = require("cors");
const session = require("express-session");

const routes = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: "aladin.sid",
    secret: process.env.SESSION_SECRET || "dev-secret-troque-em-producao",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota nao encontrada." });
});

app.use(errorHandler);

module.exports = app;
