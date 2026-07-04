const express = require("express");
const cors = require("cors");
const session = require("express-session");

const routes = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// CORS liberado para o front-end (Vite), com suporte a cookies
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Sessão em cookie: guarda o usuarioId autenticado no servidor,
// o cliente recebe apenas um id de sessão assinado no cookie "aladin.sid".
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
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
    },
  })
);

app.use("/api", routes);

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

// Tratamento central de erros (deve ser o último middleware)
app.use(errorHandler);

module.exports = app;
