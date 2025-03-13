let funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
let escalas = JSON.parse(localStorage.getItem('escalas')) || [];
let loggedIn = false;

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    localStorage.setItem('escalas', JSON.stringify(escalas));
}

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

// Cadastro de Funcionários (apenas TI)
document.getElementById('formFuncionario').addEventListener('submit', function(event) {
    event.preventDefault();
    if (!loggedIn) {
        alert('Apenas usuários da TI podem cadastrar funcionários.');
        return;
    }

    const nome = document.getElementById('nomeFuncionario').value;
    const telefone = document.getElementById('telefoneFuncionario').value;

    funcionarios.push({ nome, telefone });
    salvarDados();
    atualizarFuncionarios();
    document.getElementById('formFuncionario').reset();
    alert('Funcionário cadastrado com sucesso!');
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

    escalas.push({ data, horario, funcionario });
    salvarDados();
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
    const hoje = new Date().toISOString().split('T')[0];

    if (corpoTabela) {
        corpoTabela.innerHTML = '';
        escalas.filter(e => e.data === hoje).forEach(escala => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${escala.funcionario}</td><td>${escala.horario}</td>`;
            corpoTabela.appendChild(row);
        });
    }

    if (corpoTabelaTI) {
        corpoTabelaTI.innerHTML = '';
        escalas.forEach(escala => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${escala.data}</td><td>${escala.funcionario}</td><td>${escala.horario}</td>
                <td><button onclick="excluirEscala('${escala.data}')">Excluir</button></td>`;
            corpoTabelaTI.appendChild(row);
        });
    }
}

// Excluir escala (apenas TI)
function excluirEscala(data) {
    if (!loggedIn) {
        alert('Apenas usuários da TI podem excluir escalas.');
        return;
    }

    escalas = escalas.filter(e => e.data !== data);
    salvarDados();
    atualizarTabelaEscalas();
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('publicContent').style.display = 'block';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('restrictedContent').style.display = 'none';
    atualizarFuncionarios();
    atualizarTabelaEscalas();
});
