const { Router } = require("express");
const empresasController = require("../controllers/empresas.controller");
const { requireAuth } = require("../middlewares/auth");

const router = Router();

router.get("/", empresasController.listar); // pública
router.get("/:id", empresasController.buscarPorId); // pública
router.post("/", requireAuth, empresasController.criar); // privada
router.put("/:id", requireAuth, empresasController.atualizar); // privada
router.delete("/:id", requireAuth, empresasController.remover); // privada

module.exports = router;
