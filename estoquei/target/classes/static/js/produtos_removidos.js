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

document.addEventListener('DOMContentLoaded', function() {
    fetch('/produtos/removidos')
        .then(res => res.json())
        .then(produtos => renderizarRemovidos(produtos));

    function renderizarRemovidos(produtos) {
        const tbody = document.getElementById('removidos-table-body');
        tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 10px; color: #888; font-size: 16px; background-color: white">Carregando produtos...</td></tr>`;
        if (!produtos.length) {
            tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 10px; color: #888; font-size: 16px; background-color: white">Nenhum produto na lixeira</td></tr>`;
            return;
        }
        
        tbody.innerHTML = '';

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
                if (!selecionados.length) {
                    return;
                }
                excluirProdutosDefinitivos(selecionados.map(cb => cb.dataset.id));
            };

            // Excluir individual
            document.querySelectorAll('.btn-excluir-definitivo').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.getAttribute('data-id');
                    const nome = this.getAttribute('data-nome') || 'produto';
                    excluirProdutoDefinitivo(id, nome);
                });
            });

            // RESTAURAR INDIVIDUAL
            document.querySelectorAll('.btn-reverter').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.getAttribute('data-id');
                    const nome = this.closest('tr').querySelector('td:nth-child(3)').textContent || 'produto';
                    Swal.fire({
                        title: `Restaurar "${nome}"?`,
                        text: 'O produto voltará para o estoque',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Restaurar',
                        cancelButtonText: 'Cancelar'
                    }).then(result => {
                        if (result.isConfirmed) {
                            fetch(`/produtos/restaurar/${id}`, { method: 'PUT' })
                                .then(res => {
                                    if (res.ok) location.reload();
                                    else Swal.fire('Erro ao restaurar produto.', '', 'error');
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

    function excluirProdutoDefinitivo(id, nome) {
        const nomeProduto = nome || 'produto';
        Swal.fire({
            title: `Excluir "${nomeProduto}"?`,
            text: 'Esta ação é permanente',
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
                fetch('/produtos/excluir/' + id, {
                    method: 'DELETE'
                }).then(response => {
                    if (response.ok) {
                        Swal.fire({
                            title: `Excluindo ${nomeProduto}...`,
                            text: 'Aguarde enquanto o produto é excluído.',
                            icon: 'info',
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            timer: 1500,
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Erro!',
                            text: `Não foi possível excluir ${nomeProduto}. Tente novamente.`,
                            icon: 'error',
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            timer: 1500,
                        });
                    }
                }).catch(error => {
                    console.error('Erro ao excluir produto:', error);
                    Swal.fire({
                        title: 'Erro de Conexão!',
                        text: `Não foi possível se conectar ao servidor para excluir "${nomeProduto}"`,
                        icon: 'error',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        timer: 1500
                    });
                });
            }
        });
    }

    function excluirProdutosDefinitivos(ids) {
        Swal.fire({
            title: `Excluir ${ids.length} produto(s) selecionado(s)?`,
            text: 'Esta ação é permanente',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Excluir',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                Promise.all(ids.map(id =>
                    fetch(`/produtos/excluir/${id}`, { method: 'DELETE' })
                )).then(() => location.reload());
            }
        });
    }
});