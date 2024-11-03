// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para atualizar os valores dos cartões de estatísticas
function atualizarEstatisticas(dados) {
    if (!dados || dados.length === 0) return;

    const ultimoDado = dados[0]; // Utiliza o dado mais recente

    document.getElementById("temp-value").innerText = ultimoDado.temperatura || '--';
    document.getElementById("humidade-value").innerText = ultimoDado.umidade || '--';
    document.getElementById("qualidade-ar-value").innerText = ultimoDado.qualidade_ar || '--';
    document.getElementById("localizacao-value").innerText = ultimoDado.localizacao || '--';
}

// Função para verificar e recuperar o usuário autenticado
async function obterUsuarioAutenticado() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.log("Usuário não autenticado ou erro ao obter usuário:", error);
        document.getElementById("status").innerText = "Por favor, faça login para continuar.";
        return null;
    }
    return user;
}

// Função para carregar e exibir os dados ambientais na tabela
async function carregarDadosAmbientais() {
    const user = await obterUsuarioAutenticado();
    if (!user) return;

    const { data, error } = await supabase
        .from('dados_ambientais')
        .select('*')
        .eq('user_id', user.id)
        .order('data_hora', { ascending: false });

    if (error) {
        console.error("Erro ao carregar dados:", error);
        document.getElementById("status").innerText = "Erro ao carregar dados ambientais.";
        return;
    }

    if (!data || data.length === 0) {
        document.getElementById("status").innerText = "Nenhum dado ambiental disponível.";
        return;
    }

    atualizarEstatisticas(data); // Atualiza os cartões de estatísticas com os dados mais recentes
    preencherTabela(data); // Preenche a tabela com os dados
}

// Função para preencher a tabela com os dados carregados
function preencherTabela(dados) {
    const tabelaCorpo = document.getElementById("dados-tabela-corpo");
    tabelaCorpo.innerHTML = ""; // Limpa a tabela antes de adicionar novos dados

    dados.forEach((item) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${new Date(item.data_hora).toLocaleString()}</td>
            <td>${item.localizacao}</td>
            <td>${item.temperatura}°C</td>
            <td>${item.umidade}%</td>
            <td>${item.qualidade_ar}</td>
        `;
        tabelaCorpo.appendChild(linha);
    });
}

// Chama a função para carregar os dados quando a página da dashboard é carregada
document.addEventListener("DOMContentLoaded", carregarDadosAmbientais);

// Função de logout
document.getElementById("logout-button").addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Erro ao fazer logout:", error);
    } else {
        window.location.href = "index.html"; // Redireciona para a página de login após o logout
    }
});
