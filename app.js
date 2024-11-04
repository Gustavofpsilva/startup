// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis de controle de paginação
const rowsPerPage = 50;
let currentPage = 1;
let totalData = []; // Armazena todos os dados carregados do Supabase

// Função para exibir o nome do usuário
async function exibirNomeUsuario() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("Erro ao obter usuário:", error);
        return;
    }
    const userNameElem = document.getElementById("user-name");
    if (userNameElem) {
        userNameElem.innerText = user.email; // Exibe o e-mail do usuário logado
    }
}

// Chama a função para exibir o nome do usuário na dashboard ou na página de cadastro de dados
document.addEventListener("DOMContentLoaded", exibirNomeUsuario);

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

// Função para verificar e recuperar o usuário autenticado
async function obterUsuarioAutenticado() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.log("Usuário não autenticado ou erro ao obter usuário:", error);
        const statusElem = document.getElementById("status");
        if (statusElem) statusElem.innerText = "Por favor, faça login para continuar.";
        return null;
    }
    return user;
}

// Função para carregar e exibir os dados ambientais do usuário
async function carregarDadosAmbientais() {
    const user = await obterUsuarioAutenticado();
    if (!user) return;

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

    totalData = data; // Armazena todos os dados carregados
    atualizarEstatisticas(totalData); // Atualiza os cartões de estatísticas
    displayTable(); // Exibe a tabela com a página atual
}

// Função para exibir a tabela com paginação
function displayTable() {
    const tableBody = document.getElementById("dados-tabela-corpo");
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

// Chama a função para carregar os dados quando a página da dashboard é carregada
document.addEventListener("DOMContentLoaded", carregarDadosAmbientais);

// Função de logout
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Erro ao fazer logout:", error);
        } else {
            window.location.href = "index.html"; // Redireciona para a página de login após o logout
        }
    });
}
