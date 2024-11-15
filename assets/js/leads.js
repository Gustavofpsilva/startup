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

    // Calcular a média de temperatura e umidade
    const umidadeMedia = dados.reduce((acc, d) => acc + d.umidade, 0) / dados.length;
    const temperaturaMedia = dados.reduce((acc, d) => acc + d.temperatura, 0) / dados.length;

    // Array para armazenar as recomendações como objetos
    const recomendacoes = [];

    // Gerar recomendações com base na umidade
    if (umidadeMedia < 40) {
        recomendacoes.push({ texto: "A umidade está abaixo do ideal. Considere usar umidificadores para melhorar o conforto.", icone: "fas fa-tint" });
    } else if (umidadeMedia > 70) {
        recomendacoes.push({ texto: "A umidade está alta. Verifique se há problemas de ventilação ou se há necessidade de desumidificadores.", icone: "fas fa-fan" });
    } else {
        recomendacoes.push({ texto: "A umidade está no intervalo ideal. Continue monitorando para garantir que se mantenha estável.", icone: "fas fa-check-circle" });
    }

    // Gerar recomendações com base na temperatura
    if (temperaturaMedia > 30) {
        recomendacoes.push({ texto: "A temperatura média está acima do recomendado. Considere ajustar a climatização ou melhorar a ventilação.", icone: "fas fa-thermometer-full" });
    } else if (temperaturaMedia < 18) {
        recomendacoes.push({ texto: "A temperatura está muito baixa. Verifique se há necessidade de aquecimento adicional no ambiente.", icone: "fas fa-thermometer-empty" });
    } else {
        recomendacoes.push({ texto: "A temperatura está dentro da faixa recomendada para conforto.", icone: "fas fa-check-circle" });
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
