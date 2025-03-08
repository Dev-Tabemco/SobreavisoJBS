let funcionarios = [];
let escalas = [];
let loggedIn = false;

// Credenciais de login (apenas para TI)
const CREDENCIAIS_TI = { username: "ti", password: "ti123" };

// Função para mostrar a tela de login
function mostrarLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
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
document.getElementById('formFuncionario').addEventListener('submit', function(event) {
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
document.getElementById('formEscala').addEventListener('submit', function(event) {
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

    // Verifica se o horário é válido para o dia selecionado
    const dataObj = new Date(data + 'T00:00:00'); // Garante que a data seja interpretada corretamente
    const diaSemana = dataObj.getDay(); // 0 = Domingo, 6 = Sábado
    const horariosValidos = (diaSemana === 0 || diaSemana === 6) ? ["00:00 - 23:59"] : ["00:00 - 07:00", "18:00 - 23:59"];

    if (!horariosValidos.includes(horario)) {
        alert('Horário inválido para este dia. Dias úteis: 00:00 - 07:00 e 18:00 - 23:59. Fins de semana: 00:00 - 23:59.');
        return;
    }

    // Adiciona a nova escala
    escalas.push({ data, horario, funcionario });
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
            row.innerHTML = `
                <td>${escala.funcionario}</td>
                <td>${escala.horario}</td>
                <td>${funcionario ? funcionario.telefone : 'N/A'}</td>
            `;
            corpoTabela.appendChild(row);
        });
    }

    // Atualizar tabela restrita (TI)
    if (corpoTabelaTI) {
        corpoTabelaTI.innerHTML = '';
        escalas.forEach(escala => {
            const funcionario = funcionarios.find(f => f.nome === escala.funcionario);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escala.data}</td>
                <td>${escala.funcionario}</td>
                <td>${escala.horario}</td>
                <td>${funcionario ? funcionario.telefone : 'N/A'}</td>
                <td>
                    <button onclick="editarEscala('${escala.data}')">Editar</button>
                    <button onclick="excluirEscala('${escala.data}')">Excluir</button>
                </td>
            `;
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
        row.innerHTML = `
            <td>${escala.data}</td>
            <td>${escala.funcionario}</td>
            <td>${escala.horario}</td>
            <td>${funcionario ? funcionario.telefone : 'N/A'}</td>
            <td>
                <button onclick="editarEscala('${escala.data}')">Editar</button>
                <button onclick="excluirEscala('${escala.data}')">Excluir</button>
            </td>
        `;
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
function excluirEscala(data) {
    if (!loggedIn) {
        alert('Apenas usuários da TI podem excluir escalas.');
        return;
    }

    escalas = escalas.filter(e => e.data !== data);
    atualizarTabelaEscalas();
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Exibe a página pública por padrão
    document.getElementById('publicContent').style.display = 'block';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('restrictedContent').style.display = 'none';

    // Atualiza a tabela de escalas ao carregar a página
    atualizarTabelaEscalas();
});