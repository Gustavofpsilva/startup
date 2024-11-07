// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis de controle de paginação
const rowsPerPage = 50;
let currentPage = 1;
let totalData = [];

// Função para exibir o nome e o e-mail do usuário na sidebar
async function exibirNomeUsuario() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("Erro ao obter usuário:", error);
        return;
    }

    const userNameElem = document.getElementById("sidebar-user-name");
    const userEmailElem = document.getElementById("sidebar-user-email");

    if (userNameElem && userEmailElem) {
        userNameElem.innerText = user.user_metadata.full_name || "Usuário";
        userEmailElem.innerText = user.email;
    }
}

// Função para atualizar os valores dos cartões de estatísticas
function atualizarEstatisticas(dados) {
    const tempValue = document.getElementById("temp-value");
    const humidadeValue = document.getElementById("humidade-value");
    const qualidadeArValue = document.getElementById("qualidade-ar-value");
    const localizacaoValue = document.getElementById("localizacao-value");

    // Verifica se todos os elementos de estatísticas estão presentes
    if (!tempValue || !humidadeValue || !qualidadeArValue || !localizacaoValue) {
        console.warn("Elementos de estatísticas não encontrados na página.");
        return;
    }

    if (dados.length > 0) {
        const ultimoDado = dados[0];
        tempValue.innerText = `${ultimoDado.temperatura}`;
        humidadeValue.innerText = `${ultimoDado.umidade}`;
        qualidadeArValue.innerText = ultimoDado.qualidade_ar;
        localizacaoValue.innerText = ultimoDado.localizacao;
    }
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
        return;
    }

    if (!data || data.length === 0) {
        console.log("Nenhum dado ambiental disponível.");
        return;
    }

    console.log("Dados carregados:", data);
    totalData = data;
    atualizarEstatisticas(totalData);
    displayTable();
    atualizarUltimaAtualizacao();
    renderCharts();
}

// Função para exibir a tabela com paginação
function displayTable() {
    const tableBody = document.getElementById("dados-tabela-corpo");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, totalData.length);

    totalData.slice(start, end).forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${new Date(item.data_hora).toLocaleString()}</td>
            <td>${item.localizacao}</td>
            <td>${item.temperatura} °C</td>
            <td>${item.umidade} %</td>
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

// Função para carregar dados do CSV
async function carregarCSV() {
    const input = document.getElementById("csv");
    const file = input.files[0];
    const loadingIndicator = document.getElementById("loading-indicator");

    if (!file) {
        alert("Por favor, selecione um arquivo CSV.");
        return;
    }

    // Mostra o indicador de carregamento
    loadingIndicator.style.display = "block";

    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target.result;
        const rows = text.split("\n").map(row => row.split(","));

        try {
            for (let i = 1; i < rows.length; i++) {
                const [data_hora, localizacao, temperatura, umidade, qualidade_ar] = rows[i].map(item => item.trim());
                const dataValida = new Date(data_hora);
                if (isNaN(dataValida.getTime())) {
                    console.error("Data inválida:", data_hora);
                    continue;
                }

                const { error } = await supabase
                    .from('dados_ambientais')
                    .insert([{ 
                        user_id: (await supabase.auth.getUser()).data.user.id,
                        data_hora: dataValida.toISOString(),
                        localizacao,
                        temperatura: parseFloat(temperatura),
                        umidade: parseFloat(umidade),
                        qualidade_ar: parseInt(qualidade_ar)
                    }]);

                if (error) {
                    console.error("Erro ao inserir dados:", error);
                } else {
                    console.log("Dados inseridos com sucesso:", { data_hora, localizacao, temperatura, umidade, qualidade_ar });
                }
            }

            await carregarDadosAmbientais();

        } catch (error) {
            console.error("Erro ao processar CSV:", error);
        } finally {
            // Esconde o indicador de carregamento, independentemente do sucesso ou falha
            loadingIndicator.style.display = "none";
        }
    };

    reader.readAsText(file);
}

// Função para renderizar os gráficos
function renderCharts() {
    renderCombinedChart(totalData);
    renderBarChart(totalData);
    renderRadarChart(totalData);
    renderBubbleChart(totalData);
}

// Função para renderizar o gráfico combinado de linhas
function renderCombinedChart(data) {
    if (data.length === 0) return;
    const ctx = document.getElementById("combinedChart").getContext("2d");

    ctx.canvas.style.backgroundColor = "white";

    new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(d => new Date(d.data_hora).toLocaleDateString()),
            datasets: [
                {
                    label: "Temperatura",
                    data: data.map(d => d.temperatura),
                    borderColor: "rgba(50,68,139, 1)",
                    backgroundColor: "rgba(50,68,139, 0.1)",
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: "Umidade",
                    data: data.map(d => d.umidade),
                    borderColor: "rgba(92,10,39, 1)",
                    backgroundColor: "rgba(92,10,39, 0.1)",
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: "Qualidade do Ar",
                    data: data.map(d => parseInt(d.qualidade_ar)),
                    borderColor: "rgba(235,156,32, 1)",
                    backgroundColor: "rgba(235,156,32, 0.1)",
                    fill: true,
                    tension: 0.4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    ticks: { maxTicksLimit: 10 },
                    grid: { display: false } // Remove as linhas de grade horizontais
                },
                y: { 
                    suggestedMin: 0,
                    suggestedMax: 100,
                    beginAtZero: true,
                    grid: { display: false } // Remove as linhas de grade verticais
                }
            },
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Função para renderizar o gráfico de barras
function renderBarChart(data) {
    if (data.length === 0) return;
    const ctx = document.getElementById("barChart").getContext("2d");
    ctx.canvas.style.backgroundColor = "white";

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.map(d => new Date(d.data_hora).toLocaleDateString()),
            datasets: [
                { label: "Temperatura", data: data.map(d => d.temperatura), backgroundColor: "rgba(50,68,139, 0.6)" },
                { label: "Umidade", data: data.map(d => d.umidade), backgroundColor: "rgba(92,10,39, 0.6)" },
                { label: "Qualidade do Ar", data: data.map(d => parseInt(d.qualidade_ar)), backgroundColor: "rgba(235,156,32, 0.6)" }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    ticks: { maxTicksLimit: 10 },
                    grid: { display: false } // Remove as linhas de grade horizontais
                },
                y: { 
                    suggestedMin: 0,
                    suggestedMax: 100,
                    beginAtZero: true,
                    grid: { display: false } // Remove as linhas de grade verticais
                }
            },
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Função para renderizar o gráfico de radar
function renderRadarChart(data) {
    if (data.length === 0) return;
    const ctx = document.getElementById("radarChart").getContext("2d");
    ctx.canvas.style.backgroundColor = "white";

    new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["Temperatura", "Umidade", "Qualidade do Ar"],
            datasets: [{
                label: "Média dos Dados",
                data: [
                    data.reduce((acc, d) => acc + d.temperatura, 0) / data.length,
                    data.reduce((acc, d) => acc + d.umidade, 0) / data.length,
                    data.reduce((acc, d) => acc + parseInt(d.qualidade_ar), 0) / data.length
                ],
                backgroundColor: "rgba(92,10,39, 0.6)",
                borderColor: "rgba(92,10,39, 1)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: { 
                    suggestedMin: 0, 
                    suggestedMax: 100,
                    grid: { display: false } // Remove as linhas de grade do gráfico de radar
                }
            }
        }
    });
}

// Função para renderizar o gráfico de bolha
function renderBubbleChart(data) {
    if (data.length === 0) return;
    const bubbleChartCtx = document.getElementById("bubbleChart").getContext("2d");
    bubbleChartCtx.canvas.style.backgroundColor = "white";

    const bubbleData = data.map(d => ({
        x: d.umidade,
        y: d.temperatura,
        r: parseInt(d.qualidade_ar) / 60
    }));

    new Chart(bubbleChartCtx, {
        type: "bubble",
        data: {
            datasets: [{
                label: "Dados Ambientais",
                data: bubbleData,
                backgroundColor: "rgba(235,156,32, 0.6)",
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    title: { display: true, text: "Umidade (%)" },
                    grid: { display: false } // Remove as linhas de grade horizontais
                },
                y: { 
                    title: { display: true, text: "Temperatura (°C)" },
                    grid: { display: false } // Remove as linhas de grade verticais
                }
            },
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Inicializa o código apenas após o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
    exibirNomeUsuario();
    carregarDadosAmbientais();

    const exportButton = document.getElementById("export-pdf");
    const logoutButton = document.getElementById("logout-button");
    const csvInput = document.getElementById("csv");

    if (exportButton) exportButton.addEventListener("click", exportToPDF);
    if (logoutButton) logoutButton.addEventListener("click", logoutUser);
    if (csvInput) csvInput.addEventListener("change", carregarCSV);
});
