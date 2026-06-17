// ============================================================
// 🔍 CONFIGURAÇÃO DOS NOVOS ELEMENTOS (TODO 19 e 20)
// ============================================================
let timeoutBusca = null; // Guarda o timer do debounce

// Criar o indicador de "Carregando..." dinamicamente na tela
const spinner = document.createElement("div");
spinner.id = "loading-spinner";
spinner.innerHTML = "⏳ Carregando filmes...";
spinner.style.display = "none"; // Começa escondido
spinner.style.textAlign = "center";
spinner.style.margin = "10px 0";
spinner.style.color = "#3498db";
spinner.style.fontWeight = "bold";

// Insere o spinner logo acima da lista de filmes assim que a página carrega
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("lista-filmes") || document.getElementById("lista");
  if (container && container.parentNode) {
    container.parentNode.insertBefore(spinner, container);
  }
  
  // Adiciona o evento de busca por texto no input do professor (geralmente inp-busca ou busca)
  const inputBusca = document.getElementById("inp-busca") || document.getElementById("busca");
  if (inputBusca) {
    inputBusca.addEventListener("input", (e) => {
      filtrarComDebounce(e.target.value);
    });
  }
});

// ============================================================
// 🎯 TODO 7 & 19: fetch GET — carregarFilmes(genero, termoBusca)
// Exibir "Carregando..." enquanto o fetch está em andamento.
// ============================================================
async function carregarFilmes(genero = "", termoBusca = "") {
  try {
    // 19. EXIBIR O SPINNER (Começou o Fetch)
    spinner.style.display = "block";

    // Monta a URL base
    let url = "/api/filmes?";
    
    if (genero && genero !== "todos") {
      url += `genero=${encodeURIComponent(genero)}&`;
    }
    if (termoBusca) {
      url += `busca=${encodeURIComponent(termoBusca)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Erro ao buscar os filmes no servidor.");
    }

    const json = await response.json();
    
    if (json.sucesso) {
      exibirFilmes(json.dados);
      exibirTotal(json.total);
    }
  } catch (error) {
    console.error("Erro no carregamento:", error);
  } finally {
    // 19. OCULTAR O SPINNER (Terminou o Fetch, dando certo ou errado!)
    spinner.style.display = "none";
  }
}

// ============================================================
// 🎯 TODO 20: Busca por texto com Debounce de 300ms
// ============================================================
function filtrarComDebounce(termo) {
  // Limpa o timer anterior se o usuário continuar digitando rápido
  clearTimeout(timeoutBusca);

  // Define um novo timer de 300 milissegundos
  timeoutBusca = setTimeout(() => {
    const generoAtual = document.getElementById("filtro-genero")?.value || "";
    carregarFilmes(generoAtual, termo);
  }, 3000); // 300ms
}

// ============================================================
// 🎯 TODO 8: Exibir filmes no DOM
// ============================================================
function exibirFilmes(filmes) {
  const container = document.getElementById("lista-filmes") || document.getElementById("lista"); 
  if (!container) return;

  if (filmes.length === 0) {
    container.innerHTML = `<p class="aviso-vazio">Nenhum filme encontrado.</p>`;
    return;
  }

  container.innerHTML = filmes.map(filme => `
    <div class="card-filme">
      <h3>${filme.titulo}</h3>
      <p><strong>Gênero:</strong> ${filme.genero}</p>
      <p><strong>Ano:</strong> ${filme.ano}</p>
      <p><strong>Nota:</strong> <span class="badge-nota">${filme.nota}/10</span></p>
      <button class="btn-remover" onclick="deletar(${filme.id})">Remover</button>
    </div>
  `).join("");
}

function exibirTotal(total) {
  const elementoTotal = document.getElementById("total-filmes") || document.getElementById("total");
  if (elementoTotal) {
    elementoTotal.textContent = total;
  }
}

// ============================================================
// 🎯 TODO 9: fetch POST — criarFilme(event)
// ============================================================
async function criarFilme(event) {
  event.preventDefault();
  
  try {
    const titulo = document.getElementById("inp-titulo").value;
    const diretor = document.getElementById("inp-diretor")?.value || ""; 
    const ano = document.getElementById("inp-ano").value;
    const genero = document.getElementById("inp-genero").value;
    const nota = document.getElementById("inp-nota").value;

    const dadosFilme = { titulo, diretor, genero, ano, nota };

    const response = await fetch("/api/filmes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosFilme)
    });

    const json = await response.json();

    if (response.ok && json.sucesso) {
      event.target.reset();
      const generoAtual = document.getElementById("filtro-genero")?.value || "";
      const inputBusca = document.getElementById("inp-busca") || document.getElementById("busca");
      carregarFilmes(generoAtual, inputBusca?.value || "");
    } else {
      alert(`Erro: ${json.erro || "Falha ao cadastrar o filme."}`);
    }
  } catch (error) {
    console.error("Erro no cadastro:", error);
    alert("Erro na comunicação com o servidor.");
  }
}

// ============================================================
// 🎯 TODO 10: fetch DELETE — deletar(id)
// ============================================================
async function deletar(id) {
  const confirmar = confirm("Tem certeza que deseja remover este filme?");
  if (!confirmar) return;

  try {
    const response = await fetch(`/api/filmes/${id}`, {
      method: "DELETE"
    });

    const json = await response.json();

    if (response.ok && json.sucesso) {
      const generoAtual = document.getElementById("filtro-genero")?.value || "";
      const inputBusca = document.getElementById("inp-busca") || document.getElementById("busca");
      carregarFilmes(generoAtual, inputBusca?.value || "");
    } else {
      alert(`Erro: ${json.erro || "Não foi possível remover o filme."}`);
    }
  } catch (error) {
    console.error("Erro ao deletar:", error);
    alert("Erro na comunicação com o servidor.");
  }
}

// ============================================================
// 🎯 TODO 11: filtrar por gênero
// ============================================================
function filtrar() {
  const genero = document.getElementById("filtro-genero").value;
  const inputBusca = document.getElementById("inp-busca") || document.getElementById("busca");
  carregarFilmes(genero, inputBusca?.value || "");
}

// Carregar ao abrir
carregarFilmes();

// Vincula o formulário de envio ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-filme");
  if (form) {
    form.addEventListener("submit", criarFilme);
  }
});