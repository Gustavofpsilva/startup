// Inicialize o Supabase com sua URL e chave anônima
const SUPABASE_URL = "https://YOUR_SUPABASE_URL.supabase.co"; // Substitua pelo seu Supabase URL
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"; // Substitua pela sua chave anônima do Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Seleciona o formulário e os campos de entrada
const formRedefinirSenha = document.getElementById("form-redefinir-senha");
const novaSenhaInput = document.getElementById("nova-senha");
const confirmarSenhaInput = document.getElementById("confirmar-senha");
const mensagemStatus = document.getElementById("mensagemStatus");

formRedefinirSenha.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const novaSenha = novaSenhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    // Verifique se as senhas correspondem
    if (novaSenha !== confirmarSenha) {
        mensagemStatus.textContent = "As senhas não correspondem!";
        return;
    }

    try {
        // Atualiza a senha do usuário autenticado com o link mágico
        const { error } = await supabase.auth.updateUser({ password: novaSenha });

        if (error) {
            mensagemStatus.textContent = "Erro ao alterar a senha: " + error.message;
        } else {
            mensagemStatus.textContent = "Senha alterada com sucesso! Agora você pode fazer login com sua nova senha.";
            // Opcionalmente, redirecionar para a página de login após alguns segundos
            setTimeout(() => {
                window.location.href = "signin.html";
            }, 3000);
        }
    } catch (error) {
        mensagemStatus.textContent = "Ocorreu um erro inesperado. Tente novamente.";
    }
});
