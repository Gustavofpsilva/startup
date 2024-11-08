// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para redefinir a senha
async function redefinirSenha() {
    const novaSenha = document.getElementById("nova-senha").value;

    if (!novaSenha) {
        alert("Por favor, insira uma nova senha.");
        return;
    }

    const { error } = await supabase.auth.updateUser({
        password: novaSenha
    });

    if (error) {
        console.error("Erro ao redefinir a senha:", error);
        alert("Erro ao redefinir a senha. Tente novamente.");
    } else {
        alert("Senha redefinida com sucesso! Você pode fazer login com sua nova senha.");
        window.location.href = "signin.html"; // Redireciona para a página de login ou home
    }
}

// Adiciona o evento ao formulário
document.getElementById("form-redefinir-senha").addEventListener("submit", function (event) {
    event.preventDefault();
    redefinirSenha();
});
