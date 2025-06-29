const funcionarios = [
    {
        codigo: "F00001",
        nome: "Ana Souza",
        cargo: "Gerente",
        email: "ana.souza@email.com",
        senha: "Abc12345",
        cpf: "123.456.789-00",
        nascimento: "1985-04-12",
        contato: "(11)91234-5678",
        ativo: true
    },
    {
        codigo: "F00002",
        nome: "Carlos Lima",
        cargo: "Vendedor",
        email: "carlos.lima@email.com",
        senha: "Xyz98765",
        cpf: "234.567.890-11",
        nascimento: "1990-08-25",
        contato: "(21)99876-5432",
        ativo: true
    },
    {
        codigo: "F00003",
        nome: "Mariana Silva",
        cargo: "Caixa",
        email: "mariana.silva@email.com",
        senha: "Qwe45678",
        cpf: "345.678.901-22",
        nascimento: "1995-12-10",
        contato: "(31)93456-7890",
        ativo: false
    },
    {
        codigo: "F00004",
        nome: "João Pedro",
        cargo: "Estoquista",
        email: "joao.pedro@email.com",
        senha: "Zxc32109",
        cpf: "456.789.012-33",
        nascimento: "1988-02-18",
        contato: "(41)97654-3210",
        ativo: true
    },
    {
        codigo: "F00005",
        nome: "Fernanda Costa",
        cargo: "Vendedor",
        email: "fernanda.costa@email.com",
        senha: "Mnb65432",
        cpf: "567.890.123-44",
        nascimento: "1992-06-30",
        contato: "(51)96543-2109",
        ativo: false
    }
];

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

    const filtrados = funcionarios.filter(
    (f) =>
        (codigo === "" || f.codigo.includes(codigo)) &&
        (nome === "" || f.nome.toLowerCase().includes(nome.toLowerCase())) &&
        (cargo === "" || f.cargo.toLowerCase().includes(cargo.toLowerCase())) &&
        (email === "" || f.email.toLowerCase().includes(email.toLowerCase()))
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
            // Remove o funcionário do array
            const idx = funcionarios.findIndex(f => f.codigo === codigo);
            if (idx !== -1) {
                funcionarios.splice(idx, 1);
                renderizarFuncionarios(funcionarios);
            }
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
        }
    });
}

function limpar() {
    document.querySelectorAll(".filters input, .filters select").forEach((el) => (el.value = ""));
    renderizarFuncionarios(funcionarios);
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
// enviar os dados do formulário
Swal.fire({
    title: 'Funcionário cadastrado!',
    icon: 'success',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    allowOutsideClick: false
});
fecharCadastroFuncionario();
}


//editar funcionario
function abrirEdicaoFuncionario(codigo) {
    const funcionario = funcionarios.find(f => f.codigo === codigo);
    if (!funcionario) return;

    // Preenche os campos do form
    document.getElementById('edit-codigo').value = funcionario.codigo;
    document.getElementById('edit-nome').value = funcionario.nome;
    document.getElementById('edit-cargo').value = funcionario.cargo;
    document.getElementById('edit-email').value = funcionario.email;
    document.getElementById('edit-senha').value = funcionario.senha;
    document.getElementById('edit-cpf').value = funcionario.cpf;
    document.getElementById('edit-nascimento').value = funcionario.nascimento;
    document.getElementById('edit-contato').value = funcionario.contato;
    document.getElementById('edit-ativo').checked = funcionario.ativo ?? true; // true por padrão
    document.getElementById('label-ativo').textContent = funcionario.ativo ? 'Ativo' : 'Inativo';
    document.getElementById('label-ativo').style.color = funcionario.ativo ? '#43b04a' : '#888';


    // Mostra o modal de edição
    document.getElementById('editar-funcionario').style.display = 'flex';
}

function fecharEdicaoFuncionario() {
    document.getElementById('editar-funcionario').style.display = 'none';
}
function salvarEdicaoFuncionario() {
    const codigo = document.getElementById('edit-codigo').value;
    const nome = document.getElementById('edit-nome').value;
    const cargo = document.getElementById('edit-cargo').value;
    const email = document.getElementById('edit-email').value;
    const ativo = document.getElementById('edit-ativo').checked;

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
        const idx = funcionarios.findIndex(f => f.codigo === codigo);
        if (idx !== -1) {
        funcionarios[idx].nome = nome;
        funcionarios[idx].cargo = cargo;
        funcionarios[idx].email = email;
        funcionarios[idx].ativo = ativo;

        Swal.fire({
            title: "Alterações salvas!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        renderizarFuncionarios(funcionarios);
        fecharEdicaoFuncionario();
        } else {
        Swal.fire('Erro!', 'Funcionário não encontrado.', 'error');
        }
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

