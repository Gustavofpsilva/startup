// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para carregar os dados ambientais associados ao usuário
async function carregarDadosAmbientais() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        return;
    }

    const { data, error: dataError } = await supabase
        .from('dados_ambientais')
        .select('*')
        .eq('user_id', user.id)
        .order('data_hora', { ascending: false });

    if (dataError) {
        console.error("Erro ao carregar dados ambientais:", dataError);
        return;
    }

    if (!data || data.length === 0) {
        console.log("Nenhum dado ambiental disponível.");
        return;
    }

    console.log("Dados carregados:", data);
    mostrarRecomendacoes(data); // Chama a função para exibir as recomendações
}

// Função para exibir as recomendações em blocos com ícones
function mostrarRecomendacoes(dados) {
    const recomendacoesContainer = document.getElementById("feed-recomendacoes");

    if (!recomendacoesContainer) {
        console.error("Elemento de recomendações não encontrado.");
        return;
    }

    // Limpa o container antes de inserir as novas recomendações
    recomendacoesContainer.innerHTML = "";

    // Calcular a média dos novos indicadores
    const co2Media = dados.reduce((acc, d) => acc + d.co2, 0) / dados.length;
    const mpMedia = dados.reduce((acc, d) => acc + d.mp, 0) / dados.length;
    const so2Media = dados.reduce((acc, d) => acc + d.so2, 0) / dados.length;
    const noxMedia = dados.reduce((acc, d) => acc + d.nox, 0) / dados.length;
    const quantidadeCo2ProduzidaMedia = dados.reduce((acc, d) => acc + d.quantidade_co2_produzida, 0) / dados.length;
    const quantidadeCo2CompensadaMedia = dados.reduce((acc, d) => acc + d.quantidade_co2_compensada, 0) / dados.length;

    // Array para armazenar as recomendações como objetos
    const recomendacoes = [];

    // Gerar recomendações com base no CO2
    if (co2Media > 50) {
        recomendacoes.push({ texto: "A concentração de co² está alta. Considere melhorar a ventilação no ambiente.", icone: "fas fa-cloud" });
    } else {
        recomendacoes.push({ texto: "A concentração de co² está dentro do nível recomendado.", icone: "fas fa-check-circle" });
    }

    // Gerar recomendações com base na MP (material particulado)
    if (mpMedia > 100) {
        recomendacoes.push({ texto: "A concentração de material particulado está elevada. Certifique-se de que os filtros de ar estão funcionando corretamente.", icone: "fas fa-smog" });
    } else {
        recomendacoes.push({ texto: "Os níveis de material particulado estão dentro dos limites aceitáveis.", icone: "fas fa-check-circle" });
    }

    // Gerar recomendações com base no SO2
    if (so2Media > 50) {
        recomendacoes.push({ texto: "A concentração de so² está elevada. Verifique fontes de poluição no ambiente.", icone: "fas fa-cloud-sun" });
    } else {
        recomendacoes.push({ texto: "Os níveis de so² estão dentro dos parâmetros aceitáveis.", icone: "fas fa-check-circle" });
    }

    // Gerar recomendações com base no NOx
    if (noxMedia > 50) {
        recomendacoes.push({ texto: "Os níveis de NOx estão altos. Tente reduzir a emissão de poluentes no ambiente.", icone: "fas fa-exclamation-triangle" });
    } else {
        recomendacoes.push({ texto: "Os níveis de NOx estão dentro dos limites recomendados.", icone: "fas fa-check-circle" });
    }

    // Gerar recomendações com base na quantidade de CO2 produzida
    if (quantidadeCo2ProduzidaMedia > 1000) {
        recomendacoes.push({ texto: "A quantidade de co² produzida está elevada. Considere estratégias para reduzir as emissões.", icone: "fas fa-archive" });
    } else {
        recomendacoes.push({ texto: "A quantidade de co² produzida está dentro dos limites aceitáveis.", icone: "fas fa-check-circle" });
    }

    // Gerar recomendações com base na quantidade de CO2 compensada
    if (quantidadeCo2CompensadaMedia < 100) {
        recomendacoes.push({ texto: "A compensação de co² está abaixo do ideal. Tente aumentar suas ações de compensação de carbono.", icone: "fas fa-leaf" });
    } else {
        recomendacoes.push({ texto: "A compensação de co² está dentro dos limites recomendados.", icone: "fas fa-check-circle" });
    }

    // Renderizar os blocos de recomendação
    recomendacoes.forEach(rec => {
        const bloco = document.createElement("div");
        bloco.classList.add("recomendacao-bloco");

        const icone = document.createElement("i");
        icone.className = rec.icone;

        const texto = document.createElement("p");
        texto.classList.add("recomendacao-texto");
        texto.innerText = rec.texto;

        bloco.appendChild(icone);
        bloco.appendChild(texto);
        recomendacoesContainer.appendChild(bloco);
    });
}

// Função para exportar as recomendações para PDF
function exportarRecomendacoesParaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const recomendacoesContainer = document.getElementById("feed-recomendacoes");
    const recomendacoesTexto = recomendacoesContainer.innerText; // Pega o texto limpo

    if (!recomendacoesTexto) {
        alert("Nenhuma recomendação disponível para exportação.");
        return;
    }

    // Adicionando título no PDF
    doc.text('Recomendações Ambientais', 14, 10);

    // Ajuste de margens, aumentando o espaço vertical
    const marginTop = 20;  // Posição inicial no eixo Y
    const lineHeight = 10; // Distância entre linhas
    const pageHeight = doc.internal.pageSize.height; // Altura da página do PDF

    let currentHeight = marginTop + lineHeight; // Começa da posição inicial

    // Gerando o PDF com as recomendações
    const recomendacoesArr = recomendacoesTexto.split("\n");  // Quebra o texto por linha

    recomendacoesArr.forEach((line, index) => {
        // Verifica se o conteúdo vai ultrapassar a altura da página
        if (currentHeight + lineHeight > pageHeight - 10) {
            doc.addPage(); // Adiciona uma nova página
            currentHeight = marginTop; // Reinicia a posição no eixo Y
        }
        doc.text(line, 14, currentHeight); // Adiciona a linha
        currentHeight += lineHeight; // Ajusta a posição para a próxima linha
    });

    // Salva o PDF com o nome especificado
    doc.save('recomendacoes_ambientais.pdf');
}

// Carregar dados e gerar recomendações ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    carregarDadosAmbientais(); // Carregar dados e exibir recomendações

    // Obter o botão de exportação
    const exportButton = document.getElementById("exportar-recomendacoes");
    if (exportButton) {
        exportButton.addEventListener("click", exportarRecomendacoesParaPDF); // Evento de exportação
    }
});
