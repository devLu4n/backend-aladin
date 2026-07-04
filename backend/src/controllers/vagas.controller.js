const prisma = require("../config/prisma");

const MODALIDADES_VALIDAS = ["REMOTO", "HIBRIDO", "PRESENCIAL"];

// GET /api/vagas -> pública, lista vagas com filtros e busca (fluxo principal)
async function listar(req, res, next) {
  try {
    const { area, cidade, modalidade, busca, page = 1, limit = 10 } = req.query;

    const where = {
      status: "ABERTA",
      ...(area && { area: { equals: String(area), mode: "insensitive" } }),
      ...(cidade && { cidade: { contains: String(cidade), mode: "insensitive" } }),
      ...(modalidade && { modalidade: String(modalidade).toUpperCase() }),
      ...(busca && {
        OR: [
          { titulo: { contains: String(busca), mode: "insensitive" } },
          { tecnologias: { contains: String(busca), mode: "insensitive" } },
        ],
      }),
    };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const [vagas, total] = await Promise.all([
      prisma.vaga.findMany({
        where,
        include: { empresa: { select: { id: true, nome: true, cidade: true } } },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.vaga.count({ where }),
    ]);

    res.json({
      dados: vagas,
      paginacao: { total, page: pageNum, limit: limitNum, totalPaginas: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/vagas/:id -> pública, detalhe de uma vaga
async function buscarPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const vaga = await prisma.vaga.findUnique({
      where: { id },
      include: { empresa: true },
    });

    if (!vaga) {
      return res.status(404).json({ erro: "Vaga não encontrada." });
    }

    res.json(vaga);
  } catch (err) {
    next(err);
  }
}

// POST /api/vagas -> privada, cria vaga vinculada à empresa do usuário logado
async function criar(req, res, next) {
  try {
    const { titulo, descricao, area, cidade, modalidade, tecnologias, salarioMin, salarioMax } = req.body;

    if (!titulo || !descricao || !area || !cidade) {
      return res.status(400).json({ erro: "titulo, descricao, area e cidade são obrigatórios." });
    }
    if (modalidade && !MODALIDADES_VALIDAS.includes(String(modalidade).toUpperCase())) {
      return res.status(400).json({ erro: `modalidade deve ser uma das: ${MODALIDADES_VALIDAS.join(", ")}` });
    }

    const empresa = await prisma.empresa.findUnique({ where: { usuarioId: req.session.usuarioId } });
    if (!empresa) {
      return res.status(400).json({
        erro: "Você precisa cadastrar uma empresa (POST /api/empresas) antes de publicar vagas.",
      });
    }

    const vaga = await prisma.vaga.create({
      data: {
        titulo,
        descricao,
        area,
        cidade,
        modalidade: modalidade ? String(modalidade).toUpperCase() : undefined,
        tecnologias: tecnologias || "",
        salarioMin: salarioMin ? Number(salarioMin) : null,
        salarioMax: salarioMax ? Number(salarioMax) : null,
        empresaId: empresa.id,
      },
    });

    res.status(201).json(vaga);
  } catch (err) {
    next(err);
  }
}

// PUT /api/vagas/:id -> privada, somente a empresa dona da vaga pode editar
async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const vaga = await prisma.vaga.findUnique({ where: { id }, include: { empresa: true } });

    if (!vaga) {
      return res.status(404).json({ erro: "Vaga não encontrada." });
    }
    if (vaga.empresa.usuarioId !== req.session.usuarioId) {
      return res.status(403).json({ erro: "Você não tem permissão para editar esta vaga." });
    }

    const { titulo, descricao, area, cidade, modalidade, tecnologias, salarioMin, salarioMax, status } = req.body;
    if (modalidade && !MODALIDADES_VALIDAS.includes(String(modalidade).toUpperCase())) {
      return res.status(400).json({ erro: `modalidade deve ser uma das: ${MODALIDADES_VALIDAS.join(", ")}` });
    }

    const vagaAtualizada = await prisma.vaga.update({
      where: { id },
      data: {
        titulo,
        descricao,
        area,
        cidade,
        modalidade: modalidade ? String(modalidade).toUpperCase() : undefined,
        tecnologias,
        salarioMin: salarioMin !== undefined ? Number(salarioMin) : undefined,
        salarioMax: salarioMax !== undefined ? Number(salarioMax) : undefined,
        status: status ? String(status).toUpperCase() : undefined,
      },
    });

    res.json(vagaAtualizada);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/vagas/:id -> privada, somente a empresa dona da vaga pode excluir
async function remover(req, res, next) {
  try {
    const id = Number(req.params.id);
    const vaga = await prisma.vaga.findUnique({ where: { id }, include: { empresa: true } });

    if (!vaga) {
      return res.status(404).json({ erro: "Vaga não encontrada." });
    }
    if (vaga.empresa.usuarioId !== req.session.usuarioId) {
      return res.status(403).json({ erro: "Você não tem permissão para excluir esta vaga." });
    }

    await prisma.vaga.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
