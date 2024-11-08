// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('alterar-senha-form');
const mensagemStatus = document.getElementById('mensagem-status');

// Adiciona um evento ao formulário para lidar com o envio
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const novaSenha = document.getElementById('nova-senha').value;

    const { error } = await supabase.auth.updateUser({
        password: novaSenha
    });

    if (error) {
        mensagemStatus.textContent = `Erro ao redefinir senha: ${error.message}`;
        mensagemStatus.style.color = 'red';
    } else {
        mensagemStatus.textContent = 'Senha alterada com sucesso!';
        mensagemStatus.style.color = 'green';
    }
});
