// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis de controle de paginação
let currentPage = 1;
const pageSize = 50;

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

// Função para exibir o e-mail do usuário na sidebar e no perfil
async function carregarPerfilUsuario() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("Erro ao obter usuário:", error);
        return;
    }

    // Exibir o e-mail do usuário na página de perfil
    const userEmailElem = document.getElementById("user-email");
    if (userEmailElem) {
        userEmailElem.innerText = user.email;
    }

    // Registrar o login do usuário
    registrarLogin(user.id);

    // Carregar histórico de logins para a página atual
    carregarLogins(user.id, currentPage);
}

// Função para carregar o histórico de logins com paginação
async function carregarLogins(userId, page) {
    const { data: logins, error: loginsError } = await supabase
        .from('logins')
        .select('data_hora')
        .eq('user_id', userId)
        .order('data_hora', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1); // Define o intervalo de registros

    if (loginsError) {
        console.error("Erro ao carregar histórico de logins:", loginsError);
    } else {
        const loginHistoryBody = document.getElementById("login-history-body");
        if (loginHistoryBody) {
            loginHistoryBody.innerHTML = logins.map(login => `
                <tr><td>${new Date(login.data_hora).toLocaleString('pt-BR')}</td></tr>
            `).join('');
        }
        
        // Atualizar estado dos botões de navegação
        document.getElementById("page-number").innerText = `Página ${currentPage}`;
        document.getElementById("prev-page").disabled = currentPage === 1;
        document.getElementById("next-page").disabled = logins.length < pageSize;
    }
}

// Funções para navegação entre páginas
document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        carregarLogins(user.id, currentPage);
    }
});

document.getElementById("next-page").addEventListener("click", () => {
    currentPage++;
    carregarLogins(user.id, currentPage);
});

// Função de logout
async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Erro ao fazer logout:", error);
    } else {
        window.location.href = "index.html";
    }
}

// Inicializa o código apenas após o carregamento do DOM
document.addEventListener("DOMContentLoaded", async () => {
    await carregarPerfilUsuario();

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) logoutButton.addEventListener("click", logoutUser);
});
