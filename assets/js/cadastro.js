// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para cadastrar o usuário
async function registerUser(name, email, password) {
    // Criação de um novo usuário
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: name }
        }
    });

    if (error) {
        console.error("Erro ao cadastrar usuário:", error);
        alert("Erro ao cadastrar. Verifique os dados e tente novamente.");
        return;
    }

    if (data.user) {
        console.log("Usuário cadastrado com sucesso:", data.user);
        alert("Cadastro realizado com sucesso! Faça login para continuar.");
        window.location.href = "login.html"; // Redireciona para a página de login
    }
}

// Event listener para o formulário de cadastro
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector("form");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        await registerUser(name, email, password);
    });
});
