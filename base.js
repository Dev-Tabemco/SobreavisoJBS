let funcionarios = [];
let escalas = [];
let loggedIn = false;

// Credenciais de login (apenas para TI)
const CREDENCIAIS_TI = { username: "ti", password: "ti123" };

// Configurações do JSONBin.io
const BIN_ID = '67d2c6f58960c979a570bc41'; // Substitua pelo seu Bin ID
const API_KEY = '$2a$10$bXlzG3SYavPHAoqlvF3mfuerInkZexiCmpl5SfXSOAezIdgXX1vrq'; // Substitua pela sua API Key
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const headers = {
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY,
};

// Função para buscar dados do JSONBin.io
async function fetchData() {
    try {
        const response = await fetch(BASE_URL, { headers });
        const data = await response.json();
        funcionarios = data.record.funcionarios || [];
        escalas = data.record.escalas || [];
        atualizarTabelaEscalas();
        atualizarFuncionarios();
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

// Função para atualizar dados no JSONBin.io
async function updateData() {
    try {
        const data = { funcionarios, escalas };
        const response = await fetch(BASE_URL, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        const result = await response.json();
        console.log('Dados atualizados com sucesso:', result);
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
    }
}

// Função para mostrar a tela de login
function mostrarLogin() {
    document.getElementById('loginScreen').style.display = 'flex'; // Exibe a tela de login
}

// Função de login (apenas para TI)
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === CREDENCIAIS_TI.username && password === CREDENCIAIS_TI.password) {
        loggedIn = true;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('publicContent').style.display = 'none';
        document.getElementById('restrictedContent').style.display = 'block';
    } else {
        alert('Usuário ou senha incorretos!');
    }
});

// Função de logout (apenas para TI)
document.getElementById('logoutButtonTI').addEventListener('click', function() {
    loggedIn = false;
    document.getElementById('restrictedContent').style.display = 'none';
    document.getElementById('publicContent').style.display = 'block';
});

// Função para alternar entre abas (apenas para TI)
function openTab(tabName) {
    const tabcontents = document.querySelectorAll('.tabcontent');
    const tablinks = document.querySelectorAll('.tablink');

    tabcontents.forEach(tab => tab.style.display = 'none');
    tablinks.forEach(tab => tab.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
}

// Cadastro de Funcionários (apenas TI)
document.getElementById('formFuncionario').addEventListener('submit', async function(event) {
    event.preventDefault();
    if (!loggedIn) {
        alert('Apenas usuários da TI podem cadastrar funcionários.');
        return;
    }

    const nome = document.getElementById('nomeFuncionario').value;
    const telefone = document.getElementById('telefoneFuncionario').value;

    // Validação do telefone
    const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!telefoneRegex.test(telefone)) {
        alert('Formato de telefone inválido. Use o formato (XX) XXXXX-XXXX.');
        return;
    }

    funcionarios.push({ nome, telefone });
    await updateData(); // Atualiza o JSONBin.io
    atualizarFuncionarios();
    document.getElementById('formFuncionario').reset();
    alert('Funcionário cadastrado com sucesso!');
});

// Impede a digitação de caracteres não numéricos no campo de telefone
document.getElementById('telefoneFuncionario').addEventListener('input', function(event) {
    const telefone = event.target.value.replace(/\D/g, ''); // Remove todos os não dígitos
    if (telefone.length > 0) {
        // Formata o telefone no padrão (XX) XXXXX-XXXX
        let formattedTelefone = '(' + telefone.substring(0, 2) + ') ';
        if (telefone.length > 2) {
            formattedTelefone += telefone.substring(2, 7) + '-';
        }
        if (telefone.length > 7) {
            formattedTelefone += telefone.substring(7, 11);
        }
        event.target.value = formattedTelefone;
    }
});

// Cadastro de Escalas (apenas TI)
document.getElementById('formEscala').addEventListener('submit', async function(event) {
    event.preventDefault();
    if (!loggedIn) {
        alert('Apenas usuários da TI podem cadastrar escalas.');
        return;
    }

    const data = document.getElementById('dataEscala').value;
    const horario = document.getElementById('horarioEscala').value;
    const funcionario = document.getElementById('funcionarioEscala').value;

    // Verifica se já existe uma escala para o dia selecionado
    const escalaExistente = escalas.find(escala => escala.data === data);
    if (escalaExistente) {
        alert('Já existe um colaborador de sobreaviso cadastrado para este dia.');
        return;
    }

    // Adiciona a nova escala
    escalas.push({ data, horario, funcionario });
    await updateData(); // Atualiza o JSONBin.io
    atualizarTabelaEscalas();
    document.getElementById('formEscala').reset();
    alert('Escala cadastrada com sucesso!');
});

// Atualizar lista de funcionários no formulário de escala
function atualizarFuncionarios() {
    const selectFuncionario = document.getElementById('funcionarioEscala');
    selectFuncionario.innerHTML = '';
    funcionarios.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario.nome;
        option.textContent = funcionario.nome;
        selectFuncionario.appendChild(option);
    });
}

// Atualizar tabela de escalas (pública e restrita)
function atualizarTabelaEscalas() {
    const corpoTabela = document.getElementById('corpoTabela');
    const corpoTabelaTI = document.getElementById('corpoTabelaTI');

    // Atualizar tabela pública (apenas escalas do dia atual)
    if (corpoTabela) {
        const hoje = new Date().toISOString().split('T')[0]; // Data no formato YYYY-MM-DD
        const escalasHoje = escalas.filter(escala => escala.data === hoje);

        corpoTabela.innerHTML = '';
        escalasHoje.forEach(escala => {
            const funcionario = funcionarios.find(f => f.nome === escala.funcionario);
            const row = document.createElement('tr');
            row.innerHTML = 
                `<td>${escala.funcionario}</td>
                 <td>${escala.horario}</td>
                 <td>${funcionario ? funcionario.telefone : 'N/A'}</td>`;
            corpoTabela.appendChild(row);
        });
    }

    // Atualizar tabela restrita (TI)
    if (corpoTabelaTI) {
        corpoTabelaTI.innerHTML = '';
        escalas.forEach(escala => {
            const funcionario = funcionarios.find(f => f.nome === escala.funcionario);
            const row = document.createElement('tr');
            row.innerHTML = 
                `<td>${escala.data}</td>
                 <td>${escala.funcionario}</td>
                 <td>${escala.horario}</td>
                 <td>${funcionario ? funcionario.telefone : 'N/A'}</td>
                 <td>
                     <button onclick="editarEscala('${escala.data}')">Editar</button>
                     <button onclick="excluirEscala('${escala.data}')">Excluir</button>
                 </td>`;
            corpoTabelaTI.appendChild(row);
        });
    }
}

// Filtrar escalas por mês e ano (restrita)
function filtrarEscalasTI() {
    const mes = document.getElementById('mesTI').value;
    const ano = document.getElementById('anoTI').value;
    const escalasFiltradas = escalas.filter(escala => {
        const [anoEscala, mesEscala] = escala.data.split('-');
        return mesEscala === mes && anoEscala === ano.toString();
    });
    const corpoTabelaTI = document.getElementById('corpoTabelaTI');
    corpoTabelaTI.innerHTML = '';
    escalasFiltradas.forEach(escala => {
        const funcionario = funcionarios.find(f => f.nome === escala.funcionario);
        const row = document.createElement('tr');
        row.innerHTML = 
            `<td>${escala.data}</td>
             <td>${escala.funcionario}</td>
             <td>${escala.horario}</td>
             <td>${funcionario ? funcionario.telefone : 'N/A'}</td>
             <td>
                 <button onclick="editarEscala('${escala.data}')">Editar</button>
                 <button onclick="excluirEscala('${escala.data}')">Excluir</button>
             </td>`;
        corpoTabelaTI.appendChild(row);
    });
}

// Editar escala (apenas TI)
function editarEscala(data) {
    if (!loggedIn) {
        alert('Apenas usuários da TI podem editar escalas.');
        return;
    }

    const escala = escalas.find(e => e.data === data);
    if (escala) {
        document.getElementById('dataEscala').value = escala.data;
        document.getElementById('horarioEscala').value = escala.horario;
        document.getElementById('funcionarioEscala').value = escala.funcionario;
    }
}

// Excluir escala (apenas TI)
async function excluirEscala(data) {
    if (!loggedIn) {
        alert('Apenas usuários da TI podem excluir escalas.');
        return;
    }

    escalas = escalas.filter(e => e.data !== data);
    await updateData(); // Atualiza o JSONBin.io
    atualizarTabelaEscalas();
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Exibe a página pública por padrão
    document.getElementById('publicContent').style.display = 'block';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('restrictedContent').style.display = 'none';

    // Carrega os dados do JSONBin.io
    fetchData();
});