// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis de controle de paginação
const rowsPerPage = 50;
let currentPage = 1;
let totalData = [];

// Função para registrar o login do usuário na tabela de logins
async function registrarLogin(userId) {
    const { error } = await supabase
        .from('logins')
        .insert([{ user_id: userId, data_hora: new Date().toISOString() }]);

    if (error) {
        console.error("Erro ao registrar o login:", error);
    } else {
        console.log("Login registrado com sucesso.");
    }
}

// Função de autenticação do usuário e registro do login
async function loginUser(email, password) {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error("Erro ao autenticar usuário:", error);
        return;
    }

    if (user) {
        // Registrar o login após autenticação bem-sucedida
        await registrarLogin(user.id);
        // Redirecionar para a página principal do app
        window.location.href = "dashboard.html"; // Ajuste o caminho conforme necessário
    }
}

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
    const co2Value = document.getElementById("co2-value");
    const mpValue = document.getElementById("mp-value");
    const so2Value = document.getElementById("so2-value");
    const noxValue = document.getElementById("nox-value");
    const co2ProduzidoValue = document.getElementById("co2-produzido-value");
    const co2CompensadoValue = document.getElementById("co2-compensado-value");
    const localizacaoValue = document.getElementById("localizacao-value");

    if (!co2Value || !mpValue || !so2Value || !noxValue || !co2ProduzidoValue || !co2CompensadoValue || !localizacaoValue) {
        console.warn("Elementos de estatísticas não encontrados na página.");
        return;
    }

    if (dados.length > 0) {
        const ultimoDado = dados[0];
        co2Value.innerText = `${ultimoDado.co2} ppm`;
        mpValue.innerText = `${ultimoDado.mp} µg/m³`;
        so2Value.innerText = `${ultimoDado.so2} ppm`;
        noxValue.innerText = `${ultimoDado.nox} ppm`;
        co2ProduzidoValue.innerText = `${ultimoDado.co2_produzido} kg`;
        co2CompensadoValue.innerText = `${ultimoDado.co2_compensado} kg`;
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
            <td>${item.co2} ppm</td>
            <td>${item.mp} µg/m³</td>
            <td>${item.so2} ppm</td>
            <td>${item.nox} ppm</td>
            <td>${item.co2_produzido} kg</td>
            <td>${item.co2_compensado} kg</td>
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
        head: [['Data', 'Localização', 'CO2 (ppm)', 'MP (µg/m³)', 'SO2 (ppm)', 'NOx (ppm)', 'CO2 Produzido (kg)', 'CO2 Compensado (kg)']],
        body: totalData.map(item => [
            new Date(item.data_hora).toLocaleString(),
            item.localizacao,
            item.co2,
            item.mp,
            item.so2,
            item.nox,
            item.co2_produzido,
            item.co2_compensado
        ])
    });

    doc.save('AmbIn_relatório.pdf');
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
