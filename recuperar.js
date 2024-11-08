// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Seleciona o formulário e o campo de mensagem de status
const form = document.getElementById('recuperar-senha-form');
const mensagemStatus = document.getElementById('mensagem-status');

// Adiciona um evento ao formulário para lidar com o envio
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;

    // Envia o e-mail de recuperação de senha
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://startup-rho-lilac.vercel.app/alterar_senha.html' // URL para a página de redefinição de senha
    });

    if (error) {
        mensagemStatus.textContent = `Erro ao enviar link de recuperação: ${error.message}`;
        mensagemStatus.style.color = 'red';
    } else {
        mensagemStatus.textContent = 'Link de recuperação enviado! Verifique seu e-mail.';
        mensagemStatus.style.color = 'green';
    }
});
