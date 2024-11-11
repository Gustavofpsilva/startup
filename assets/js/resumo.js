// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis de controle de dados
let totalData = [];
const rowsPerPage = 50;
let currentPage = 1;

// Função para carregar os dados e preencher os resumos
async function carregarDadosResumos() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("Erro ao obter usuário:", error);
        return;
    }

    // Carregar os dados ambientais do banco de dados
    const { data, error: dataError } = await supabase
        .from('dados_ambientais')
        .select('*')
        .eq('user_id', user.id)
        .order('data_hora', { ascending: false });

    if (dataError) {
        console.error("Erro ao carregar dados:", dataError);
        return;
    }

    totalData = data;
    atualizarResumos();
    displayTable();
    atualizarUltimaAtualizacao();
    calcularTendencias();
}

// Função para atualizar os resumos
function atualizarResumos() {
    const totalRecordsElem = document.getElementById("total-records");
    const averagePollutionElem = document.getElementById("average-pollution");
    const anomaliesCountElem = document.getElementById("anomalies-count");

    if (totalRecordsElem) {
        totalRecordsElem.innerText = totalData.length;
    }

    // Calcular média de poluição
    if (averagePollutionElem) {
        const totalPollution = totalData.reduce((acc, d) => acc + parseInt(d.qualidade_ar), 0);
        const averagePollution = totalPollution / totalData.length;
        averagePollutionElem.innerText = averagePollution.toFixed(2);
    }

    // Calcular número de anomalias
    if (anomaliesCountElem) {
        const anomalies = totalData.filter(d => d.qualidade_ar < 30 || d.qualidade_ar > 70);  // Exemplo de anomalia
        anomaliesCountElem.innerText = anomalies.length;
    }

    // Média de Temperatura por Localização
    calcularTemperaturaPorLocalizacao();
}

// Função para calcular a média de temperatura por localização
function calcularTemperaturaPorLocalizacao() {
    const locations = {};
    totalData.forEach(item => {
        if (!locations[item.localizacao]) {
            locations[item.localizacao] = { totalTemp: 0, count: 0 };
        }
        locations[item.localizacao].totalTemp += item.temperatura;
        locations[item.localizacao].count += 1;
    });

    let output = "<h3>Média de Temperatura por Localização:</h3><ul>";
    for (const location in locations) {
        const averageTemp = locations[location].totalTemp / locations[location].count;
        output += `<li>${location}: ${averageTemp.toFixed(2)} °C</li>`;
    }
    output += "</ul>";
    document.getElementById("summary-content").innerHTML += output;
}

// Função para calcular e mostrar as tendências de temperatura e umidade
function calcularTendencias() {
    const temperatures = totalData.map(d => d.temperatura);
    const humidities = totalData.map(d => d.umidade);

    const tempTrend = calcularTendencia(temperatures);
    const humidityTrend = calcularTendencia(humidities);

    // Exibir as tendências
    document.getElementById("summary-content").innerHTML += `
        <p><strong>Tendência de Temperatura:</strong> ${tempTrend}</p>
        <p><strong>Tendência de Umidade:</strong> ${humidityTrend}</p>
    `;
}

// Função para calcular a tendência (simples comparação de aumento ou diminuição)
function calcularTendencia(values) {
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const trend = lastValue - firstValue;

    if (trend > 0) {
        return "Aumento";
    } else if (trend < 0) {
        return "Diminuição";
    } else {
        return "Estável";
    }
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

// Função para gerar o relatório personalizado
document.getElementById("generate-report").addEventListener("click", async () => {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value + "T23:59:59"; // Inclui até o último segundo do dia final
    const selectedMetrics = Array.from(document.getElementById("metrics").selectedOptions).map(opt => opt.value);

    // Validação das entradas
    if (!startDate || !endDate || selectedMetrics.length === 0) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Consultar dados do banco de dados com base no intervalo de datas e métricas selecionadas
    const { data, error } = await supabase
        .from('dados_ambientais')
        .select(['data_hora', 'localizacao', ...selectedMetrics].join(','))
        .gte('data_hora', startDate)
        .lte('data_hora', endDate)
        .order('data_hora', { ascending: true });

    if (error) {
        console.error("Erro ao gerar relatório:", error);
        alert("Erro ao carregar os dados para o relatório.");
        return;
    }

    if (data.length === 0) {
        alert("Nenhum dado encontrado para o intervalo selecionado.");
        return;
    }

    // Gerar o relatório em PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Relatório Personalizado", 14, 10);

    doc.autoTable({
        startY: 20,
        head: [["Data", "Localização", ...selectedMetrics.map(m => m.charAt(0).toUpperCase() + m.slice(1))]],
        body: data.map(d => [
            new Date(d.data_hora).toLocaleString(),
            d.localizacao,
            ...selectedMetrics.map(m => d[m])
        ])
    });

    // Salvar o relatório gerado
    doc.save(`AmbIn_relatorio_personalizado_${new Date().toLocaleDateString()}.pdf`);
});
  
// Função para atualizar a última atualização dos dados
function atualizarUltimaAtualizacao() {
    const agora = new Date();
    const dataFormatada = agora.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    const ultimaAtualizacaoElem = document.getElementById("ultima-atualizacao");
    if (ultimaAtualizacaoElem) {
        ultimaAtualizacaoElem.textContent = `Última Atualização: ${dataFormatada}`;
    }
}

// Inicializa o código apenas após o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
    carregarDadosResumos();

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Erro ao fazer logout:", error);
            } else {
                window.location.href = "index.html";
            }
        });
    }
});
