// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis de controle de paginação
const rowsPerPage = 50;
let currentPage = 1;
let totalData = [];

// Função para exibir o nome do usuário
async function exibirNomeUsuario() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("Erro ao obter usuário:", error);
        return;
    }
    const userNameElem = document.getElementById("user-name");
    if (userNameElem) {
        userNameElem.innerText = user.email;
    }
}

// Função para atualizar os valores dos cartões de estatísticas
function atualizarEstatisticas(dados) {
    const tempValue = document.getElementById("temp-value");
    const humidadeValue = document.getElementById("humidade-value");
    const qualidadeArValue = document.getElementById("qualidade-ar-value");
    const localizacaoValue = document.getElementById("localizacao-value");

    if (!tempValue || !humidadeValue || !qualidadeArValue || !localizacaoValue) return;

    const ultimoDado = dados[0]; // Utiliza o dado mais recente
    tempValue.innerText = ultimoDado.temperatura || '--';
    humidadeValue.innerText = ultimoDado.umidade || '--';
    qualidadeArValue.innerText = ultimoDado.qualidade_ar || '--';
    localizacaoValue.innerText = ultimoDado.localizacao || '--';
}

// Função para atualizar a última atualização dos dados
function atualizarUltimaAtualizacao() {
    const agora = new Date();
    const dataFormatada = agora.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    const ultimaAtualizacaoElem = document.getElementById("ultima-atualizacao");
    if (ultimaAtualizacaoElem) {
        ultimaAtualizacaoElem.textContent = `Última Atualização: ${dataFormatada}`;
    }
}

// Função para carregar dados ambientais associados ao usuário
async function carregarDadosAmbientais() {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Carregando dados ambientais para o usuário:", user.id);
    const { data, error } = await supabase
        .from('dados_ambientais')
        .select('*')
        .eq('user_id', user.id)
        .order('data_hora', { ascending: false });

    if (error) {
        console.error("Erro ao carregar dados:", error);
        const statusElem = document.getElementById("status");
        if (statusElem) statusElem.innerText = "Erro ao carregar dados ambientais.";
        return;
    }

    if (!data || data.length === 0) {
        const statusElem = document.getElementById("status");
        if (statusElem) statusElem.innerText = "Nenhum dado ambiental disponível.";
        return;
    }

    totalData = data;
    atualizarEstatisticas(totalData);
    displayTable();
    atualizarUltimaAtualizacao(); // Atualiza a última atualização após carregar os dados
}

// Função para exibir a tabela com paginação
function displayTable() {
    const tableBody = document.getElementById("dados-tabela-corpo");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = totalData.slice(start, end);

    paginatedData.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${new Date(item.data_hora).toLocaleString()}</td>
            <td>${item.localizacao}</td>
            <td>${item.temperatura}°C</td>
            <td>${item.umidade}%</td>
            <td>${item.qualidade_ar}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("page-info").innerText = `Página ${currentPage} de ${Math.ceil(totalData.length / rowsPerPage)}`;
}

// Funções de navegação de página
function nextPage() {
    if ((currentPage * rowsPerPage) < totalData.length) {
        currentPage++;
        displayTable();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTable();
    }
}

// Função para exportar dados para PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text('Dados Ambientais', 14, 10);
    doc.autoTable({
        startY: 20,
        head: [['Data', 'Localização', 'Temperatura (°C)', 'Umidade (%)', 'Qualidade do Ar']],
        body: totalData.map(item => [
            new Date(item.data_hora).toLocaleString(),
            item.localizacao,
            item.temperatura,
            item.umidade,
            item.qualidade_ar
        ])
    });

    doc.save('dados_ambientais.pdf');
}

// Função de logout
async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Erro ao fazer logout:", error);
    } else {
        window.location.href = "index.html";
    }
}

// Função para carregar e processar o arquivo CSV
function processarCSV() {
    const fileInput = document.getElementById("csvFileInput");
    const file = fileInput.files[0];
    const statusElem = document.getElementById("csvStatus");

    if (!file) {
        statusElem.innerText = "Por favor, selecione um arquivo CSV.";
        return;
    }

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const dadosCSV = results.data;
            salvarDadosNoSupabase(dadosCSV);
        },
        error: function(error) {
            console.error("Erro ao processar CSV:", error);
            statusElem.innerText = "Erro ao processar o arquivo CSV.";
        }
    });
}

// Função para salvar os dados no Supabase
async function salvarDadosNoSupabase(dados) {
    const { data: { user } } = await supabase.auth.getUser();
    const statusElem = document.getElementById("csvStatus");

    // Adiciona o ID do usuário a cada dado carregado
    const dadosComUsuario = dados.map(dado => ({
        ...dado,
        user_id: user.id,
        data_hora: new Date().toISOString() // Adiciona a data/hora atual se necessário
    }));

    const { error } = await supabase
        .from('dados_ambientais')
        .insert(dadosComUsuario);

    if (error) {
        console.error("Erro ao salvar dados no Supabase:", error);
        statusElem.innerText = "Erro ao carregar dados no Supabase.";
    } else {
        statusElem.innerText = "Dados carregados com sucesso!";
        fileInput.value = ""; // Limpa o campo de arquivo após o upload
        carregarDadosAmbientais(); // Atualiza os dados na interface
    }
}

// Inicializa o código apenas após o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
    exibirNomeUsuario();
    carregarDadosAmbientais();

    const exportButton = document.getElementById("export-pdf");
    const logoutButton = document.getElementById("logout-button");
    const uploadCsvButton = document.getElementById("uploadCsvButton");

    if (exportButton) {
        exportButton.addEventListener("click", exportToPDF);
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }

    if (uploadCsvButton) {
        uploadCsvButton.addEventListener("click", processarCSV);
    }
});
