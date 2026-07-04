const { Router } = require("express");
const vagasController = require("../controllers/vagas.controller");
const { requireAuth } = require("../middlewares/auth");

const router = Router();

router.get("/", vagasController.listar); // pública
router.get("/:id", vagasController.buscarPorId); // pública
router.post("/", requireAuth, vagasController.criar); // privada
router.put("/:id", requireAuth, vagasController.atualizar); // privada
router.delete("/:id", requireAuth, vagasController.remover); // privada

module.exports = router;
