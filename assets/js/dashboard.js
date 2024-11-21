// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis globais
let totalData = [];
let currentPage = 1;
const rowsPerPage = 20; // Define o número de linhas por página

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
    renderCombinedChart(totalData);  // Adicionando o gráfico combinado aqui
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
    // Exibindo apenas o último valor de cada indicador
    const lastItem = data[0]; // Assume que os dados estão ordenados pela data, então pegamos o primeiro item

    document.getElementById("co2Data").innerText = lastItem.co2 !== undefined ? lastItem.co2 + ' ppm' : 'Dados indisponíveis';
    document.getElementById("mp-value").innerText = lastItem.mp !== undefined ? lastItem.mp + ' µg/m³' : 'Dados indisponíveis';
    document.getElementById("so2-value").innerText = lastItem.so2 !== undefined ? lastItem.so2 + ' ppm' : 'Dados indisponíveis';
    document.getElementById("nox-value").innerText = lastItem.nox !== undefined ? lastItem.nox + ' ppm' : 'Dados indisponíveis';
    document.getElementById("quantidade_co2_produzido").innerText = lastItem.quantidade_co2_produzida !== undefined ? lastItem.quantidade_co2_produzida + ' kg' : 'Dados indisponíveis';
    document.getElementById("quantidade_co2_compensada").innerText = lastItem.quantidade_co2_compensada !== undefined ? lastItem.quantidade_co2_compensada + ' kg' : 'Dados indisponíveis';
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
                label: 'co² (ppm)',
                data: co2Data,
                backgroundColor: 'rgba(118, 13, 51, 1)',
                borderColor: 'transparent',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        display: false // Remove o grid do eixo X
                    }
                },
                y: {
                    grid: {
                        display: false // Remove o grid do eixo Y
                    },
                    beginAtZero: true
                }
            }
        }
    });

    new Chart(ctxMp, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'mp (µg/m³)',
                data: mpData,
                backgroundColor: 'rgba(28, 55, 168, 1)',
                borderColor: 'transparent',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        display: false // Remove o grid do eixo X
                    }
                },
                y: {
                    grid: {
                        display: false // Remove o grid do eixo Y
                    },
                    beginAtZero: true
                }
            }
        }
    });

    new Chart(ctxSo2, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'so² (ppm)',
                data: so2Data,
                backgroundColor: 'rgba(234, 155, 33, 1)',
                borderColor: 'transparent',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        display: false // Remove o grid do eixo X
                    }
                },
                y: {
                    grid: {
                        display: false // Remove o grid do eixo Y
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Função para renderizar gráficos combinados (Temperatura, Umidade, Qualidade do Ar)
function renderCombinedChart(data) {
    if (data.length === 0) return; // Verifica se há dados

    const ctx = document.getElementById("combinedChart").getContext("2d");
    ctx.canvas.style.backgroundColor = "white"; // Fundo branco
    new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(d => new Date(d.data_hora).toLocaleString()), // Eixo X
            datasets: [
                {
                    label: "co²",
                    data: data.map(d => d.co2 ),
                    borderColor: "rgba(118, 13, 51, 1)",
                    backgroundColor: "transparent",
                    fill: true,
                    tension: 0.8,
                },
                {
                    label: "mp",
                    data: data.map(d => d.mp),
                    borderColor: "rgba(28, 55, 168, 1)",
                    backgroundColor: "transparent",
                    fill: true,
                    tension: 0.8,
                },
                {
                    label: "so²",
                    data: data.map(d => parseInt(d.so2 )), // Supondo que seja um número
                    borderColor: "rgba(234, 155, 33, 1)",
                    backgroundColor: "transparent",
                    fill: true,
                    tension: 0.8,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
            scales: {
                x: {
                    type: "category",
                    labels: data.map(d => new Date(d.data_hora).toLocaleString()),
                    grid: {
                        display: false // Remove o grid do eixo X
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false // Remove o grid do eixo Y
                    }
                },
            },
        },
    });
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;  // Decrementa a página atual
        displayTable();  // Atualiza a tabela ou conteúdo
    }
}
// Navegação entre páginas
function navegarPagina(pagina) {
    currentPage = pagina;
    displayTable();
}

// Função para navegar entre as páginas
function changePage(direction) {
    if (direction === 'next') {
        if (currentPage * rowsPerPage < totalData.length) {
            currentPage++;
        }
    } else if (direction === 'previous') {
        if (currentPage > 1) {
            currentPage--;
        }
    }
    displayTable();
}

// Função para gerar o relatório em CSV
function gerarRelatorioPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título do relatório
    doc.text('Relatório de Dados Ambientais', 14, 10);

    // Cabeçalhos da tabela
    const headers = ['Data/Hora', 'Localização', 'co² (ppm)', 'mp (µg/m³)', 'so² (ppm)', 'nox (ppm)', 'co² Produzido (kg)', 'co² Compensado (kg)'];
    let yPosition = 20;

    // Adiciona os cabeçalhos da tabela
    doc.autoTable({
        startY: yPosition,
        head: [headers],
        body: totalData.map(item => [
            item.data_hora ? new Date(item.data_hora).toLocaleString() : 'Dados indisponíveis',
            item.localizacao || 'Desconhecido',
            item.co2 !== undefined ? item.co2 + ' ppm' : 'Dados indisponíveis',
            item.mp !== undefined ? item.mp + ' µg/m³' : 'Dados indisponíveis',
            item.so2 !== undefined ? item.so2 + ' ppm' : 'Dados indisponíveis',
            item.nox !== undefined ? item.nox + ' ppm' : 'Dados indisponíveis',
            item.quantidade_co2_produzida !== undefined ? item.quantidade_co2_produzida + ' kg' : 'Dados indisponíveis',
            item.quantidade_co2_compensada !== undefined ? item.quantidade_co2_compensada + ' kg' : 'Dados indisponíveis'
        ]),
        margin: { top: 20, bottom: 20 },
        theme: 'grid', // Estilo de tabela com linhas
        tableWidth: 'auto'
    });

    // Gerar o download do PDF
    doc.save('relatorio_AmbIn.pdf');
}

// Chama a função para carregar dados ao carregar a página
window.onload = carregarDadosAmbientais;
