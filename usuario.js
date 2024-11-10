// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis de controle de paginação
const rowsPerPage = 50;  // Limite de 50 registros por página
let currentPage = 1;
let loginHistory = [];

// Função para obter o usuário logado e mostrar o último login
async function getUserInfo() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("Erro ao obter usuário:", error);
        return;
    }

    // Exibir e-mail
    document.getElementById("user-email").innerText = user.email;

    // Consultar o último login do usuário
    const { data: logins, error: loginsError } = await supabase
        .from('logins')
        .select('data_hora')
        .eq('user_id', user.id)
        .order('data_hora', { ascending: false })
        .limit(1);

    if (loginsError) {
        console.error("Erro ao obter o último login:", loginsError);
    } else {
        const lastLogin = logins.length > 0 ? new Date(logins[0].data_hora).toLocaleString('pt-BR') : "Nenhum login encontrado";
        document.getElementById("last-login").innerText = lastLogin;
    }

    // Carregar histórico de logins
    loadLoginHistory(user.id);
}

// Função para carregar o histórico de logins com paginação
async function loadLoginHistory(userId) {
    const { data: logins, error } = await supabase
        .from('logins')
        .select('data_hora')
        .eq('user_id', userId)
        .order('data_hora', { ascending: false })
        .range((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage - 1); // Paginação com range

    if (error) {
        console.error("Erro ao carregar histórico de logins:", error);
        return;
    }

    loginHistory = logins;
    renderLoginHistory();
}

// Função para renderizar o histórico de logins na tabela
function renderLoginHistory() {
    const loginHistoryBody = document.getElementById("login-history-body");
    loginHistoryBody.innerHTML = ""; // Limpar a tabela

    loginHistory.forEach(item => {
        const row = document.createElement("tr");
        // Ajuste para exibir a data de forma local
        const loginDate = new Date(item.data_hora).toLocaleString('pt-BR');
        row.innerHTML = `<td>${loginDate}</td>`;
        loginHistoryBody.appendChild(row);
    });

    // Atualizar o número da página
    document.getElementById("page-number").innerText = `Página ${currentPage}`;
    
    // Habilitar ou desabilitar os botões de navegação
    document.getElementById("prev-page").disabled = currentPage === 1;
    document.getElementById("next-page").disabled = loginHistory.length < rowsPerPage;
}

// Funções de navegação de página
document.getElementById("next-page").addEventListener("click", () => {
    currentPage++;
    loadLoginHistory();  // Carregar a próxima página de logins
});

document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadLoginHistory();  // Carregar a página anterior de logins
    }
});

// Carregar as informações assim que o DOM estiver pronto
document.addEventListener("DOMContentLoaded", getUserInfo);
