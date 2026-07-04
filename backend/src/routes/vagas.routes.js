const { Router } = require("express");
const vagasController = require("../controllers/vagas.controller");
const { requireAuth } = require("../middlewares/auth");

const router = Router();

router.get("/", vagasController.listar);
router.get("/:id", vagasController.buscarPorId);
router.post("/", requireAuth, vagasController.criar);
router.put("/:id", requireAuth, vagasController.atualizar);
router.delete("/:id", requireAuth, vagasController.remover);

module.exports = router;
