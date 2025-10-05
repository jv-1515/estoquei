function exibirTamanho(tamanho) {
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
}
function formatarData(data) {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
}

function atualizarBotaoSelecionados() {
    const selecionados = document.querySelectorAll('.check-produto:checked').length;
    document.querySelector('.btn').innerHTML = `(${selecionados}) Selecionados`;
}

document.addEventListener('change', function(e) {
    if (e.target.classList.contains('check-produto') || e.target.id === 'check-all') {
        atualizarBotaoSelecionados();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.getElementById('removidos-table-body');
    // Skeleton loading: 3 linhas, 12 colunas
    const skeletonRow = () => {
        return `<tr class='skeleton-table-row'>${Array(12).fill('').map((_,i) => `<td class='skeleton-cell'><div class='skeleton-bar'></div></td>`).join('')}</tr>`;
    };
    tbody.innerHTML = Array(5).fill('').map(skeletonRow).join('');

    fetch('/produtos/removidos')
        .then(res => res.json())
        .then(produtos => renderizarRemovidos(produtos));

    function renderizarRemovidos(produtos) {
        const tbody = document.getElementById('removidos-table-body');
        if (!produtos.length) {
            const thead = document.querySelector('#removidos-list thead');
            if (thead) thead.style.display = 'none';
            const registrosSelect = document.querySelector('#registros-select');
            if (registrosSelect) registrosSelect.parentElement.style.display = 'none';
        
            const btnSelecionados = document.querySelector('.btn');
            if (btnSelecionados) btnSelecionados.style.display = 'none';
        
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center; padding: 0 0 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold; margin-top: 10px">Nenhum produto na lixeira</span>
                            <span>Alguém já tirou o lixo</span>
                            <img src="/images/sem_removidos.png" alt="Sem produtos removidos" style="width:400px;">
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Aguarda todas as imagens carregarem antes de renderizar as linhas
        const promessasImagens = produtos.map(produto => {
            return new Promise(resolve => {
                if (produto.url_imagem) {
                    const img = new Image();
                    img.src = produto.url_imagem;
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                } else {
                    resolve();
                }
            });
        });

        Promise.all(promessasImagens).then(() => {
            tbody.innerHTML = '';
            produtos.forEach(produto => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="width: 30px; max-width: 30px; padding-left:20px">
                        ${produto.url_imagem
                            ? `<img src="${produto.url_imagem}" alt="${produto.descricao || 'Foto do produto'}" class="produto-img">`
                            : `<span class="produto-img icon" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:#f5f5f5;border-radius:6px;color:#bbb;font-size:18px;">
                                <i class="fa-regular fa-image"></i>
                            </span>`
                        }
                    </td>
                    <td>${produto.codigo || '-'}</td>
                    <td>${produto.nome || '-'}</td>
                    <td>${capitalize(produto.categoria) || '-'}</td>
                    <td>${exibirTamanho(produto.tamanho) || '-'}</td>
                    <td>${capitalize(produto.genero) || '-'}</td>
                    <td>${produto.preco ? 'R$ ' + Number(produto.preco).toFixed(2).replace('.', ',') : '-'}</td>
                    <td>${produto.quantidade ?? '-'}</td>
                    <td>${produto.limiteMinimo ?? '-'}</td>
                    <td>${formatarData(produto.dataExclusao) || '-'}</td>
                    <td>${produto.responsavelExclusao || '-'}</td>
                    <td style="text-align: right; padding-right:20px" class="actions">
                        <button class="btn-reverter" data-id="${produto.id}" title="Restaurar">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                        <button class="btn-excluir-definitivo" data-id="${produto.id}" data-nome="${produto.nome || ''}" title="Excluir">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                        <input type="checkbox" class="check-produto" data-id="${produto.id}">
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Excluir múltiplos
            document.querySelector('.btn').onclick = function() {
                const selecionados = Array.from(document.querySelectorAll('.check-produto:checked'));
                if (!selecionados.length || selecionados.length === 1) return;
            
                Swal.fire({
                    title: `${selecionados.length} produtos selecionados`,
                    text: 'Selecione uma opção',
                    icon: 'question',
                    showCancelButton: true,
                    showCloseButton: true,
                    confirmButtonText: 'Remover todos',
                    cancelButtonText: 'Restaurar todos',
                    customClass: {
                        confirmButton: 'swal2-remove-custom',
                        cancelButton: 'swal2-cancel-custom'
                    }
                }).then(result => {
                    if (result.isConfirmed) {
                        const produtosSelecionados = selecionados.map(cb => {
                            const tr = cb.closest('tr');
                            const nome = tr.querySelector('td:nth-child(3)').textContent || 'produto';
                            const quantidade = Number(tr.querySelector('td:nth-child(8)').textContent) || 0;
                            return { id: cb.dataset.id, nome, quantidade };
                        });
                        const algumComQuantidade = produtosSelecionados.some(p => p.quantidade > 0);
            
                        if (algumComQuantidade) {
                            const totalUnidades = produtosSelecionados.reduce((soma, p) => soma + (p.quantidade > 0 ? p.quantidade : 0), 0);
                            const plural = totalUnidades > 1;
                            Swal.fire({
                                icon: 'warning',
                                title: `${selecionados.length} produtos selecionados`,
                                html: `No total, <strong>${totalUnidades} unidade${plural ? 's' : ''}</strong> ${plural ? 'serão excluídas' : 'será excluída'}. Esta ação é permanente`,
                                showCancelButton: true,
                                confirmButtonText: 'Excluir todos',
                                cancelButtonText: 'Cancelar',
                                customClass: {
                                    confirmButton: 'swal2-remove-custom',
                                    cancelButton: 'swal2-cancel-custom'
                                },
                                allowOutsideClick: false
                            }).then((res) => {
                                if (res.isConfirmed) {
                                    Swal.fire({
                                        title: 'Excluindo produtos...',
                                        text: 'Aguarde enquanto os produtos são excluídos',
                                        icon: 'info',
                                        showConfirmButton: false,
                                        timer: 1800,
                                        timerProgressBar: true,
                                        didOpen: () => {
                                            Swal.showLoading();
                                            Promise.all(produtosSelecionados.map(p =>
                                                fetch(`/produtos/excluir/${p.id}`, { method: 'DELETE' })
                                            )).then(() => location.reload());
                                        }
                                    });
                                }
                            });
                        } else {
                            // Todos com quantidade 0: mostra "Removendo..." com cancelar durante o tempo
                            let cancelado = false;
                            Swal.fire({
                                title: `Removendo ${selecionados.length} produtos...`,
                                text: 'Os produtos serão excluídos definitivamente',
                                icon: 'info',
                                showCancelButton: true,
                                showConfirmButton: false,
                                cancelButtonText: 'Cancelar',
                                customClass: {
                                    cancelButton: 'swal2-remove-custom'
                                },
                                allowOutsideClick: false,
                                timer: 3000,
                                timerProgressBar: true,
                                didOpen: () => {
                                    const cancelBtn = Swal.getCancelButton();
                                    if (cancelBtn) {
                                        cancelBtn.style.width = '90px';
                                        cancelBtn.style.maxWidth = '90px';
                                        cancelBtn.style.border = 'none';
                                    }
                                    const swalTimer = setTimeout(() => {
                                        if (!cancelado) {
                                            Promise.all(produtosSelecionados.map(p =>
                                                fetch(`/produtos/excluir/${p.id}`, { method: 'DELETE' })
                                            )).then(() => location.reload());
                                        }
                                    }, 3000);
            
                                    Swal.getCancelButton().onclick = () => {
                                        cancelado = true;
                                        clearTimeout(swalTimer);
                                        Swal.close();
                                    };
                                }
                            });
                        }
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        // Confirmação para restaurar todos (mantém igual)
                        Swal.fire({
                            title: `${selecionados.length} produtos serão restaurados`,
                            icon: 'info',
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            timer: 2500,
                            timerProgressBar: true,
                            didOpen: () => {
                                Swal.showLoading();
                                Promise.all(selecionados.map(cb =>
                                    fetch(`/produtos/restaurar/${cb.dataset.id}`, { method: 'PUT' })
                                )).then(() => {
                                    setTimeout(() => location.reload(), 2500);
                                });
                            }
                        });
                    }
                });
            };
            // Excluir individual
            document.querySelectorAll('.btn-excluir-definitivo').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.getAttribute('data-id');
                    const nome = this.getAttribute('data-nome') || 'produto';
                    const tr = this.closest('tr');
                    const quantidade = tr ? Number(tr.querySelector('td:nth-child(8)').textContent) : 0;
                    excluirProdutoDefinitivo(id, nome, quantidade);
                });
            });

            // RESTAURAR INDIVIDUAL
            document.querySelectorAll('.btn-reverter').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.getAttribute('data-id');
                    const nome = this.closest('tr').querySelector('td:nth-child(3)').textContent || 'produto';
                    Swal.fire({
                        title: `"${nome}" será restaurado`,
                        icon: 'info',
                        showConfirmButton: false,
                        timer: 1800,
                        timerProgressBar: true,
                        didOpen: () => {
                            Swal.showLoading();
                            fetch(`/produtos/restaurar/${id}`, { method: 'PUT' })
                                .then(res => {
                                    if (res.ok) {
                                        Swal.fire({
                                            title: `Produto "${nome}" restaurado!`,
                                            icon: 'success',
                                            showConfirmButton: false,
                                            timer: 1500,
                                            timerProgressBar: true
                                        }).then(() => location.reload());
                                    } else {
                                        Swal.fire('Erro ao restaurar produto.', '', 'error');
                                    }
                                })
                                .catch(() => {
                                    Swal.fire('Erro ao restaurar produto.', '', 'error');
                                });
                        }
                    });
                });
            });

        });
    }


document.getElementById('check-all').addEventListener('change', function() {
    document.querySelectorAll('.check-produto').forEach(cb => cb.checked = this.checked);
});

document.addEventListener('change', function(e) {
    if (e.target.classList.contains('check-produto')) {
        const allChecks = document.querySelectorAll('.check-produto');
        const allChecked = Array.from(allChecks).every(cb => cb.checked);
        document.getElementById('check-all').checked = allChecked;
    }
});

function excluirProdutoDefinitivo(id, nome, quantidade) {
    const nomeProduto = nome || 'produto';
    if (quantidade > 0) {
        const unidadeTexto = quantidade === 1 ? 'unidade' : 'unidades';
        Swal.fire({
            title: `Excluir "${nomeProduto}"?`,
            html: `Este produto possui <strong>${quantidade} ${unidadeTexto}</strong>. Esta ação é permanente`,
            icon: 'warning',
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: 'Excluir',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'swal2-remove-custom',
                cancelButton: 'swal2-cancel-custom'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `Excluindo "${nomeProduto}"`,
                    text: 'O produto será excluído definitivamente.',
                    icon: 'info',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    timer: 1800,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        fetch('/produtos/excluir/' + id, { method: 'DELETE' })
                            .then(response => {
                                if (response.ok) {
                                    Swal.fire({
                                        title: `Produto "${nomeProduto}" excluído!`,
                                        icon: 'success',
                                        showConfirmButton: false,
                                        timer: 1500,
                                        timerProgressBar: true
                                    }).then(() => location.reload());
                                } else {
                                    Swal.fire({
                                        title: 'Erro!',
                                        text: `Não foi possível excluir ${nomeProduto}. Tente novamente`,
                                        icon: 'error',
                                        showConfirmButton: false,
                                        allowOutsideClick: false,
                                        timer: 1500,
                                    });
                                }
                            });
                    }
                });
            }
        });
    } else {
            Swal.fire({
                title: `Removendo "${nomeProduto}"`,
                text: 'O produto será excluído definitivamente',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                    fetch('/produtos/excluir/' + id, { method: 'DELETE' })
                        .then(response => {
                            if (response.ok) {
                                Swal.fire({
                                    title: `Produto "${nomeProduto}" excluído!`,
                                    icon: 'success',
                                    showConfirmButton: false,
                                    timer: 1500,
                                    timerProgressBar: true
                                }).then(() => location.reload());
                            } else {
                                Swal.fire({
                                    title: 'Erro!',
                                    text: `Não foi possível excluir ${nomeProduto}. Tente novamente`,
                                    icon: 'error',
                                    showConfirmButton: false,
                                    allowOutsideClick: false,
                                    timer: 1500,
                                });
                            }
                        });
                }
            });
        }
    }
    
    function abrirConfirmacaoExclusao(id, nomeProduto) {
        Swal.fire({
            icon: 'warning',
            title: `Esta ação é irreversível!`,
            html: 'Digite <strong>EXCLUIR</strong> para confirmar:',
            input: 'text',
            inputValidator: (value) => {
                if (value !== 'EXCLUIR') return 'Digite exatamente: EXCLUIR';
            },
            showCloseButton: true,
            showConfirmButton: true,
            customClass: {
                confirmButton: 'swal2-remove-custom'
            },
            didOpen: () => {
                const input = Swal.getInput();
                if (input) {
                    input.style.fontSize = '12px';
                    input.style.margin = '10px 20px';
                    input.style.border = 'solid 1px #aaa';
                    input.style.borderRadius = '4px';
                }
            }
        }).then((res) => {
            if (res.isConfirmed) {
                Swal.fire({
                    title: `Excluindo "${nomeProduto}"`,
                    text: 'Aguarde enquanto o produto é excluído',
                    icon: 'info',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    timer: 1500,
                    didOpen: () => {
                        Swal.showLoading();
                        fetch('/produtos/excluir/' + id, { method: 'DELETE' })
                            .then(response => {
                                if (response.ok) {
                                    Swal.fire({
                                        title: `Produto "${nomeProduto}" excluído!`,
                                        icon: 'success',
                                        showConfirmButton: false,
                                        timer: 1500,
                                        timerProgressBar: true
                                    }).then(() => location.reload());
                                } else {
                                    Swal.fire({
                                        title: 'Erro!',
                                        text: `Não foi possível excluir ${nomeProduto}. Tente novamente`,
                                        icon: 'error',
                                        showConfirmButton: false,
                                        allowOutsideClick: false,
                                        timer: 1500,
                                    });
                                }
                            });
                    }
                });
            }
        });
    }
});