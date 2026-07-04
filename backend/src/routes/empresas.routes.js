const { Router } = require("express");
const empresasController = require("../controllers/empresas.controller");
const { requireAuth } = require("../middlewares/auth");

const router = Router();

router.get("/", empresasController.listar);
router.get("/:id", empresasController.buscarPorId);
router.post("/", requireAuth, empresasController.criar);
router.put("/:id", requireAuth, empresasController.atualizar);
router.delete("/:id", requireAuth, empresasController.remover);

module.exports = router;
