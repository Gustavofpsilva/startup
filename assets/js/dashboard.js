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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
        console.error("Erro ao obter o usuário:", userError);
        return;
    }

    console.log("Carregando dados ambientais para o usuário:", user.id);

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

    totalData = data;

    atualizarEstatisticas(totalData);
    displayTable();
    atualizarUltimaAtualizacao();
    renderCharts();
}

// Função para exibir a tabela
function displayTable() {
    const tableBody = document.getElementById("dados-tabela-corpo");
    if (!tableBody) return;

    tableBody.innerHTML = "";
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

    // Exibir os valores nas seções de estatísticas
    document.getElementById("co2Data").innerText = totalCo2.toFixed(2);
    document.getElementById("mp-value").innerText = totalMp.toFixed(2);
    document.getElementById("so2-value").innerText = totalSo2.toFixed(2);
    document.getElementById("nox-value").innerText = totalNox.toFixed(2);
    document.getElementById("quantidade_co2_produzido").innerText = totalCo2Produzido.toFixed(2);
    document.getElementById("quantidade_co2_compensada").innerText = totalCo2Compensado.toFixed(2);

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
    const ctxCo2 = document.getElementById('chartCo2').getContext('2d');
    const ctxMp = document.getElementById('chartMp').getContext('2d');
    const ctxSo2 = document.getElementById('chartSo2').getContext('2d');

    const labels = totalData.map(item => new Date(item.data_hora).toLocaleString());

    const co2Data = totalData.map(item => item.co2 || 0);
    const mpData = totalData.map(item => item.mp || 0);
    const so2Data = totalData.map(item => item.so2 || 0);

    new Chart(ctxCo2, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'CO2 (ppm)',
                data: co2Data,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    new Chart(ctxMp, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'MP (µg/m³)',
                data: mpData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    new Chart(ctxSo2, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'SO2 (ppm)',
                data: so2Data,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Função para gerar relatório em CSV
function generateCustomReport() {
    if (!totalData || totalData.length === 0) {
        alert("Nenhum dado disponível para gerar o relatório.");
        return;
    }

    const headers = [
        "Data/Hora",
        "Localização",
        "CO2 (ppm)",
        "MP (µg/m³)",
        "SO2 (ppm)",
        "NOx (ppm)",
        "CO2 Produzido (kg)",
        "CO2 Compensado (kg)"
    ];

    const rows = totalData.map(item => [
        item.data_hora ? new Date(item.data_hora).toLocaleString() : '',
        item.localizacao || 'Desconhecido',
        item.co2 || '',
        item.mp || '',
        item.so2 || '',
        item.nox || '',
        item.quantidade_co2_produzida || '',
        item.quantidade_co2_compensada || ''
    ]);

    const csvContent = [headers.join(",")].concat(rows.map(e => e.join(","))).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'relatorio_ambiental.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Chama a função para carregar dados ao carregar a página
window.onload = carregarDadosAmbientais;
