const { Router } = require("express");

const authRoutes = require("./auth.routes");
const empresasRoutes = require("./empresas.routes");
const vagasRoutes = require("./vagas.routes");

const router = Router();

router.get("/", (req, res) => {
  res.json({ mensagem: "API do Aladin no ar" });
});

router.use("/auth", authRoutes);
router.use("/empresas", empresasRoutes);
router.use("/vagas", vagasRoutes);

module.exports = router;
