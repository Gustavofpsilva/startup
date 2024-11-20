// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis globais
let totalData = [];
let currentPage = 1;
const rowsPerPage = 5; // Define o número de linhas por página

// Função para carregar dados ambientais associados ao usuário
async function carregarDadosAmbientais() {
    // Obtém o usuário logado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Erro ao obter o usuário:", userError);
        return;
    }

    console.log("Carregando dados ambientais para o usuário:", user.id);

    // Consulta os dados ambientais no Supabase
    const { data, error } = await supabase
        .from('dados_ambientais')
        .select('*')
        .eq('user_id', user.id)
        .order('data_hora', { ascending: false });

    if (error) {
        console.error("Erro ao carregar dados ambientais:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("Nenhum dado ambiental disponível.");
        return;
    }

    console.log("Dados ambientais carregados:", data);

    // Atualizando a variável totalData com os dados recebidos
    totalData = data;

    // Chamando as funções de exibição dos dados
    atualizarEstatisticas(totalData);
    displayTable();
    atualizarUltimaAtualizacao();
    renderCharts(); // Renderiza os gráficos
}

// Função para exibir a tabela
function displayTable() {
    const tableBody = document.getElementById("dados-tabela-corpo");
    if (!tableBody) return;

    tableBody.innerHTML = ""; // Limpa a tabela antes de atualizar
    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, totalData.length);

    totalData.slice(start, end).forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.data_hora ? new Date(item.data_hora).toLocaleString() : 'Dados indisponíveis'}</td>
            <td>${item.localizacao || 'Desconhecido'}</td>
            <td>${item.co2 !== undefined ? item.co2 + ' ppm' : 'Dados indisponíveis'}</td>
            <td>${item.mp !== undefined ? item.mp + ' µg/m³' : 'Dados indisponíveis'}</td>
            <td>${item.so2 !== undefined ? item.so2 + ' ppm' : 'Dados indisponíveis'}</td>
            <td>${item.nox !== undefined ? item.nox + ' ppm' : 'Dados indisponíveis'}</td>
            <td>${item.quantidade_co2_produzida !== undefined ? item.quantidade_co2_produzida + ' kg' : 'Dados indisponíveis'}</td>
            <td>${item.quantidade_co2_compensada !== undefined ? item.quantidade_co2_compensada + ' kg' : 'Dados indisponíveis'}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("page-info").innerText = `Página ${currentPage} de ${Math.ceil(totalData.length / rowsPerPage)}`;
}


// Função para atualizar estatísticas
function atualizarEstatisticas(data) {
    const totalCo2 = data.reduce((acc, item) => acc + (item.co2 || 0), 0);
    const totalMp = data.reduce((acc, item) => acc + (item.mp || 0), 0);
    const totalSo2 = data.reduce((acc, item) => acc + (item.so2 || 0), 0);
    const totalNox = data.reduce((acc, item) => acc + (item.nox || 0), 0);
    const totalCo2Produzido = data.reduce((acc, item) => acc + (item.quantidade_co2_produzida || 0), 0);
    const totalCo2Compensado = data.reduce((acc, item) => acc + (item.quantidade_co2_compensada || 0), 0);

    console.log("Total de CO2: ", totalCo2);
    console.log("Total de MP: ", totalMp);
    console.log("Total de SO2: ", totalSo2);
    console.log("Total de NOx: ", totalNox);
    console.log("Total de CO2 Produzido: ", totalCo2Produzido);
    console.log("Total de CO2 Compensado: ", totalCo2Compensado);
}

// Função para atualizar a data e hora da última atualização
function atualizarUltimaAtualizacao() {
    const ultimaAtualizacao = new Date().toLocaleString();
    document.getElementById("ultima-atualizacao").innerText = `Última atualização: ${ultimaAtualizacao}`;
}

// Função para renderizar gráficos
function renderCharts() {
    const co2Data = totalData.map(item => item.co2 || 0);
    const mpData = totalData.map(item => item.mp || 0);
    const so2Data = totalData.map(item => item.so2 || 0);
    const noxData = totalData.map(item => item.nox || 0);
    const co2ProduzidoData = totalData.map(item => item.quantidade_co2_produzida || 0);
    const co2CompensadoData = totalData.map(item => item.quantidade_co2_compensada || 0);

    // Gráfico de CO2
    const co2Chart = new Chart(document.getElementById("co2-bar-chart"), {
        type: 'bar',
        data: {
            labels: totalData.map(item => new Date(item.data_hora).toLocaleDateString()),
            datasets: [{
                label: 'CO2 (ppm)',
                data: co2Data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de MP
    const mpChart = new Chart(document.getElementById("mp-bar-chart"), {
        type: 'bar',
        data: {
            labels: totalData.map(item => new Date(item.data_hora).toLocaleDateString()),
            datasets: [{
                label: 'MP (µg/m³)',
                data: mpData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de SO2
    const so2Chart = new Chart(document.getElementById("so2-bar-chart"), {
        type: 'bar',
        data: {
            labels: totalData.map(item => new Date(item.data_hora).toLocaleDateString()),
            datasets: [{
                label: 'SO2 (ppm)',
                data: so2Data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de NOx
    const noxChart = new Chart(document.getElementById("nox-bar-chart"), {
        type: 'bar',
        data: {
            labels: totalData.map(item => new Date(item.data_hora).toLocaleDateString()),
            datasets: [{
                label: 'NOx (ppm)',
                data: noxData,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de CO2 Produzido
    const co2ProduzidoChart = new Chart(document.getElementById("co2-produzido-bar-chart"), {
        type: 'bar',
        data: {
            labels: totalData.map(item => new Date(item.data_hora).toLocaleDateString()),
            datasets: [{
                label: 'CO2 Produzido (kg)',
                data: co2ProduzidoData,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de CO2 Compensado
    const co2CompensadoChart = new Chart(document.getElementById("co2-compensado-bar-chart"), {
        type: 'bar',
        data: {
            labels: totalData.map(item => new Date(item.data_hora).toLocaleDateString()),
            datasets: [{
                label: 'CO2 Compensado (kg)',
                data: co2CompensadoData,
                backgroundColor: 'rgba(153, 255, 51, 0.2)',
                borderColor: 'rgba(153, 255, 51, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Chamando a função inicial
carregarDadosAmbientais();
