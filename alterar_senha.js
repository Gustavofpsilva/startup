window.onload = function () {
    // Configuração do Supabase
    const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Função para redefinir a senha
    async function redefinirSenha() {
        const novaSenha = document.getElementById("nova-senha").value;
        const confirmarSenha = document.getElementById("confirmar-senha").value;
        const mensagemStatus = document.getElementById("mensagemStatus");

        if (novaSenha !== confirmarSenha) {
            mensagemStatus.textContent = 'As senhas não coincidem.';
            mensagemStatus.style.color = 'red';
            return;
        }

        // Captura o token de redefinição da URL
        const urlParams = new URLSearchParams(window.location.search);
        const access_token = urlParams.get('access_token');

        if (!access_token) {
            mensagemStatus.textContent = 'Token de redefinição de senha inválido.';
            mensagemStatus.style.color = 'red';
            return;
        }

        try {
            const { error } = await supabase.auth.api.updateUser(access_token, { password: novaSenha });

            if (error) {
                mensagemStatus.textContent = 'Erro ao redefinir senha: ' + error.message;
                mensagemStatus.style.color = 'red';
            } else {
                mensagemStatus.textContent = 'Senha alterada com sucesso! Você será redirecionado para a página de login.';
                mensagemStatus.style.color = 'green';
                setTimeout(() => {
                    window.location.href = 'signin.html';
                }, 3000);
            }
        } catch (error) {
            console.error('Erro inesperado:', error);
            mensagemStatus.textContent = 'Erro inesperado: ' + error.message;
            mensagemStatus.style.color = 'red';
        }
    }

    // Adiciona o evento ao formulário
    document.getElementById("form-redefinir-senha").addEventListener("submit", function (event) {
        event.preventDefault();
        redefinirSenha();
    });
};
