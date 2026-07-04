// Middleware central de tratamento de erros.
// Qualquer erro passado para next(err) nos controllers cai aqui.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Erros conhecidos do Prisma (ex: violação de unique constraint)
  if (err.code === "P2002") {
    return res.status(409).json({
      erro: `Já existe um registro com esse valor no campo: ${err.meta?.target}`,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ erro: "Registro não encontrado." });
  }

  const status = err.status || 500;
  const mensagem = err.message || "Erro interno do servidor.";

  res.status(status).json({ erro: mensagem });
}

module.exports = { errorHandler };
