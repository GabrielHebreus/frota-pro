// Gerenciamento de motoristas
class MotoristasManager {
    constructor() {
        this.motoristas = this.carregarDoLocalStorage();
    }

    // Carregar dados do localStorage
    carregarDoLocalStorage() {
        const dados = localStorage.getItem('motoristas');
        if (dados) {
            return JSON.parse(dados);
        } else {
            // Dados de exemplo
            const motoristasExemplo = [
                {
                    id: '1',
                    nome: 'João Silva',
                    cpf: '12345678901',
                    telefone: '11999999999',
                    cnh: '12345678901',
                    categoriaCnh: 'C',
                    vtDiario: 9.00,
                    ativo: true,
                    timestamp: new Date().toISOString()
                },
                {
                    id: '2',
                    nome: 'Carlos Santos',
                    cpf: '10987654321',
                    telefone: '11888888888',
                    cnh: '98765432109',
                    categoriaCnh: 'D',
                    vtDiario: 9.00,
                    ativo: true,
                    timestamp: new Date().toISOString()
                }
            ];
            this.salvarNoLocalStorage(motoristasExemplo);
            return motoristasExemplo;
        }
    }

    // Salvar dados no localStorage
    salvarNoLocalStorage(dados = this.motoristas) {
        localStorage.setItem('motoristas', JSON.stringify(dados));
    }

    // Adicionar novo motorista
    adicionar(motorista) {
        // Verificar se CPF já existe
        if (this.motoristas.some(m => m.cpf === motorista.cpf)) {
            throw new Error('CPF já cadastrado!');
        }

        const novoMotorista = {
            id: Date.now().toString(),
            nome: motorista.nome,
            cpf: motorista.cpf,
            telefone: motorista.telefone || '',
            cnh: motorista.cnh,
            categoriaCnh: motorista.categoriaCnh,
            vtDiario: parseFloat(motorista.vtDiario) || 9.00,
            ativo: true,
            timestamp: new Date().toISOString()
        };

        this.motoristas.push(novoMotorista);
        this.salvarNoLocalStorage();
        return novoMotorista;
    }

    // Remover motorista (inativar)
    remover(id) {
        const index = this.motoristas.findIndex(m => m.id === id);
        if (index !== -1) {
            this.motoristas[index].ativo = false;
            this.salvarNoLocalStorage();
        }
    }

    // Ativar motorista
    ativar(id) {
        const index = this.motoristas.findIndex(m => m.id === id);
        if (index !== -1) {
            this.motoristas[index].ativo = true;
            this.salvarNoLocalStorage();
        }
    }

    // Editar motorista
    editar(id, dadosAtualizados) {
        const index = this.motoristas.findIndex(m => m.id === id);
        if (index !== -1) {
            // Verificar se outro motorista já tem este CPF
            const cpfExistente = this.motoristas.some(m => 
                m.id !== id && m.cpf === dadosAtualizados.cpf
            );
            
            if (cpfExistente) {
                throw new Error('CPF já cadastrado em outro motorista!');
            }

            this.motoristas[index] = {
                ...this.motoristas[index],
                ...dadosAtualizados,
                vtDiario: parseFloat(dadosAtualizados.vtDiario) || 9.00
            };
            this.salvarNoLocalStorage();
            return this.motoristas[index];
        }
        return null;
    }

    // Obter motorista por ID
    obterPorId(id) {
        return this.motoristas.find(m => m.id === id);
    }

    // Obter motoristas ativos
    obterAtivos() {
        return this.motoristas.filter(m => m.ativo);
    }

    // Obter todos os motoristas
    obterTodos() {
        return this.motoristas.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    // Formatar CPF
    formatarCPF(cpf) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // Formatar telefone
    formatarTelefone(telefone) {
        const cleaned = telefone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return telefone;
    }

    // Validar CPF
    validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validar dígitos verificadores
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        
        let resto = soma % 11;
        let digito1 = resto < 2 ? 0 : 11 - resto;
        
        if (digito1 !== parseInt(cpf.charAt(9))) return false;
        
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        
        resto = soma % 11;
        let digito2 = resto < 2 ? 0 : 11 - resto;
        
        return digito2 === parseInt(cpf.charAt(10));
    }
}

// Classe para gerenciar a tabela de motoristas
class MotoristasTable {
    constructor() {
        this.motoristasManager = motoristasManager;
        this.filtrosAtivos = {};
        this.ordenacao = { campo: null, direcao: 'asc' };
        this.init();
    }

    init() {
        this.carregarTabela();
        this.vincularEventos();
        this.atualizarContadores();
    }

    // Vincular eventos
    vincularEventos() {
        // Filtros de período
        document.querySelectorAll('.periodo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selecionarPeriodo(e.target.dataset.periodo);
            });
        });

        // Filtros de colunas
        document.getElementById('filtroNome').addEventListener('input', (e) => {
            this.aplicarFiltro('nome', e.target.value);
        });

        document.getElementById('filtroCPF').addEventListener('input', (e) => {
            this.aplicarFiltro('cpf', e.target.value);
        });

        document.getElementById('filtroTelefone').addEventListener('input', (e) => {
            this.aplicarFiltro('telefone', e.target.value);
        });

        document.getElementById('filtroCNH').addEventListener('input', (e) => {
            this.aplicarFiltro('cnh', e.target.value);
        });

        document.getElementById('filtroStatus').addEventListener('change', (e) => {
            this.aplicarFiltro('status', e.target.value);
        });

        // Botão aplicar período personalizado
        document.getElementById('btnAplicarPeriodo').addEventListener('click', () => {
            this.aplicarPeriodoPersonalizado();
        });

        // Botão limpar filtros
        document.getElementById('btnLimparFiltros').addEventListener('click', () => {
            this.limparFiltros();
        });

        // Ordenação por coluna
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                this.ordenarPor(th.dataset.sort);
            });
        });

        // Ações dos botões
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-editar')) {
                this.editarMotorista(e.target.closest('.btn-editar').dataset.id);
            } else if (e.target.closest('.btn-inativar')) {
                this.inativarMotorista(e.target.closest('.btn-inativar').dataset.id);
            } else if (e.target.closest('.btn-ativar')) {
                this.ativarMotorista(e.target.closest('.btn-ativar').dataset.id);
            } else if (e.target.closest('.btn-excluir')) {
                this.excluirMotorista(e.target.closest('.btn-excluir').dataset.id);
            }
        });
    }

    // Carregar tabela com dados
    carregarTabela(dados = this.motoristasManager.obterTodos()) {
        const tbody = document.getElementById('motoristasBody');
        
        if (dados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-icon">👥</div>
                        <h3>Nenhum motorista encontrado</h3>
                        <p>Não há motoristas correspondentes aos filtros aplicados.</p>
                        <button class="btn btn-primary" onclick="motoristasTable.limparFiltros()">
                            🔄 Limpar Filtros
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = dados.map(motorista => `
            <tr>
                <td>
                    <div class="driver-info">
                        <div class="driver-avatar">${motorista.nome.charAt(0)}</div>
                        <div class="driver-details">
                            <div class="driver-name">${motorista.nome}</div>
                            <div class="driver-cnh">CNH: ${motorista.cnh} - ${motorista.categoriaCnh}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="uniform-field">${this.motoristasManager.formatarCPF(motorista.cpf)}</span>
                </td>
                <td>
                    <span class="uniform-field">${motorista.telefone ? this.motoristasManager.formatarTelefone(motorista.telefone) : '-'}</span>
                </td>
                <td>
                    <span class="uniform-field">${motorista.cnh}</span>
                </td>
                <td>R$ ${this.formatarMoeda(motorista.vtDiario)}</td>
                <td>
                    <span class="status-badge ${motorista.ativo ? 'status-active' : 'status-inactive'}">
                        ${motorista.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon btn-editar" data-id="${motorista.id}" title="Editar">
                        ✏️
                    </button>
                    ${motorista.ativo ? `
                        <button class="btn-icon btn-warning btn-inativar" data-id="${motorista.id}" title="Inativar">
                            🚫
                        </button>
                    ` : `
                        <button class="btn-icon btn-success btn-ativar" data-id="${motorista.id}" title="Ativar">
                            ✅
                        </button>
                    `}
                    <button class="btn-icon btn-danger btn-excluir" data-id="${motorista.id}" title="Excluir">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');

        this.atualizarContadores(dados.length);
    }

    // Aplicar filtros
    aplicarFiltro(campo, valor) {
        if (valor) {
            this.filtrosAtivos[campo] = valor.toLowerCase();
        } else {
            delete this.filtrosAtivos[campo];
        }
        
        this.filtrarEAplicar();
    }

    // Filtrar e aplicar todos os filtros
    filtrarEAplicar() {
        let dadosFiltrados = this.motoristasManager.obterTodos();

        // Aplicar filtros de colunas
        Object.keys(this.filtrosAtivos).forEach(campo => {
            const valorFiltro = this.filtrosAtivos[campo];
            dadosFiltrados = dadosFiltrados.filter(motorista => {
                const valorCampo = String(motorista[campo]).toLowerCase();
                return valorCampo.includes(valorFiltro);
            });
        });

        // Aplicar ordenação
        if (this.ordenacao.campo) {
            dadosFiltrados = this.ordenarDados(dadosFiltrados, this.ordenacao.campo, this.ordenacao.direcao);
        }

        this.carregarTabela(dadosFiltrados);
        this.atualizarInfoFiltros();
    }

    // Selecionar período
    selecionarPeriodo(periodo) {
        // Atualizar botões ativos
        document.querySelectorAll('.periodo-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-periodo="${periodo}"]`).classList.add('active');

        // Mostrar/ocultar filtro personalizado
        const filtroPersonalizado = document.getElementById('filtroPersonalizado');
        if (periodo === 'personalizado') {
            filtroPersonalizado.style.display = 'block';
        } else {
            filtroPersonalizado.style.display = 'none';
            
            // Aplicar filtro de período
            const hoje = new Date();
            let dataInicio;
            
            switch(periodo) {
                case 'hoje':
                    dataInicio = hoje;
                    break;
                case 'semana':
                    dataInicio = new Date(hoje);
                    dataInicio.setDate(hoje.getDate() - 7);
                    break;
                case 'mes':
                    dataInicio = new Date(hoje);
                    dataInicio.setMonth(hoje.getMonth() - 1);
                    break;
                default: // 'tudo'
                    this.filtrarEAplicar();
                    return;
            }
            
            this.aplicarFiltroPeriodo(dataInicio, hoje);
        }
    }

    // Aplicar período personalizado
    aplicarPeriodoPersonalizado() {
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        
        if (!dataInicio || !dataFim) {
            alert('Por favor, selecione ambas as datas.');
            return;
        }
        
        this.aplicarFiltroPeriodo(new Date(dataInicio), new Date(dataFim));
    }

    // Aplicar filtro de período
    aplicarFiltroPeriodo(dataInicio, dataFim) {
        this.filtrosAtivos.periodo = { dataInicio, dataFim };
        
        let dadosFiltrados = this.motoristasManager.obterTodos().filter(motorista => {
            const dataCadastro = new Date(motorista.timestamp);
            return dataCadastro >= dataInicio && dataCadastro <= dataFim;
        });

        // Aplicar outros filtros ativos
        Object.keys(this.filtrosAtivos).forEach(campo => {
            if (campo !== 'periodo') {
                const valorFiltro = this.filtrosAtivos[campo];
                dadosFiltrados = dadosFiltrados.filter(motorista => {
                    const valorCampo = String(motorista[campo]).toLowerCase();
                    return valorCampo.includes(valorFiltro);
                });
            }
        });

        // Aplicar ordenação
        if (this.ordenacao.campo) {
            dadosFiltrados = this.ordenarDados(dadosFiltrados, this.ordenacao.campo, this.ordenacao.direcao);
        }

        this.carregarTabela(dadosFiltrados);
        this.atualizarInfoFiltros();
    }

    // Ordenar dados
    ordenarDados(dados, campo, direcao) {
        return dados.sort((a, b) => {
            let valorA = a[campo];
            let valorB = b[campo];
            
            // Converter para número se for campo monetário
            if (campo === 'vtDiario') {
                valorA = parseFloat(valorA);
                valorB = parseFloat(valorB);
            }
            
            // Converter para string para outros campos
            if (typeof valorA === 'string') {
                valorA = valorA.toLowerCase();
                valorB = valorB.toLowerCase();
            }
            
            if (valorA < valorB) return direcao === 'asc' ? -1 : 1;
            if (valorA > valorB) return direcao === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Ordenar por coluna
    ordenarPor(campo) {
        // Atualizar indicadores visuais
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
        
        const thAtual = document.querySelector(`th[data-sort="${campo}"]`);
        
        // Alternar direção se for o mesmo campo
        if (this.ordenacao.campo === campo) {
            this.ordenacao.direcao = this.ordenacao.direcao === 'asc' ? 'desc' : 'asc';
        } else {
            this.ordenacao.campo = campo;
            this.ordenacao.direcao = 'asc';
        }
        
        thAtual.classList.add(`sorted-${this.ordenacao.direcao}`);
        
        // Aplicar ordenação
        this.filtrarEAplicar();
    }

    // Limpar todos os filtros
    limparFiltros() {
        // Limpar campos de filtro
        document.getElementById('filtroNome').value = '';
        document.getElementById('filtroCPF').value = '';
        document.getElementById('filtroTelefone').value = '';
        document.getElementById('filtroCNH').value = '';
        document.getElementById('filtroStatus').value = '';
        
        // Resetar período para "Tudo"
        this.selecionarPeriodo('tudo');
        
        // Limpar filtros ativos
        this.filtrosAtivos = {};
        
        // Recarregar tabela com todos os dados
        this.carregarTabela();
        this.atualizarInfoFiltros();
    }

    // Atualizar contadores
    atualizarContadores(totalFiltrado = null) {
        const totalRegistros = document.getElementById('totalRegistros');
        totalRegistros.textContent = totalFiltrado !== null ? totalFiltrado : this.motoristasManager.obterTodos().length;
    }

    // Atualizar informações de filtros
    atualizarInfoFiltros() {
        const registrosFiltrados = document.getElementById('registrosFiltrados');
        const totalFiltros = Object.keys(this.filtrosAtivos).length;
        
        if (totalFiltros > 0) {
            registrosFiltrados.textContent = `${totalFiltros} filtro(s) aplicado(s)`;
        } else {
            registrosFiltrados.textContent = '';
        }
    }

    // Ações dos botões
    editarMotorista(id) {
        const motorista = this.motoristasManager.obterPorId(id);
        if (motorista) {
            alert(`Editando motorista: ${motorista.nome}`);
            // Aqui você implementaria a lógica de edição
        }
    }

    inativarMotorista(id) {
        if (confirm('Tem certeza que deseja inativar este motorista?')) {
            this.motoristasManager.remover(id);
            this.mostrarMensagem(`Motorista inativado com sucesso!`, 'success');
            this.filtrarEAplicar();
        }
    }

    ativarMotorista(id) {
        this.motoristasManager.ativar(id);
        this.mostrarMensagem(`Motorista ativado com sucesso!`, 'success');
        this.filtrarEAplicar();
    }

    excluirMotorista(id) {
        const motorista = this.motoristasManager.obterPorId(id);
        if (motorista && confirm(`Tem certeza que deseja excluir PERMANENTEMENTE o motorista ${motorista.nome}?`)) {
            // Note: no gerenciador atual, a função remover apenas inativa. Vamos remover completamente?
            // Como não temos uma função para excluir permanentemente, vamos criar uma:
            this.motoristasManager.motoristas = this.motoristasManager.motoristas.filter(m => m.id !== id);
            this.motoristasManager.salvarNoLocalStorage();
            this.mostrarMensagem(`Motorista excluído com sucesso!`, 'success');
            this.filtrarEAplicar();
        }
    }

    // Utilitários
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }

    mostrarMensagem(mensagem, tipo = 'info') {
        // Criar elemento de mensagem
        const mensagemEl = document.createElement('div');
        mensagemEl.className = `message message-${tipo}`;
        mensagemEl.textContent = mensagem;
        mensagemEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            ${tipo === 'success' ? 'background: #10b981;' : ''}
            ${tipo === 'error' ? 'background: #ef4444;' : ''}
            ${tipo === 'warning' ? 'background: #f59e0b;' : ''}
            ${tipo === 'info' ? 'background: #3b82f6;' : ''}
        `;

        document.body.appendChild(mensagemEl);

        // Remover após 3 segundos
        setTimeout(() => {
            mensagemEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (mensagemEl.parentNode) {
                    mensagemEl.parentNode.removeChild(mensagemEl);
                }
            }, 300);
        }, 3000);
    }
}

// Instância global do gerenciador de motoristas
const motoristasManager = new MotoristasManager();

// Instância global da tabela de motoristas
let motoristasTable;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    motoristasTable = new MotoristasTable();
});