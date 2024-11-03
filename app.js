// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para atualizar os valores dos cartões de estatísticas
function atualizarEstatisticas(dados) {
    const tempValue = document.getElementById("temp-value");
    const humidadeValue = document.getElementById("humidade-value");
    const qualidadeArValue = document.getElementById("qualidade-ar-value");
    const localizacaoValue = document.getElementById("localizacao-value");

    if (!tempValue || !humidadeValue || !qualidadeArValue || !localizacaoValue) return; // Verifica se os elementos existem

    const ultimoDado = dados[0]; // Utiliza o dado mais recente
    tempValue.innerText = ultimoDado.temperatura || '--';
    humidadeValue.innerText = ultimoDado.umidade || '--';
    qualidadeArValue.innerText = ultimoDado.qualidade_ar || '--';
    localizacaoValue.innerText = ultimoDado.localizacao || '--';
}

// Função para verificar e recuperar o usuário autenticado
async function obterUsuarioAutenticado() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.log("Usuário não autenticado ou erro ao obter usuário:", error);
        const statusElem = document.getElementById("status");
        if (statusElem) statusElem.innerText = "Por favor, faça login para continuar.";
        return null;
    }
    return user;
}

// Executa apenas na página de login
if (document.getElementById("signup-form") && document.getElementById("login-form")) {
    // Função para Cadastro
    document.getElementById("signup-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        const { error } = await supabase.auth.signUp({ email, password });
        document.getElementById("status").innerText = error ? `Erro no cadastro: ${error.message}` : "Cadastro realizado com sucesso! Verifique seu email.";
    });

    // Função para Login
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            document.getElementById("status").innerText = `Erro no login: ${error.message}`;
        } else {
            document.getElementById("status").innerText = "Login realizado com sucesso!";
            window.location.href = "dashboard.html"; // Redireciona para a dashboard após o login
        }
    });
}

// Executa apenas na dashboard
if (document.querySelector(".stats-cards")) {
    // Função para carregar e exibir os dados ambientais do usuário
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
            const statusElem = document.getElementById("status");
            if (statusElem) statusElem.innerText = "Erro ao carregar dados ambientais.";
            return;
        }

        if (!data || data.length === 0) {
            const statusElem = document.getElementById("status");
            if (statusElem) statusElem.innerText = "Nenhum dado ambiental disponível.";
            return;
        }

        atualizarEstatisticas(data); // Atualiza os cartões de estatísticas com os dados mais recentes
        preencherTabela(data); // Preenche a tabela com os dados
    }

    // Função para preencher a tabela com os dados carregados
    function preencherTabela(dados) {
        const tabelaCorpo = document.getElementById("dados-tabela-corpo");
        if (!tabelaCorpo) return; // Verifica se o elemento da tabela existe

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
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Erro ao fazer logout:", error);
            } else {
                window.location.href = "index.html"; // Redireciona para a página de login após o logout
            }
        });
    }
}

// Executa apenas na página de cadastro de dados ambientais
if (document.getElementById("dadosAmbientaisForm")) {
    document.getElementById("dadosAmbientaisForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = await obterUsuarioAutenticado();
        if (!user) return;

        const localizacao = document.getElementById("localizacao").value;
        const temperatura = parseFloat(document.getElementById("temperatura").value);
        const umidade = parseInt(document.getElementById("umidade").value);
        const qualidadeAr = document.getElementById("qualidade_ar").value;
        const dataHora = new Date().toISOString();

        if (!localizacao || isNaN(temperatura) || isNaN(umidade) || !qualidadeAr) {
            const statusElem = document.getElementById("status");
            if (statusElem) statusElem.innerText = "Por favor, preencha todos os campos de dados ambientais.";
            return;
        }

        const { error } = await supabase
            .from('dados_ambientais')
            .insert([{ localizacao, temperatura, umidade, qualidade_ar: qualidadeAr, data_hora: dataHora, user_id: user.id }]);

        const statusElem = document.getElementById("status");
        if (statusElem) statusElem.innerText = error ? "Erro ao salvar os dados." : "Dados salvos com sucesso!";
    });
}
