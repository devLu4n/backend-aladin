const prisma = require("../config/prisma");

// GET /api/empresas -> pública, lista todas as empresas
async function listar(req, res, next) {
  try {
    const empresas = await prisma.empresa.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { vagas: true } } },
    });
    res.json(empresas);
  } catch (err) {
    next(err);
  }
}

// GET /api/empresas/:id -> pública, detalhe de uma empresa com suas vagas
async function buscarPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: { vagas: true },
    });

    if (!empresa) {
      return res.status(404).json({ erro: "Empresa não encontrada." });
    }

    res.json(empresa);
  } catch (err) {
    next(err);
  }
}

// POST /api/empresas -> privada, cria o perfil de empresa do usuário logado
async function criar(req, res, next) {
  try {
    const { nome, cnpj, descricao, cidade } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: "nome é obrigatório." });
    }

    const empresaExistente = await prisma.empresa.findUnique({
      where: { usuarioId: req.session.usuarioId },
    });
    if (empresaExistente) {
      return res.status(409).json({ erro: "Este usuário já possui uma empresa cadastrada." });
    }

    const empresa = await prisma.empresa.create({
      data: { nome, cnpj, descricao, cidade, usuarioId: req.session.usuarioId },
    });

    res.status(201).json(empresa);
  } catch (err) {
    next(err);
  }
}

// PUT /api/empresas/:id -> privada, somente o dono pode editar
async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const empresa = await prisma.empresa.findUnique({ where: { id } });

    if (!empresa) {
      return res.status(404).json({ erro: "Empresa não encontrada." });
    }
    if (empresa.usuarioId !== req.session.usuarioId) {
      return res.status(403).json({ erro: "Você não tem permissão para editar esta empresa." });
    }

    const { nome, cnpj, descricao, cidade } = req.body;
    const empresaAtualizada = await prisma.empresa.update({
      where: { id },
      data: { nome, cnpj, descricao, cidade },
    });

    res.json(empresaAtualizada);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/empresas/:id -> privada, somente o dono pode excluir
async function remover(req, res, next) {
  try {
    const id = Number(req.params.id);
    const empresa = await prisma.empresa.findUnique({ where: { id } });

    if (!empresa) {
      return res.status(404).json({ erro: "Empresa não encontrada." });
    }
    if (empresa.usuarioId !== req.session.usuarioId) {
      return res.status(403).json({ erro: "Você não tem permissão para excluir esta empresa." });
    }

    await prisma.empresa.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
