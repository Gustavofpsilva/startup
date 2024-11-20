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

    console.log("Dados carregados:", data); // Verifique os dados retornados

    if (dataError) {
        console.error("Erro ao carregar dados:", dataError);
        return;
    }

    totalData = data || [];
    displayTable();
    atualizarResumos();
}

// Função para atualizar os resumos
function atualizarResumos() {
    const totalRecordsElem = document.getElementById("total-records");
    const averageCO2Elem = document.getElementById("average-co2");
    const co2ProducedElem = document.getElementById("co2-produced");
    const co2CompensatedElem = document.getElementById("co2-compensated");

    if (totalRecordsElem) {
        totalRecordsElem.innerText = totalData.length;
    }

    // Calcular média de CO2
    if (averageCO2Elem) {
        const totalCO2 = totalData.reduce((acc, d) => acc + parseInt(d.co2), 0);
        const averageCO2 = totalCO2 / totalData.length;
        averageCO2Elem.innerText = averageCO2.toFixed(2);
    }

    // Quantidade de CO2 produzido
    if (co2ProducedElem) {
        const totalCO2Produced = totalData.reduce((acc, d) => acc + parseInt(d.quantidade_co2_produzida), 0);
        co2ProducedElem.innerText = totalCO2Produced.toFixed(2);
    }

    // Quantidade de CO2 compensado
    if (co2CompensatedElem) {
        const totalCO2Compensated = totalData.reduce((acc, d) => acc + parseInt(d.quantidade_co2_compensada), 0);
        co2CompensatedElem.innerText = totalCO2Compensated.toFixed(2);
    }

    // Média de SO2, MP e NOx
    calcularMediaPorIndicador();
}

// Função para calcular a média de SO2, MP e NOx
function calcularMediaPorIndicador() {
    const indicators = ["so2", "mp", "nox"];
    let output = "<h3>Média de Indicadores:</h3><ul>";

    indicators.forEach(indicator => {
        const total = totalData.reduce((acc, d) => acc + parseInt(d[indicator]), 0);
        const average = total / totalData.length;
        output += `<li>${indicator.toUpperCase()}: ${average.toFixed(2)}</li>`;
    });

    output += "</ul>";
    document.getElementById("summary-content").innerHTML += output;
}

// Função para calcular e mostrar as tendências
function calcularTendencias() {
    const trends = {
        co2: calcularTendencia(totalData.map(d => d.co2)),
        mp: calcularTendencia(totalData.map(d => d.mp)),
        so2: calcularTendencia(totalData.map(d => d.so2)),
        nox: calcularTendencia(totalData.map(d => d.nox))
    };

    // Exibir as tendências
    let output = "<h3>Tendências:</h3><ul>";
    for (const [key, value] of Object.entries(trends)) {
        output += `<li>${key.toUpperCase()}: ${value}</li>`;
    }
    output += "</ul>";
    document.getElementById("summary-content").innerHTML += output;
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
            <td>${item.co2} ppm</td>
            <td>${item.mp} μg/m³</td>
            <td>${item.so2} ppb</td>
            <td>${item.nox} ppb</td>
            <td>${item.quantidade_co2_produzida} kg</td>
            <td>${item.quantidade_co2_compensada} kg</td>
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
    doc.text("Relatório de Dados Ambientais", 10, 10);
    doc.text(`Período: ${startDate} a ${endDate}`, 10, 20);
    data.forEach((item, index) => {
        let y = 30 + index * 10;
        doc.text(`${item.data_hora}: ${item.localizacao} - CO2: ${item.co2} ppm, MP: ${item.mp} μg/m³`, 10, y);
    });

    doc.save("relatorio_dados_ambientais.pdf");
});

// Carregar os dados iniciais ao carregar a página
window.onload = carregarDadosResumos;
