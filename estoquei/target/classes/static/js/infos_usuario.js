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

function renderizarFuncionarios(lista) {
    const container = document.getElementById("product-list");
    container.innerHTML = `
    <thead>
    <tr>
        <th style="width:48px"></th>
        <th>Código</th>
        <th>Nome</th>
        <th>Cargo</th>
        <th>E-mail</th>
        <th>Status</th>
        <th>Ações</th>
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
            <td>${f.cargo}</td>
            <td>${f.email}</td>
            <td>
                <span style="
                    display:inline-block;
                    padding:2px 10px;
                    border-radius:12px;
                    font-size:12px;
                    color:#fff;
                    background:${f.ativo ? '#43b04a' : '#888'};
                ">
                    ${f.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td class="actions">
                <a href="javascript:void(0)" onclick="abrirEdicaoFuncionario('${f.codigo}')" title="Editar" tabindex="${lista.length + idx + 1}">
                    <i class="fa-solid fa-pen"></i>
                </a>
                <button type="button" onclick="removerFuncionario('${f.codigo}')" title="Excluir" tabindex="${2 * lista.length + idx + 1}"><i class="fa-solid fa-trash"></i></button>
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

function removerFuncionario(codigo) {
    Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não poderá ser desfeita.',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/usuarios/${codigo}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        carregarFuncionarios();
                        Swal.fire({
                            title: "Funcionário removido!",
                            icon: "success",
                            showCloseButton: true,
                            showCancelButton: true,
                            showConfirmButton: true,
                            confirmButtonText: 'Visualizar Funcionários',
                            cancelButtonText: 'Voltar para Início',
                            allowOutsideClick: false,
                            customClass: {
                                confirmButton: 'swal2-confirm-custom',
                                cancelButton: 'swal2-cancel-custom'
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Apenas fecha o alerta, já está na tela de funcionários
                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                window.location.href = "/inicio";
                            }
                        });
                    } else {
                        Swal.fire('Erro!', 'Não foi possível remover o funcionário.', 'error');
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
gerarSenhaProvisoria();
}
function fecharCadastroFuncionario() {
document.getElementById('cadastro-funcionario').style.display = 'none';
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
                title: 'Funcionário cadastrado!',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            fecharCadastroFuncionario();
            carregarFuncionarios();
        } else {
            Swal.fire('Erro!', 'Não foi possível cadastrar o funcionário.', 'error');
        }
    });
}


//editar funcionario
function abrirEdicaoFuncionario(codigo) {
    const funcionario = funcionarios.find(f => f.codigo === codigo);
    const id = funcionario.id;

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
        document.getElementById('label-ativo').style.color = funcionario.ativo ? '#43b04a' : '#888';


        // Mostra o modal de edição
        document.getElementById('editar-funcionario').style.display = 'flex';
    });
}

function fecharEdicaoFuncionario() {
    document.getElementById('editar-funcionario').style.display = 'none';
}
function salvarEdicaoFuncionario() {
    const codigo = document.getElementById('edit-codigo').value;
    const funcionario = funcionarios.find(f => f.codigo === codigo);
    const id = funcionario.id;

    const funcionarioObj = {
        codigo: codigo, // adicione se o backend espera
        nome: document.getElementById('edit-nome').value,
        cargo: document.getElementById('edit-cargo').value,
        email: document.getElementById('edit-email').value,
        senha: document.getElementById('edit-senha').value, // adicione a senha
        cpf: document.getElementById('edit-cpf').value,
        dataNascimento: document.getElementById('edit-nascimento').value,
        telefone: document.getElementById('edit-contato').value,
        ativo: document.getElementById('edit-ativo').checked
    };

    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas.',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom'
        }
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
                    Swal.fire('Erro!', 'Não foi possível salvar as alterações.', 'error');
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
    document.getElementById('label-ativo').style.color = this.checked ? '#43b04a' : '#888';
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

// Carrega informações do usuário logado e preenche os campos
document.addEventListener('DOMContentLoaded', function() {
    fetch('/usuarios')
        .then(res => res.json())
        .then(usuario => {
            if (!usuario) return;
            document.getElementById('info-nome').value = usuario.nome || '';
            document.getElementById('info-email').value = usuario.email || '';
            document.getElementById('info-cargo').value = usuario.cargo || usuario.tipo || '';
            document.getElementById('info-status').value = usuario.ativo ? 'Ativo' : 'Inativo';
        });

    // Redefinir senha (apenas exemplo de alerta)
    document.getElementById('redefinir-senha').addEventListener('click', function(e) {
        e.preventDefault();
        Swal.fire({
            title: 'Redefinir senha',
            text: 'Um link de redefinição será enviado para seu e-mail.',
            icon: 'info',
            confirmButtonText: 'OK',
            customClass: { confirmButton: 'swal2-confirm-custom' }
        });
    });
});


