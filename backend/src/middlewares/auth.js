// Middleware que protege rotas privadas.
// Verifica se existe um usuário logado guardado na sessão (cookie).
function requireAuth(req, res, next) {
  if (!req.session || !req.session.usuarioId) {
    return res.status(401).json({ erro: "Não autenticado. Faça login para continuar." });
  }
  next();
}

module.exports = { requireAuth };
