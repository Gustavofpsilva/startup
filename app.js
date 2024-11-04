// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis de controle de paginação
const rowsPerPage = 50;
let currentPage = 1;
let totalData = []; // Armazena todos os dados carregados do Supabase

// Função para exibir o nome do usuário
async function exibirNomeUsuario() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("Erro ao obter usuário:", error);
        return;
    }
    const userNameElem = document.getElementById("user-name");
    if (userNameElem) {
        userNameElem.innerText = user.email; // Exibe o e-mail do usuário logado
    }
}

// Chama a função para exibir o nome do usuário na dashboard ou na página de cadastro de dados
document.addEventListener("DOMContentLoaded", exibirNomeUsuario);

// Função para atualizar os valores dos cartões de estatísticas
function atualizarEstatisticas(dados) {
    const tempValue = document.getElementById("temp-value");
    const humidadeValue = document.getElementById("humidade-value");
    const qualidadeArValue = document.getElementById("qualidade-ar-value");
    const localizacaoValue = document.getElementById("localizacao-value");

    if (!tempValue || !humidadeValue || !qualidadeArValue || !localizacaoValue) return;

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

// Função para carregar e exibir todos os dados ambientais
async function carregarDadosAmbientais() {
    console.log("Tentando carregar todos os dados para depuração.");
    const { data, error } = await supabase
        .from('dados_ambientais')
        .select('*')
        .order('data_hora', { ascending: false });

    if (error) {
        console.error("Erro ao carregar dados:", error);
        const statusElem = document.getElementById("status");
        if (statusElem) statusElem.innerText = "Erro ao carregar dados ambientais.";
        return;
    }

    if (!data || data.length === 0) {
        console.log("Nenhum dado encontrado para exibir.");
        const statusElem = document.getElementById("status");
        if (statusElem) statusElem.innerText = "Nenhum dado ambiental disponível.";
        return;
    }

    console.log("Dados carregados para depuração:", data);

    totalData = data; // Armazena todos os dados carregados
    atualizarEstatisticas(totalData); // Atualiza os cartões de estatísticas
    displayTable(); // Exibe a tabela com a página atual
}

// Função para exibir a tabela com paginação
function displayTable() {
    const tableBody = document.getElementById("dados-tabela-corpo");
    if (!tableBody) {
        console.error("Elemento da tabela não encontrado. Verifique o HTML.");
        return;
    }
    tableBody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = totalData.slice(start, end);

    paginatedData.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${new Date(item.data_hora).toLocaleString()}</td>
            <td>${item.localizacao}</td>
            <td>${item.temperatura}°C</td>
            <td>${item.umidade}%</td>
            <td>${item.qualidade_ar}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("page-info").innerText = `Página ${currentPage} de ${Math.ceil(totalData.length / rowsPerPage)}`;
}

// Funções de navegação de página
function nextPage() {
    if ((currentPage * rowsPerPage) < totalData.length) {
        currentPage++;
        displayTable();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTable();
    }
}

// Função para carregar dados de um arquivo CSV
document.addEventListener("DOMContentLoaded", () => {
    const uploadCsvButton = document.getElementById("uploadCsvButton");
    if (uploadCsvButton) {
        uploadCsvButton.addEventListener("click", () => {
            const fileInput = document.getElementById("csvFileInput");
            const csvStatus = document.getElementById("csvStatus");

            if (fileInput.files.length === 0) {
                csvStatus.textContent = "Por favor, selecione um arquivo CSV.";
                return;
            }

            const file = fileInput.files[0];
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async function(results) {
                    csvStatus.textContent = "Carregando dados...";
                    const data = results.data;
                    
                    // Validação e envio de cada linha do CSV
                    for (const row of data) {
                        const { localizacao, temperatura, umidade, qualidade_ar } = row;
                        
                        // Adiciona a data e hora atuais se não estiver presente
                        const data_hora = row.data_hora || new Date().toISOString();

                        // Verifica se todos os campos estão presentes na linha
                        if (localizacao && temperatura && umidade && qualidade_ar) {
                            const { error } = await supabase
                                .from("dados_ambientais")
                                .insert([{ localizacao, temperatura: parseFloat(temperatura), umidade: parseInt(umidade), qualidade_ar, data_hora }]);

                            if (error) {
                                csvStatus.textContent = `Erro ao carregar dados: ${error.message}`;
                                return;
                            }
                        } else {
                            csvStatus.textContent = "Erro: Algumas linhas estão com dados incompletos.";
                            return;
                        }
                    }

                    csvStatus.textContent = "Dados carregados com sucesso!";
                },
                error: function(error) {
                    csvStatus.textContent = `Erro ao processar o arquivo CSV: ${error.message}`;
                }
            });
        });
    }

    carregarDadosAmbientais();
});

// Função de logout
document.addEventListener("DOMContentLoaded", () => {
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
});
