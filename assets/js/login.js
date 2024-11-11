// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Supabase client initialized.");

// Função para registrar o login do usuário na tabela de logins
async function registrarLogin(userId) {
    console.log("Iniciando registro de login para o usuário ID:", userId);

    const { error } = await supabase
        .from('logins')
        .insert([{ user_id: userId, data_hora: new Date().toISOString() }]);

    if (error) {
        console.error("Erro ao registrar o login:", error);
    } else {
        console.log("Login registrado com sucesso para o usuário ID:", userId);
    }
}

// Função de autenticação do usuário e registro do login
async function loginUser(email, password) {
    console.log("Iniciando autenticação para o email:", email);

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error("Erro ao autenticar usuário:", error);
        alert("Erro ao autenticar usuário. Verifique seu email e senha.");
        return;
    }

    if (user) {
        console.log("Usuário autenticado com sucesso:", user);
        await registrarLogin(user.id);
        console.log("Redirecionando para a página principal...");
        window.location.href = "dashboard.html";
    } else {
        console.warn("Nenhum usuário retornado após tentativa de autenticação.");
    }
}

// Event listener para o formulário de login
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM completamente carregado.");

    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("Formulário de login enviado.");

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        console.log("Dados do formulário capturados:", { email, password });
        await loginUser(email, password);
    });
});
