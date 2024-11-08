window.addEventListener("load", async function () {
    // Inicialize o Supabase com sua URL e chave anônima
    const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
    const SUPABASE_ANON_KEY = "YeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";

    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Obtenha o token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const mensagemStatus = document.getElementById("mensagemStatus");

    if (!accessToken) {
        mensagemStatus.textContent = "Token de redefinição de senha não encontrado!";
        return;
    }

    // Seleciona o formulário e os campos de entrada
    const formRedefinirSenha = document.getElementById("form-redefinir-senha");
    const novaSenhaInput = document.getElementById("nova-senha");
    const confirmarSenhaInput = document.getElementById("confirmar-senha");

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
            // Autentica temporariamente o usuário e redefine a senha usando o token
            const { error } = await supabase.auth.verifyOtp({
                email: "usuario@example.com", // Substitua pelo e-mail do usuário
                token: accessToken,
                type: "recovery",
                newPassword: novaSenha
            });

            if (error) {
                mensagemStatus.textContent = "Erro ao alterar a senha: " + error.message;
            } else {
                mensagemStatus.textContent = "Senha alterada com sucesso! Agora você pode fazer login com sua nova senha.";
                setTimeout(() => {
                    window.location.href = "signin.html";
                }, 3000);
            }
        } catch (error) {
            mensagemStatus.textContent = "Ocorreu um erro inesperado. Tente novamente.";
        }
    });
});
