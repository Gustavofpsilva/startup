window.addEventListener("load", async function () {
    // Inicialize o Supabase com sua URL e chave anônima
    const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
    const SUPABASE_ANON_KEY = "YeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";

    console.log("Inicializando Supabase...");
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase inicializado com sucesso!");

    // Obtenha o TokenHash da URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenHash = urlParams.get("access_token"); // O TokenHash deve estar na URL com o nome `access_token`
    const mensagemStatus = document.getElementById("mensagemStatus");

    if (!tokenHash) {
        console.log("Token de redefinição de senha não encontrado na URL.");
        mensagemStatus.textContent = "Token de redefinição de senha não encontrado!";
        return;
    }

    console.log("TokenHash capturado:", tokenHash);

    // Seleciona o formulário e os campos de entrada
    const formRedefinirSenha = document.getElementById("form-redefinir-senha");
    const emailInput = document.getElementById("email");
    const novaSenhaInput = document.getElementById("nova-senha");
    const confirmarSenhaInput = document.getElementById("confirmar-senha");

    formRedefinirSenha.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const email = emailInput.value;
        const novaSenha = novaSenhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        console.log("E-mail inserido:", email);
        console.log("Tentando redefinir senha com o TokenHash:", tokenHash);

        // Verifique se as senhas correspondem
        if (novaSenha !== confirmarSenha) {
            console.log("As senhas inseridas não correspondem.");
            mensagemStatus.textContent = "As senhas não correspondem!";
            return;
        }

        try {
            console.log("Enviando solicitação de verificação OTP para redefinir senha...");

            // Autentica temporariamente o usuário e redefine a senha usando o TokenHash e o e-mail fornecido
            const { error } = await supabase.auth.verifyOtp({
                email: email,
                token: tokenHash,
                type: "recovery",
                newPassword: novaSenha
            });

            if (error) {
                console.error("Erro ao redefinir a senha:", error);
                mensagemStatus.textContent = "Erro ao alterar a senha: " + error.message;
            } else {
                console.log("Senha alterada com sucesso!");
                mensagemStatus.textContent = "Senha alterada com sucesso! Agora você pode fazer login com sua nova senha.";
                setTimeout(() => {
                    window.location.href = "signin.html";
                }, 3000);
            }
        } catch (error) {
            console.error("Erro inesperado ao redefinir a senha:", error);
            mensagemStatus.textContent = "Ocorreu um erro inesperado. Tente novamente.";
        }
    });
});
