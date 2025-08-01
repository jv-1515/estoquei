let funcionarios = [];

function getIniciais(nome) {
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function corAvatar(str) {
    // Gera uma cor pastel baseada no nome
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 80%)`;
}



// Atualiza avatar ao digitar o nome no cadastro e na edição
document.addEventListener('DOMContentLoaded', function() {
    // Cadastro
    const nomeInput = document.getElementById('cad-nome');
    const avatarDiv = document.getElementById('cad-avatar');
    const iniciaisSpan = document.getElementById('cad-avatar-iniciais');
    const icon = avatarDiv ? avatarDiv.querySelector('i.fa-user') : null;

    function atualizarAvatarCadastro() {
        const nome = nomeInput ? nomeInput.value.trim() : '';
        if (nome.length > 0) {
            if (iniciaisSpan) iniciaisSpan.textContent = getIniciais(nome);
            if (avatarDiv) avatarDiv.style.background = corAvatar(nome);
            if (icon) icon.style.display = 'none';
        } else {
            if (iniciaisSpan) iniciaisSpan.textContent = '';
            if (avatarDiv) avatarDiv.style.background = '#f1f1f1';
            if (icon) icon.style.display = '';
        }
    }

    if (nomeInput && avatarDiv && iniciaisSpan) {
        nomeInput.addEventListener('input', atualizarAvatarCadastro);
        atualizarAvatarCadastro();
    }

    // Edição
    const editNomeInput = document.getElementById('edit-nome');
    const editAvatarDiv = document.getElementById('edit-avatar');
    const editIniciaisSpan = document.getElementById('edit-avatar-iniciais');
    const editIcon = editAvatarDiv ? editAvatarDiv.querySelector('i.fa-user') : null;

    function atualizarAvatarEdicao() {
        const nome = editNomeInput ? editNomeInput.value.trim() : '';
        if (nome.length > 0) {
            if (editIniciaisSpan) editIniciaisSpan.textContent = getIniciais(nome);
            if (editAvatarDiv) editAvatarDiv.style.background = corAvatar(nome);
            if (editIcon) editIcon.style.display = 'none';
        } else {
            if (editIniciaisSpan) editIniciaisSpan.textContent = '';
            if (editAvatarDiv) editAvatarDiv.style.background = '#f1f1f1';
            if (editIcon) editIcon.style.display = '';
        }
    }

    if (editNomeInput && editAvatarDiv && editIniciaisSpan) {
        editNomeInput.addEventListener('input', atualizarAvatarEdicao);
        atualizarAvatarEdicao();
    }

    // Atualiza avatar ao abrir modal de edição
    window.atualizarAvatarEdicao = atualizarAvatarEdicao;
});

function renderizarFuncionarios(lista) {
    const container = document.getElementById("product-list");
    container.innerHTML = `
    <thead>
    <tr>
        <th style="width:48px"></th>
        <th>Código</th>
        <th>Nome</th>
        <th>Cargo</th>
        <th>Email</th>
        <th>Status</th>
        <th></th>
    </tr>
    </thead>
    <tbody>
    ${lista
        .map(
            (f, idx) => `
        <tr tabindex="${idx + 1}">
            <td>
                <div style="
                    width:30px;height:30px;
                    border-radius:50%;
                    background:${corAvatar(f.nome)};
                    display:flex;align-items:center;justify-content:center;
                    font-weight:bold;font-size:12px;
                    color: rgba(0,0,0,0.65);
                    margin:0 auto;
                    ">
                    ${getIniciais(f.nome)}
                </div>
            </td>
            <td>${f.codigo}</td>
            <td>${f.nome}</td>
            <td>${f.cargo
                .toLowerCase()
                .replace(/(^|\s)\S/g, l => l.toUpperCase())}</td>
            <td>${f.email}</td>
            <td>
                <span style="
                    display:inline-block;
                    padding:${f.ativo ? '4px 12px' : '4px 8px'};
                    border-radius:12px;
                    font-size:12px;
                    color:#fff;
                    background:${f.ativo ? '#43b04a' : '#888'};
                ">
                    ${f.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td class="actions">
                <a href="javascript:void(0)" onclick="abrirEdicaoFuncionario('${f.id}')" title="Editar" tabindex="${lista.length + idx + 1}">
                    <i class="fa-solid fa-pen"></i>
                </a>
                <button type="button" onclick="removerFuncionario('${f.id}')" title="Excluir" tabindex="${2 * lista.length + idx + 1}"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `
        )
        .join("")}
    </tbody>
    `;
}

function filtrar() {
    const codigo = document.getElementById("filter-codigo").value;
    const nome = document.getElementById("filter-nome").value;
    const cargo = document.getElementById("filter-cargo").value;
    const email = document.getElementById("filter-email").value;
    const status = document.getElementById("filter-status").value;

    const filtrados = funcionarios.filter(
        (f) =>
            (codigo === "" || f.codigo.includes(codigo)) &&
            (nome === "" || f.nome.toLowerCase().includes(nome.toLowerCase())) &&
            (cargo === "" || f.cargo.toLowerCase().includes(cargo.toLowerCase())) &&
            (email === "" || f.email.toLowerCase().includes(email.toLowerCase())) &&
            (status === "" || (status === "ativo" ? f.ativo : !f.ativo))
    );

    let msgDiv = document.getElementById("no-results-msg");
    if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.id = "no-results-msg";
    msgDiv.style.textAlign = "center";
    msgDiv.style.padding = "0 0 10px 0";
    msgDiv.style.color = "#888";
    msgDiv.style.fontSize = "16px";
    document.querySelector(".main-container .table-space").appendChild(msgDiv);
    }

    if (filtrados.length === 0) {
    document.getElementById("product-list").style.display = "none";
    msgDiv.textContent = "Nenhum funcionário encontrado com os filtros selecionados.";
    msgDiv.style.display = "block";
    } else {
    document.getElementById("product-list").style.display = "";
    msgDiv.style.display = "none";
    renderizarFuncionarios(filtrados);
    }

    document.querySelector('.main-container').style.borderTopLeftRadius = "0";
    document.querySelector('.main-container').style.borderTopRightRadius = "0";
}

function removerFuncionario(id) {
    const funcionario = funcionarios.find(f => f.id == id);
    if (!funcionario) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Funcionário não encontrado',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }
    Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não poderá ser desfeita',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/usuarios/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        carregarFuncionarios();
                        Swal.fire({
                            title: `Funcionário ${funcionario.nome} removido!`,
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: true,
                            allowOutsideClick: false
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro!',
                            text: 'Não foi possível remover o funcionário',
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: true,
                            allowOutsideClick: false
                        });
                    }
                });
        }
    });
}

function limpar() {
    document.querySelectorAll(".filters input, .filters select").forEach((el) => (el.value = ""));
    carregarFuncionarios();
}

renderizarFuncionarios(funcionarios);

//gera senha
function gerarSenhaProvisoria() {
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
let senha = '';
for (let i = 0; i < 8; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
}
document.getElementById('cad-senha').value = senha;
}
function abrirCadastroFuncionario() {
    document.getElementById('cadastro-funcionario').style.display = 'flex';
    document.body.style.overflow = 'hidden';
gerarSenhaProvisoria();
}
function fecharCadastroFuncionario() {
    document.getElementById('cadastro-funcionario').style.display = 'none';
    document.body.style.overflow = '';
}
function cadastrarFuncionario() {
    const funcionario = {
        codigo: document.getElementById('cad-codigo').value,
        nome: document.getElementById('cad-nome').value,
        cargo: document.getElementById('cad-cargo').value,
        email: document.getElementById('cad-email').value,
        senha: document.getElementById('cad-senha').value,
        cpf: document.getElementById('cad-cpf').value,
        dataNascimento: document.getElementById('cad-nascimento').value,
        telefone: document.getElementById('cad-contato').value,
        ativo: true
    };

    fetch('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(funcionario)
    })
    .then(res => {
        if (res.ok) {
            Swal.fire({
                title: `Funcionário ${funcionario.nome} cadastrado!`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            fecharCadastroFuncionario();
            carregarFuncionarios();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Não foi possível cadastrar o funcionário',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false
            });
        }
    });
}


//editar funcionario
function abrirEdicaoFuncionario(id) {
    const funcionario = funcionarios.find(f => f.id == id);
    document.getElementById('edit-id').value = funcionario.id;

    document.body.style.overflow = 'hidden';
    aplicarEstiloInputs();

    fetch(`/usuarios/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(funcionario => {
        // Preenche os campos do form
        document.getElementById('edit-codigo').value = funcionario.codigo;
        document.getElementById('edit-nome').value = funcionario.nome;
        document.getElementById('edit-cargo').value = funcionario.cargo;
        document.getElementById('edit-email').value = funcionario.email;
        document.getElementById('edit-senha').value = funcionario.senha;
        document.getElementById('edit-cpf').value = funcionario.cpf;
        document.getElementById('edit-contato').value = funcionario.telefone || '';
        document.getElementById('edit-nascimento').value = funcionario.dataNascimento
            ? funcionario.dataNascimento.substring(0, 10)
            : '';
        document.getElementById('edit-ativo').checked = funcionario.ativo ?? true; // true por padrão
        document.getElementById('label-ativo').textContent = funcionario.ativo ? 'Ativo' : 'Inativo';

        const label = document.getElementById('label-ativo');
        label.classList.toggle('ativo', funcionario.ativo);
        label.classList.toggle('inativo', !funcionario.ativo);
        
        // Atualiza o avatar de edição imediatamente com o nome já preenchido
        if (window.atualizarAvatarEdicao) {
            window.atualizarAvatarEdicao();
        }

        // Mostra o modal de edição
        document.getElementById('editar-funcionario').style.display = 'flex';
    });
}

function fecharEdicaoFuncionario() {
    document.getElementById('editar-funcionario').style.display = 'none';
    document.body.style.overflow = '';
}
function salvarEdicaoFuncionario() {
    const id = document.getElementById('edit-id').value;
    // const funcionario = funcionarios.find(f => f.id == id);

    const funcionarioObj = {
        codigo: document.getElementById('edit-codigo').value,
        nome: document.getElementById('edit-nome').value,
        cargo: document.getElementById('edit-cargo').value,
        email: document.getElementById('edit-email').value,
        senha: document.getElementById('edit-senha').value,
        cpf: document.getElementById('edit-cpf').value,
        dataNascimento: document.getElementById('edit-nascimento').value,
        telefone: document.getElementById('edit-contato').value,
        ativo: document.getElementById('edit-ativo').checked
    };

    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/usuarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funcionarioObj)
            })
            .then(res => {
                if (res.ok) {
                    Swal.fire({
                        title: "Alterações salvas!",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,
                        allowOutsideClick: false
                    });
                    carregarFuncionarios();
                    fecharEdicaoFuncionario();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: 'Não foi possível salvar as alterações.',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,
                        allowOutsideClick: false
                    });
                }
            });
        }
    });
}

//botao voltar ao topo
window.addEventListener('scroll', function() {
    const btn = document.getElementById('btn-topo');
    if (window.scrollY > 100) {
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('btn-topo');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

document.getElementById('edit-ativo').addEventListener('change', function() {
    document.getElementById('label-ativo').textContent = this.checked ? 'Ativo' : 'Inativo';
    document.getElementById('label-ativo').classList.toggle('ativo', this.checked);
    document.getElementById('label-ativo').classList.toggle('inativo', !this.checked);
});

// Sugestão de códigos igual ao estoque
const codigoInput = document.getElementById('filter-codigo');
const codigoGroup = codigoInput.closest('.input-group');
let sugestaoContainer = document.createElement('div');
sugestaoContainer.id = 'codigo-sugestoes';
codigoGroup.appendChild(sugestaoContainer);

codigoInput.addEventListener('input', function() {
    const termo = this.value.trim().toUpperCase();
    sugestaoContainer.innerHTML = '';
    if (!termo) {
        sugestaoContainer.style.display = 'none';
        filtrar();
        return;
    }
    const encontrados = funcionarios.filter(f => f.codigo.toUpperCase().includes(termo));
    if (encontrados.length === 0) {
        sugestaoContainer.style.display = 'none';
        filtrar();
        return;
    }
    encontrados.forEach(f => {
        const div = document.createElement('div');
        div.textContent = `${f.codigo} - ${f.nome}`;
        div.addEventListener('mousedown', function(e) {
            e.preventDefault();
            codigoInput.value = f.codigo;
            sugestaoContainer.style.display = 'none';
            filtrar();
        });
        sugestaoContainer.appendChild(div);
    });
    sugestaoContainer.style.display = 'block';
    filtrar();
});

document.addEventListener('mousedown', function(e) {
    if (!sugestaoContainer.contains(e.target) && e.target !== codigoInput) {
        sugestaoContainer.style.display = 'none';
    }
});

document.querySelectorAll('.filters input').forEach(el => {
    el.addEventListener('input', filtrar);
});
document.querySelectorAll('.filters select').forEach(el => {
    el.addEventListener('change', filtrar);
});

function carregarFuncionarios() {
    fetch('/usuarios')
        .then(res => res.json())
        .then(data => {
            funcionarios = data;
            renderizarFuncionarios(funcionarios);
        })
        .catch(() => {
            funcionarios = [];
            renderizarFuncionarios([]);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    carregarFuncionarios();
});


function togglePassword(inputId) {
    const senhaInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById('icon-' + inputId);
    if (senhaInput.type === "password") {
        senhaInput.type = "text";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    } else {
        senhaInput.type = "password";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    }
}

function aplicarEstiloInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.style.backgroundColor = 'white';
            } else {
                input.style.backgroundColor = '#f1f1f1';
            }
        });
    });

    const selects = document.querySelectorAll('select, input[type="date"]');
    selects.forEach(select => {
        select.addEventListener('focus', () => {
            select.style.backgroundColor = 'white';
        });
        select.addEventListener('blur', () => {
            if (select.value.trim() === '') {
                select.style.backgroundColor = 'white';
            } else {
                select.style.backgroundColor = '#f1f1f1';
            }
        });
    });
}
