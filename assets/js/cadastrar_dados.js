// Configuração do Supabase
const SUPABASE_URL = "https://qlhbieemfchehmheqxip.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGJpZWVtZmNoZWhtaGVxeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MDMxMTIsImV4cCI6MjA0NjE3OTExMn0.E1eVfPSlm0P8N23T7YkkeVVFB1jyBB92Y_w6UnyAbHE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para carregar o CSV e enviar os dados para o Supabase
async function carregarCSV(event) {
    const file = event.target.files[0];
    
    // Verifica se o arquivo foi selecionado
    if (!file) {
        alert("Por favor, selecione um arquivo CSV.");
        return;
    }

    // Exibe o indicador de carregamento
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) loadingIndicator.style.display = "block";

    // Usando o PapaParse para ler o arquivo CSV
    Papa.parse(file, {
        complete: async function (results) {
            const csvData = results.data;
            
            if (csvData.length === 0) {
                alert("O arquivo CSV está vazio.");
                return;
            }

            // Obtendo o ID do usuário logado
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error || !session) {
                alert("Você precisa estar autenticado para carregar os dados.");
                return;
            }

            const userId = session.user.id; // Obtém o ID do usuário da sessão

            // Adiciona o campo 'user_id' em cada registro para associar ao usuário
            const dadosComUsuario = csvData.map(item => ({
                ...item,
                user_id: userId
            }));

            try {
                // Envia os dados do CSV para o Supabase
                const { data, error } = await supabase
                    .from('dados_ambientais')
                    .insert(dadosComUsuario);

                if (error) {
                    console.error("Erro ao carregar dados:", error);
                    alert("Erro ao carregar os dados. Verifique o console para mais detalhes.");
                } else {
                    console.log("Dados carregados com sucesso:", data);
                    alert("Dados carregados com sucesso!");
                    // Recarrega a página após o sucesso
                    location.reload(); // Reinicia a página
                }
            } catch (error) {
                console.error("Erro inesperado:", error);
                alert("Ocorreu um erro inesperado. Verifique o console para mais detalhes.");
            } finally {
                // Oculta o indicador de carregamento
                if (loadingIndicator) loadingIndicator.style.display = "none";
            }
        },
        header: true, // Assume que a primeira linha contém os nomes das colunas
        skipEmptyLines: true // Ignora linhas vazias
    });
}

// Função para cadastrar os dados do formulário no Supabase
async function cadastrarDados() {
    const localizacao = document.getElementById("localizacao").value.trim();
    const co2 = parseFloat(document.getElementById("co2").value);
    const mp = parseFloat(document.getElementById("mp").value);
    const so2 = parseFloat(document.getElementById("so2").value);
    const nox = parseFloat(document.getElementById("nox").value);
    const quantidadeCo2Produzida = parseFloat(document.getElementById("quantidade_co2_produzida").value);
    const quantidadeCo2Compensada = parseFloat(document.getElementById("quantidade_co2_compensada").value);

    // Verifica se todos os campos possuem valores válidos
    if (!localizacao || isNaN(co2) || isNaN(mp) || isNaN(so2) || isNaN(nox) || isNaN(quantidadeCo2Produzida) || isNaN(quantidadeCo2Compensada)) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // Exibe o indicador de carregamento
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) loadingIndicator.style.display = "block";

    // Tenta cadastrar os dados no Supabase
    try {
        const { data, error } = await supabase
            .from('dados_ambientais')
            .insert([{
                localizacao,
                co2,
                mp,
                so2,
                nox,
                quantidade_co2_produzida: quantidadeCo2Produzida,
                quantidade_co2_compensada: quantidadeCo2Compensada,
                data_hora: new Date().toISOString()
            }]);

        if (error) {
            console.error("Erro ao cadastrar dados:", error);
            alert("Erro ao cadastrar os dados. Verifique o console para mais detalhes.");
        } else {
            console.log("Dados cadastrados com sucesso:", data);
            alert("Dados cadastrados com sucesso!");
            // Limpa os campos do formulário
            const formCadastro = document.getElementById("data-form");
            if (formCadastro) {
                formCadastro.reset();
            } else {
                console.error("O formulário 'data-form' não foi encontrado.");
            }
            // Recarrega a página após o sucesso
            location.reload(); // Reinicia a página
        }
    } catch (error) {
        console.error("Erro inesperado:", error);
        alert("Ocorreu um erro inesperado. Verifique o console para mais detalhes.");
    } finally {
        // Oculta o indicador de carregamento
        if (loadingIndicator) loadingIndicator.style.display = "none";
    }
}

// Aguarda o carregamento completo do DOM
document.addEventListener("DOMContentLoaded", () => {
    const botaoCadastrar = document.getElementById("cadastrar-dados");
    const inputCSV = document.getElementById("csv");

    if (botaoCadastrar) {
        botaoCadastrar.addEventListener("click", cadastrarDados);
    }

    if (inputCSV) {
        inputCSV.addEventListener("change", carregarCSV);
    }
});
