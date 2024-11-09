// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

    // Exibir o e-mail do usuário na sidebar
    const sidebarUserEmailElem = document.getElementById("sidebar-user-email");
    if (sidebarUserEmailElem) {
        sidebarUserEmailElem.innerText = user.email;
    }

// Carregar histórico de logins
const { data: logins, error: loginsError } = await supabase
    .from('logins')
    .select('data_hora')
    .eq('user_id', user.id)
    .order('data_hora', { ascending: false })
    .limit(null); // Desativa qualquer limite padrão

if (loginsError) {
    console.error("Erro ao carregar histórico de logins:", loginsError);
} else {
    const loginHistoryBody = document.getElementById("login-history-body");
    if (loginHistoryBody) {
        loginHistoryBody.innerHTML = logins.map(login => `
            <tr><td>${new Date(login.data_hora).toLocaleString('pt-BR')}</td></tr>
        `).join('');
    }
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

// Inicializa o código apenas após o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
    carregarPerfilUsuario();

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) logoutButton.addEventListener("click", logoutUser);
});
