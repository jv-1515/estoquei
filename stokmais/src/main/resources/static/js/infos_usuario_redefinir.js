// document.addEventListener('DOMContentLoaded', function() {
//     const btnRedefinir = document.getElementById('btn-redefinir-senha');
//     const senhaFields = document.getElementById('senha-fields');
//     const form = document.querySelector('.form-container');

//     if (btnRedefinir && senhaFields) {
//         btnRedefinir.addEventListener('click', function() {
//             senhaFields.style.display = senhaFields.style.display === 'none' ? 'flex' : 'none';
//             if (senhaFields.style.display === 'flex') {
//                 btnRedefinir.textContent = 'Cancelar';
//                 btnRedefinir.style.backgroundColor = '#fff';
//                 btnRedefinir.style.color = '#1e94a3';
//                 btnRedefinir.style.border = '1px solid #1e94a3';
                
//             } else {
//                 btnRedefinir.textContent = 'Redefinir senha';
//                 btnRedefinir.style.backgroundColor = '';
//                 btnRedefinir.style.color = '';
//                 btnRedefinir.style.border = '';
//                 senhaFields.querySelectorAll('input').forEach(i => i.value = '');
//             }
//         });
//     }

//     if (form) {
//         form.addEventListener('submit', function(e) {
//             if (senhaFields.style.display === 'flex') {
//                 const atual = document.getElementById('senha-atual').value;
//                 const nova = document.getElementById('nova-senha').value;
//                 const confirmar = document.getElementById('confirmar-nova-senha').value;
//                 if (!atual || !nova || !confirmar) {
//                     e.preventDefault();
//                     Swal.fire('Atenção', 'Preencha todos os campos de senha.', 'warning');
//                     return;
//                 }
//                 if (nova.length < 8) {
//                     e.preventDefault();
//                     Swal.fire('Atenção', 'A nova senha deve ter pelo menos 8 caracteres.', 'warning');
//                     return;
//                 }
//                 if (nova !== confirmar) {
//                     e.preventDefault();
//                     Swal.fire('Atenção', 'A confirmação da nova senha não confere.', 'warning');
//                     return;
//                 }
//             }
//         });
//     }
// });
