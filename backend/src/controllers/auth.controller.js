const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const SALT_ROUNDS = 10;

// Remove a senhaHash antes de devolver o usuário para o cliente
function serializeUsuario(usuario) {
  const { senhaHash, ...resto } = usuario;
  return resto;
}

// POST /api/auth/registro
async function registrar(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "nome, email e senha são obrigatórios." });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const usuario = await prisma.usuario.create({
      data: { nome, email, senhaHash },
    });

    // login automático após o cadastro: guarda o id do usuário na sessão
    req.session.usuarioId = usuario.id;

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso.",
      usuario: serializeUsuario(usuario),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "email e senha são obrigatórios." });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    req.session.usuarioId = usuario.id;

    res.json({
      mensagem: "Login realizado com sucesso.",
      usuario: serializeUsuario(usuario),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("aladin.sid");
    res.json({ mensagem: "Logout realizado com sucesso." });
  });
}

// GET /api/auth/me -> rota privada, exige sessão ativa
async function me(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.session.usuarioId },
      include: { empresa: true },
    });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    res.json({ usuario: serializeUsuario(usuario) });
  } catch (err) {
    next(err);
  }
}

module.exports = { registrar, login, logout, me };
