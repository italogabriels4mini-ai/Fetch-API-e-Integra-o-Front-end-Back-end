import { Router, Request, Response } from "express";

// Criando a constante nomeada exatamente como foi importada no app.ts
export const apiRoutes = Router();

// Banco de dados simulado em memória
let filmes = [
  { id: 1, titulo: "Inception", genero: "Ficção", ano: 2010, nota: 9 },
  { id: 2, titulo: "Interestelar", genero: "Ficção", ano: 2014, nota: 9.5 },
  { id: 3, titulo: "O Poderoso Chefão", genero: "Drama", ano: 1972, nota: 10 }
];

// ==========================================
// GET /api/filmes (Como o app.ts já usa "/api", aqui fica só "/filmes")
// ==========================================
apiRoutes.get("/filmes", (req: Request, res: Response) => {
  const { genero } = req.query;
  let filmesFiltrados = filmes;

  if (genero && genero !== "todos") {
    filmesFiltrados = filmes.filter(
      (f) => f.genero.toLowerCase() === String(genero).toLowerCase()
    );
  }

  res.json({
    sucesso: true,
    dados: filmesFiltrados,
    total: filmesFiltrados.length
  });
});

// ==========================================
// POST /api/filmes
// ==========================================
apiRoutes.post("/filmes", (req: Request, res: Response) => {
  // 1. Recebe o diretor vindo do front-end também!
  const { titulo, diretor, genero, ano, nota } = req.body;

  // Validação do Título (Obrigatório)
  if (!titulo || String(titulo).trim() === "") {
    res.status(400).json({ sucesso: false, erro: "O título é obrigatório." });
    return;
  }

  // Validação da Nota
  const notaNum = Number(nota);
  if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
    res.status(400).json({ sucesso: false, erro: "A nota deve ser entre 0 e 10." });
    return;
  }

  // 2. Cria o novo filme incluindo o campo diretor!
  const novoFilme = {
    id: filmes.length > 0 ? Math.max(...filmes.map(f => f.id)) + 1 : 1,
    titulo: String(titulo).trim(),
    diretor: diretor ? String(diretor).trim() : "Não informado", // Adicionado aqui
    genero: genero || "Sem Gênero",
    ano: Number(ano) || new Date().getFullYear(),
    nota: notaNum
  };

  filmes.push(novoFilme);

  res.status(201).json({
    sucesso: true,
    dados: novoFilme
  });
});
// ==========================================
// DELETE /api/filmes/:id
// ==========================================
apiRoutes.delete("/filmes/:id", (req: Request, res: Response) => {
  const idParaRemover = Number(req.params.id);
  const filmeExiste = filmes.some((f) => f.id === idParaRemover);

  if (!filmeExiste) {
    res.status(404).json({ sucesso: false, erro: "Filme não encontrado." });
    return;
  }

  filmes = filmes.filter((f) => f.id !== idParaRemover);
  res.json({ sucesso: true });
});