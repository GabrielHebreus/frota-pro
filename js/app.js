// Aplicação principal
class LoadControlApp {
    constructor() {
        this.motoristasManager = motoristasManager;
        this.veiculosManager = veiculosManager;
        this.carregamentosManager = carregamentosManager;
        this.exportManager = exportManager;
        this.motoristaEditando = null;
        this.veiculoEditando = null;
        this.comparisonChart = null;
        this.relatorioChart = null;
        this.secaoAnteriorBusca = null;
        
        // Inicializar imediatamente se já estiver autenticado
        if (authManager.isAuthenticated) {
            this.init();
        }
    }

    init() {
        console.log('🚀 Inicializando LoadControl Pro...');
        this.bindEvents();
        this.carregarDadosIniciais();
        this.atualizarUICompleta();
        this.mudarSecao('dashboard');
    }

    // Vincular eventos
    bindEvents() {
        console.log('🔗 Vinculando eventos...');
        
        // Navegação sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.mudarSecao(section);
            });
        });

        // Formulário de carregamento
        const carregamentoForm = document.getElementById('carregamentoForm');
        if (carregamentoForm) {
            carregamentoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.adicionarCarregamento();
            });
        }

        // Formulário de motorista
        const motoristaForm = document.getElementById('motoristaForm');
        if (motoristaForm) {
            motoristaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.motoristaEditando) {
                    this.salvarEdicaoMotorista();
                } else {
                    this.adicionarMotorista();
                }
            });
        }

        // Formulário de veículo
        const veiculoForm = document.getElementById('veiculoForm');
        if (veiculoForm) {
            veiculoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.veiculoEditando) {
                    this.salvarEdicaoVeiculo();
                } else {
                    this.adicionarVeiculo();
                }
            });
        }

        // Botões limpar
        const limparBtn = document.getElementById('limparBtn');
        if (limparBtn) {
            limparBtn.addEventListener('click', () => {
                this.limparFormularioCarregamento();
            });
        }

        const limparMotoristaBtn = document.getElementById('limparMotoristaBtn');
        if (limparMotoristaBtn) {
            limparMotoristaBtn.addEventListener('click', () => {
                this.limparFormularioMotorista();
            });
        }

        const limparVeiculoBtn = document.getElementById('limparVeiculoBtn');
        if (limparVeiculoBtn) {
            limparVeiculoBtn.addEventListener('click', () => {
                this.limparFormularioVeiculo();
            });
        }

        // Botão limpar todos
        const limparTodosBtn = document.getElementById('limparTodosBtn');
        if (limparTodosBtn) {
            limparTodosBtn.addEventListener('click', () => {
                this.limparTodosCarregamentos();
            });
        }

        // Botão exportar
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportManager.exportarParaExcel();
                this.mostrarMensagem('Relatório exportado com sucesso!', 'success');
            });
        }

        // Botão novo carregamento
        const novoCarregamentoBtn = document.getElementById('novoCarregamentoBtn');
        if (novoCarregamentoBtn) {
            novoCarregamentoBtn.addEventListener('click', () => {
                this.mudarSecao('carregamentos');
                setTimeout(() => {
                    const formCard = document.getElementById('carregamentoFormCard');
                    if (formCard) {
                        formCard.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 300);
            });
        }

        // Botão novo veículo
        const novoVeiculoBtn = document.getElementById('novoVeiculoBtn');
        if (novoVeiculoBtn) {
            novoVeiculoBtn.addEventListener('click', () => {
                this.mudarSecao('veiculos');
                setTimeout(() => {
                    const veiculoForm = document.getElementById('veiculoForm');
                    if (veiculoForm) {
                        veiculoForm.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 300);
            });
        }

        // Filtros relatórios
        const aplicarFiltros = document.getElementById('aplicarFiltros');
        if (aplicarFiltros) {
            aplicarFiltros.addEventListener('click', () => {
                this.aplicarFiltrosRelatorios();
            });
        }

        // BOTÃO LIMPAR FILTROS - CORREÇÃO ADICIONADA
        const limparFiltrosBtn = document.getElementById('limparFiltros');
        if (limparFiltrosBtn) {
            limparFiltrosBtn.addEventListener('click', () => {
                this.limparFiltrosRelatorios();
            });
        }

        // BOTÃO EXPORTAR RELATÓRIO - CORREÇÃO ADICIONADA
        const exportRelatorioBtn = document.getElementById('exportRelatorioBtn');
        if (exportRelatorioBtn) {
            exportRelatorioBtn.addEventListener('click', () => {
                this.exportarRelatorioFiltrado();
            });
        }

        // Máscaras de input
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                e.target.value = this.aplicarMascaraCPF(e.target.value);
            });
        }

        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', (e) => {
                e.target.value = this.aplicarMascaraTelefone(e.target.value);
            });
        }

        const placaInput = document.getElementById('placa');
        if (placaInput) {
            placaInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }

        // Busca global
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.realizarBusca(e.target.value);
            });
        }

        // Definir data atual como padrão
        this.definirDataAtual();
    }

    // NOVA FUNÇÃO: Limpar filtros dos relatórios
    limparFiltrosRelatorios() {
        console.log('🧹 Limpando filtros dos relatórios...');
        
        // Limpar os campos de filtro
        const filtroMotorista = document.getElementById('filtroMotorista');
        const filtroVeiculo = document.getElementById('filtroVeiculo');
        const filtroDataInicio = document.getElementById('filtroDataInicio');
        const filtroDataFim = document.getElementById('filtroDataFim');
        
        if (filtroMotorista) filtroMotorista.value = '';
        if (filtroVeiculo) filtroVeiculo.value = '';
        if (filtroDataInicio) filtroDataInicio.value = '';
        if (filtroDataFim) filtroDataFim.value = '';
        
        // Aplicar os filtros limpos para atualizar os relatórios
        this.aplicarFiltrosRelatorios();
        
        this.mostrarMensagem('✅ Filtros limpos com sucesso!', 'success');
    }

    // NOVA FUNÇÃO: Exportar relatório filtrado
    exportarRelatorioFiltrado() {
        console.log('📤 Exportando relatório filtrado...');
        
        // Obter os filtros atuais
        const motoristaId = document.getElementById('filtroMotorista')?.value;
        const veiculoId = document.getElementById('filtroVeiculo')?.value;
        const dataInicio = document.getElementById('filtroDataInicio')?.value;
        const dataFim = document.getElementById('filtroDataFim')?.value;

        let carregamentos = this.carregamentosManager.obterTodos();

        // Aplicar os mesmos filtros do relatório
        if (motoristaId) {
            carregamentos = carregamentos.filter(c => c.motoristaId === motoristaId);
        }

        if (veiculoId) {
            carregamentos = carregamentos.filter(c => c.veiculoId === veiculoId);
        }

        if (dataInicio) {
            carregamentos = carregamentos.filter(c => new Date(c.data) >= new Date(dataInicio));
        }

        if (dataFim) {
            carregamentos = carregamentos.filter(c => new Date(c.data) <= new Date(dataFim));
        }

        if (carregamentos.length === 0) {
            this.mostrarMensagem('❌ Não há dados para exportar com os filtros atuais!', 'warning');
            return;
        }

        // Calcular estatísticas para o relatório
        const estatisticas = this.calcularEstatisticasFiltradas(carregamentos);
        const totais = this.calcularTotaisFiltrados(carregamentos);

        // Preparar dados para exportação
        const dadosExportacao = {
            carregamentos: carregamentos,
            estatisticas: estatisticas,
            totais: totais,
            filtros: {
                motorista: motoristaId ? this.motoristasManager.obterPorId(motoristaId)?.nome : 'Todos',
                veiculo: veiculoId ? this.veiculosManager.obterPorId(veiculoId)?.placa : 'Todos',
                dataInicio: dataInicio || 'Não definido',
                dataFim: dataFim || 'Não definido'
            }
        };

        // Chamar o exportManager para exportar o relatório filtrado
        this.exportManager.exportarRelatorioFiltrado(dadosExportacao);
        this.mostrarMensagem('📊 Relatório filtrado exportado com sucesso!', 'success');
    }

    carregarDadosIniciais() {
        console.log('📂 Carregando dados iniciais...');
        // Forçar carregamento dos dados
        this.motoristasManager.carregarDoLocalStorage();
        this.veiculosManager.carregarDoLocalStorage();
        this.carregamentosManager.carregarDoLocalStorage();
    }

    // Mudar seção com animação
    mudarSecao(secao) {
        console.log(`🔄 Mudando para seção: ${secao}`);
        
        // Remover seção de busca se existir
        const buscaSection = document.getElementById('busca-section');
        if (buscaSection) {
            buscaSection.remove();
        }
        
        // Limpar campo de busca
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        // Atualizar botões de navegação
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === secao);
        });

        // Atualizar seções com animação
        document.querySelectorAll('.section').forEach(section => {
            if (section.id === `${secao}-section`) {
                section.style.display = 'block';
                setTimeout(() => section.classList.add('active'), 50);
            } else {
                section.classList.remove('active');
                setTimeout(() => {
                    if (!section.classList.contains('active')) {
                        section.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Atualizar título da página
        const titles = {
            'dashboard': { title: 'Dashboard', subtitle: 'Visão geral da operação logística' },
            'carregamentos': { title: 'Carregamentos', subtitle: 'Controle completo dos carregamentos da frota' },
            'motoristas': { title: 'Motoristas', subtitle: 'Cadastro e controle da equipe de motoristas' },
            'veiculos': { title: 'Veículos', subtitle: 'Controle completo da frota de veículos' },
            'relatorios': { title: 'Relatórios', subtitle: 'Análise detalhada do desempenho da operação' }
        };
        
        const pageInfo = titles[secao] || { title: 'LoadControl Pro', subtitle: 'Sistema de Gestão de Frota' };
        
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        if (pageTitle) pageTitle.textContent = pageInfo.title;
        if (pageSubtitle) pageSubtitle.textContent = pageInfo.subtitle;

        // Carregar dados específicos da seção
        setTimeout(() => {
            switch(secao) {
                case 'dashboard':
                    this.atualizarDashboard();
                    break;
                case 'motoristas':
                    this.atualizarListaMotoristas();
                    this.atualizarStatsMotoristas();
                    break;
                case 'veiculos':
                    this.atualizarListaVeiculos();
                    this.atualizarStatsVeiculos();
                    break;
                case 'relatorios':
                    this.carregarRelatorios();
                    break;
                case 'carregamentos':
                    this.atualizarStatsCarregamentos();
                    this.atualizarTabelaCarregamentos();
                    break;
            }
        }, 350);
    }

    // Carregar motoristas no select
    carregarMotoristasSelect() {
        const selects = [
            document.getElementById('motorista'),
            document.getElementById('filtroMotorista')
        ];

        const motoristas = this.motoristasManager.obterAtivos();
        
        selects.forEach(select => {
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">Selecione um motorista</option>';
                
                motoristas.forEach(motorista => {
                    const option = document.createElement('option');
                    option.value = motorista.id;
                    option.textContent = motorista.nome;
                    select.appendChild(option);
                });

                // Manter o valor selecionado se possível
                if (currentValue && motoristas.some(m => m.id === currentValue)) {
                    select.value = currentValue;
                }
            }
        });
    }

    // Carregar veículos no select
    carregarVeiculosSelect() {
        const selects = [
            document.getElementById('veiculo'),
            document.getElementById('filtroVeiculo')
        ];

        const veiculos = this.veiculosManager.obterDisponiveis();
        
        selects.forEach(select => {
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">Selecione um veículo</option>';
                
                veiculos.forEach(veiculo => {
                    const option = document.createElement('option');
                    option.value = veiculo.id;
                    option.textContent = `${veiculo.placa} - ${veiculo.modelo}`;
                    select.appendChild(option);
                });

                // Manter o valor selecionado se possível
                if (currentValue && veiculos.some(v => v.id === currentValue)) {
                    select.value = currentValue;
                }
            }
        });
    }

    carregarFiltroMotoristas() {
        const select = document.getElementById('filtroMotorista');
        if (select) {
            const motoristas = this.motoristasManager.obterAtivos();
            select.innerHTML = '<option value="">Todos os motoristas</option>';
            
            motoristas.forEach(motorista => {
                const option = document.createElement('option');
                option.value = motorista.id;
                option.textContent = motorista.nome;
                select.appendChild(option);
            });
        }
    }

    carregarFiltroVeiculos() {
        const select = document.getElementById('filtroVeiculo');
        if (select) {
            const veiculos = this.veiculosManager.obterTodos();
            select.innerHTML = '<option value="">Todos os veículos</option>';
            
            veiculos.forEach(veiculo => {
                const option = document.createElement('option');
                option.value = veiculo.id;
                option.textContent = `${veiculo.placa} - ${veiculo.modelo}`;
                select.appendChild(option);
            });
        }
    }

    // CARREGAMENTOS
    adicionarCarregamento() {
        const formData = this.obterDadosFormularioCarregamento();
        
        if (!this.validarDadosCarregamento(formData)) {
            return;
        }

        try {
            const novoCarregamento = this.carregamentosManager.adicionar(formData);
            this.mostrarMensagem('✅ Carregamento adicionado com sucesso!', 'success');
            this.limparFormularioCarregamento();
            this.atualizarUICompleta();
            
        } catch (error) {
            this.mostrarMensagem(`❌ ${error.message}`, 'error');
        }
    }

    obterDadosFormularioCarregamento() {
        const valorInput = document.getElementById('valor');
        let valor = 0;
        
        if (valorInput && valorInput.value) {
            valor = parseFloat(valorInput.value);
            if (isNaN(valor)) {
                valor = 0;
            }
        }

        return {
            motoristaId: document.getElementById('motorista').value,
            veiculoId: document.getElementById('veiculo').value,
            data: document.getElementById('data').value,
            rota: document.getElementById('rota').value,
            numeroCarregamento: document.getElementById('numeroCarregamento').value,
            valor: valor,
            status: document.getElementById('status').value
        };
    }

    validarDadosCarregamento(dados) {
        const camposObrigatorios = ['motoristaId', 'veiculoId', 'data', 'rota', 'numeroCarregamento', 'valor'];
        
        for (let campo of camposObrigatorios) {
            if (!dados[campo]) {
                this.mostrarMensagem('⚠️ Preencha todos os campos obrigatórios!', 'warning');
                return false;
            }
        }

        if (parseFloat(dados.valor) <= 0) {
            this.mostrarMensagem('⚠️ O valor deve ser maior que zero!', 'warning');
            return false;
        }

        return true;
    }

    limparFormularioCarregamento() {
        const form = document.getElementById('carregamentoForm');
        if (form) {
            form.reset();
            this.definirDataAtual();
            const rotaInput = document.getElementById('rota');
            if (rotaInput) rotaInput.focus();
        }
    }

    definirDataAtual() {
        const dataInput = document.getElementById('data');
        if (dataInput) {
            const hoje = new Date();
            const offset = hoje.getTimezoneOffset();
            const localDate = new Date(hoje.getTime() - (offset * 60 * 1000));
            const dataLocal = localDate.toISOString().split('T')[0];
            dataInput.value = dataLocal;
        }
    }

    atualizarTabelaCarregamentos() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;

        const carregamentos = this.carregamentosManager.obterTodos();

        if (carregamentos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>Nenhum carregamento registrado</h3>
                        <p>Adicione seu primeiro carregamento usando o formulário acima.</p>
                        <button class="btn btn-primary" onclick="app.mudarSecao('carregamentos')">
                            ➕ Novo Carregamento
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = carregamentos.map(carregamento => `
            <tr>
                <td>
                    <div class="driver-info-small">
                        <div class="driver-avatar-small">${carregamento.motoristaNome ? carregamento.motoristaNome.charAt(0) : '?'}</div>
                        <span>${carregamento.motoristaNome || 'N/A'}</span>
                    </div>
                </td>
                <td>
                    <div class="vehicle-info">
                        <span class="vehicle-placa">${carregamento.veiculoPlaca || 'N/A'}</span>
                    </div>
                </td>
                <td>${this.formatarData(carregamento.data)}</td>
                <td>
                    <span class="rota-badge">${carregamento.rota}</span>
                </td>
                <td>
                    <span class="numero-carregamento">${carregamento.numeroCarregamento}</span>
                </td>
                <td class="valor-destaque">R$ ${this.formatarMoeda(carregamento.valor)}</td>
                <td>
                    <span class="status-badge status-${carregamento.status ? carregamento.status.toLowerCase().replace(' ', '-') : 'pendente'}">
                        ${carregamento.status || 'Pendente'}
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" onclick="app.editarCarregamento('${carregamento.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" onclick="app.removerCarregamento('${carregamento.id}')" title="Excluir">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');

        // Atualizar total de registros
        const totalRegistros = document.getElementById('totalRegistros');
        if (totalRegistros) {
            totalRegistros.textContent = carregamentos.length;
        }
    }

    removerCarregamento(id) {
        if (confirm('Tem certeza que deseja excluir este carregamento?')) {
            this.carregamentosManager.remover(id);
            this.mostrarMensagem('✅ Carregamento excluído com sucesso!', 'success');
            this.atualizarUICompleta();
        }
    }

    editarCarregamento(id) {
        const carregamento = this.carregamentosManager.obterPorId(id);
        if (carregamento) {
            // Preencher formulário com dados existentes
            document.getElementById('motorista').value = carregamento.motoristaId;
            document.getElementById('veiculo').value = carregamento.veiculoId;
            document.getElementById('data').value = carregamento.data;
            document.getElementById('rota').value = carregamento.rota;
            document.getElementById('numeroCarregamento').value = carregamento.numeroCarregamento;
            document.getElementById('valor').value = carregamento.valor;
            document.getElementById('status').value = carregamento.status;

            // Remover o item original
            this.carregamentosManager.remover(id);
            
            this.mostrarMensagem('📝 Carregamento carregado para edição!', 'info');
            const rotaInput = document.getElementById('rota');
            if (rotaInput) rotaInput.focus();
            
            // Scroll para o formulário
            const formCard = document.getElementById('carregamentoFormCard');
            if (formCard) {
                formCard.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }

    limparTodosCarregamentos() {
        if (this.carregamentosManager.carregamentos.length === 0) {
            this.mostrarMensagem('ℹ️ Não há carregamentos para limpar!', 'warning');
            return;
        }

        if (confirm('⚠️ Tem certeza que deseja limpar TODOS os carregamentos? Esta ação não pode ser desfeita.')) {
            this.carregamentosManager.limparTodos();
            this.mostrarMensagem('✅ Todos os carregamentos foram removidos!', 'success');
            this.atualizarUICompleta();
        }
    }

    // MOTORISTAS
    adicionarMotorista() {
        const formData = this.obterDadosFormularioMotorista();
        
        if (!this.validarDadosMotorista(formData)) {
            return;
        }

        try {
            const novoMotorista = this.motoristasManager.adicionar(formData);
            this.mostrarMensagem('✅ Motorista cadastrado com sucesso!', 'success');
            this.limparFormularioMotorista();
            this.atualizarUICompleta();
            
        } catch (error) {
            this.mostrarMensagem(`❌ ${error.message}`, 'error');
        }
    }

    editarMotorista(id) {
        const motorista = this.motoristasManager.obterPorId(id);
        if (motorista) {
            this.motoristaEditando = id;
            
            // Preencher formulário com dados existentes
            document.getElementById('nomeMotorista').value = motorista.nome;
            document.getElementById('cpf').value = this.motoristasManager.formatarCPF(motorista.cpf);
            document.getElementById('telefone').value = motorista.telefone ? this.motoristasManager.formatarTelefone(motorista.telefone) : '';
            document.getElementById('cnh').value = motorista.cnh;
            document.getElementById('categoriaCnh').value = motorista.categoriaCnh;
            document.getElementById('vtDiario').value = motorista.vtDiario;

            // Mudar texto do botão
            const submitBtn = document.querySelector('#motoristaForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="btn-icon">💾</span> Salvar Edição';
            }

            this.mostrarMensagem(`📝 Editando motorista: ${motorista.nome}`, 'info');
            const nomeInput = document.getElementById('nomeMotorista');
            if (nomeInput) nomeInput.focus();
        }
    }

    salvarEdicaoMotorista() {
        const formData = this.obterDadosFormularioMotorista();
        
        if (!this.validarDadosMotorista(formData)) {
            return;
        }

        try {
            const motoristaAtualizado = this.motoristasManager.editar(this.motoristaEditando, formData);
            this.mostrarMensagem('✅ Motorista atualizado com sucesso!', 'success');
            this.limparFormularioMotorista();
            this.atualizarUICompleta();
            this.motoristaEditando = null;
        } catch (error) {
            this.mostrarMensagem(`❌ ${error.message}`, 'error');
        }
    }

    excluirMotorista(id) {
        const motorista = this.motoristasManager.obterPorId(id);
        if (motorista && confirm(`⚠️ Tem certeza que deseja EXCLUIR PERMANENTEMENTE o motorista ${motorista.nome}? Esta ação não pode ser desfeita.`)) {
            // Verificar se o motorista tem carregamentos
            const carregamentosMotorista = this.carregamentosManager.obterPorMotorista(id);
            if (carregamentosMotorista.length > 0) {
                this.mostrarMensagem('❌ Não é possível excluir motorista com carregamentos registrados!', 'error');
                return;
            }

            // Remover motorista da lista
            this.motoristasManager.motoristas = this.motoristasManager.motoristas.filter(m => m.id !== id);
            this.motoristasManager.salvarNoLocalStorage();
            
            this.mostrarMensagem('✅ Motorista excluído com sucesso!', 'success');
            this.atualizarUICompleta();
        }
    }

    inativarMotorista(id) {
        if (confirm('Tem certeza que deseja inativar este motorista?')) {
            this.motoristasManager.remover(id);
            this.mostrarMensagem('✅ Motorista inativado com sucesso!', 'success');
            this.atualizarUICompleta();
        }
    }

    ativarMotorista(id) {
        this.motoristasManager.ativar(id);
        this.mostrarMensagem('✅ Motorista ativado com sucesso!', 'success');
        this.atualizarUICompleta();
    }

    obterDadosFormularioMotorista() {
        const vtDiarioInput = document.getElementById('vtDiario');
        let vtDiario = 9.00;
        
        if (vtDiarioInput && vtDiarioInput.value) {
            vtDiario = parseFloat(vtDiarioInput.value);
            if (isNaN(vtDiario)) {
                vtDiario = 9.00;
            }
        }

        return {
            nome: document.getElementById('nomeMotorista').value.trim(),
            cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
            telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
            cnh: document.getElementById('cnh').value,
            categoriaCnh: document.getElementById('categoriaCnh').value,
            vtDiario: vtDiario
        };
    }

    validarDadosMotorista(dados) {
        if (!dados.nome || !dados.cpf || !dados.cnh) {
            this.mostrarMensagem('⚠️ Preencha nome, CPF e CNH!', 'warning');
            return false;
        }

        if (dados.cpf.length !== 11) {
            this.mostrarMensagem('⚠️ CPF deve ter 11 dígitos!', 'warning');
            return false;
        }

        if (!this.motoristasManager.validarCPF(dados.cpf)) {
            this.mostrarMensagem('⚠️ CPF inválido!', 'warning');
            return false;
        }

        if (dados.telefone && dados.telefone.length < 10) {
            this.mostrarMensagem('⚠️ Telefone deve ter pelo menos 10 dígitos!', 'warning');
            return false;
        }

        return true;
    }

    limparFormularioMotorista() {
        const form = document.getElementById('motoristaForm');
        if (form) {
            form.reset();
            document.getElementById('vtDiario').value = '9.00';
            const submitBtn = document.querySelector('#motoristaForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="btn-icon">👥</span> Cadastrar Motorista';
            }
            this.motoristaEditando = null;
            const nomeInput = document.getElementById('nomeMotorista');
            if (nomeInput) nomeInput.focus();
        }
    }

    atualizarListaMotoristas() {
        const tbody = document.getElementById('motoristasBody');
        if (!tbody) return;

        const motoristas = this.motoristasManager.obterTodos();

        if (motoristas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-icon">👥</div>
                        <h3>Nenhum motorista cadastrado</h3>
                        <p>Cadastre o primeiro motorista usando o formulário acima.</p>
                        <button class="btn btn-primary" onclick="document.getElementById('nomeMotorista').focus()">
                            👤 Cadastrar Motorista
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = motoristas.map(motorista => `
            <tr>
                <td>
                    <div class="driver-info-small">
                        <div class="driver-avatar-small">${motorista.nome.charAt(0)}</div>
                        <div>
                            <strong>${motorista.nome}</strong>
                            <div class="driver-details">
                                <small>CNH: ${motorista.cnh} - ${motorista.categoriaCnh}</small>
                            </div>
                        </div>
                    </div>
                </td>
                <td>${this.motoristasManager.formatarCPF(motorista.cpf)}</td>
                <td>${motorista.telefone ? this.motoristasManager.formatarTelefone(motorista.telefone) : '-'}</td>
                <td>R$ ${this.formatarMoeda(motorista.vtDiario)}</td>
                <td>
                    <span class="status-badge ${motorista.ativo ? 'status-active' : 'status-inactive'}">
                        ${motorista.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" onclick="app.editarMotorista('${motorista.id}')" title="Editar">
                        ✏️
                    </button>
                    ${motorista.ativo ? `
                        <button class="btn-icon btn-warning" onclick="app.inativarMotorista('${motorista.id}')" title="Inativar">
                            🚫
                        </button>
                    ` : `
                        <button class="btn-icon btn-success" onclick="app.ativarMotorista('${motorista.id}')" title="Ativar">
                            ✅
                        </button>
                    `}
                    <button class="btn-icon btn-danger" onclick="app.excluirMotorista('${motorista.id}')" title="Excluir">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // VEÍCULOS
    adicionarVeiculo() {
        const formData = this.obterDadosFormularioVeiculo();
        
        if (!this.validarDadosVeiculo(formData)) {
            return;
        }

        try {
            const novoVeiculo = this.veiculosManager.adicionar(formData);
            this.mostrarMensagem('✅ Veículo cadastrado com sucesso!', 'success');
            this.limparFormularioVeiculo();
            this.atualizarUICompleta();
            
        } catch (error) {
            this.mostrarMensagem(`❌ ${error.message}`, 'error');
        }
    }

    editarVeiculo(id) {
        const veiculo = this.veiculosManager.obterPorId(id);
        if (veiculo) {
            this.veiculoEditando = id;
            
            // Preencher formulário com dados existentes
            document.getElementById('placa').value = veiculo.placa;
            document.getElementById('modelo').value = veiculo.modelo;
            document.getElementById('marca').value = veiculo.marca;
            document.getElementById('ano').value = veiculo.ano;
            document.getElementById('tipo').value = veiculo.tipo;
            document.getElementById('statusVeiculo').value = veiculo.status;

            // Mudar texto do botão
            const submitBtn = document.querySelector('#veiculoForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="btn-icon">💾</span> Salvar Edição';
            }

            this.mostrarMensagem(`📝 Editando veículo: ${veiculo.placa}`, 'info');
            const placaInput = document.getElementById('placa');
            if (placaInput) placaInput.focus();
        }
    }

    salvarEdicaoVeiculo() {
        const formData = this.obterDadosFormularioVeiculo();
        
        if (!this.validarDadosVeiculo(formData)) {
            return;
        }

        try {
            const veiculoAtualizado = this.veiculosManager.editar(this.veiculoEditando, formData);
            this.mostrarMensagem('✅ Veículo atualizado com sucesso!', 'success');
            this.limparFormularioVeiculo();
            this.atualizarUICompleta();
            this.veiculoEditando = null;
        } catch (error) {
            this.mostrarMensagem(`❌ ${error.message}`, 'error');
        }
    }

    excluirVeiculo(id) {
        const veiculo = this.veiculosManager.obterPorId(id);
        if (veiculo && confirm(`⚠️ Tem certeza que deseja EXCLUIR PERMANENTEMENTE o veículo ${veiculo.placa}? Esta ação não pode ser desfeita.`)) {
            // Verificar se o veículo tem carregamentos
            const carregamentosVeiculo = this.carregamentosManager.obterPorVeiculo(id);
            if (carregamentosVeiculo.length > 0) {
                this.mostrarMensagem('❌ Não é possível excluir veículo com carregamentos registrados!', 'error');
                return;
            }

            this.veiculosManager.remover(id);
            this.mostrarMensagem('✅ Veículo excluído com sucesso!', 'success');
            this.atualizarUICompleta();
        }
    }

    alterarStatusVeiculo(id, status) {
        if (confirm(`Alterar status do veículo para ${status}?`)) {
            this.veiculosManager.alterarStatus(id, status);
            this.mostrarMensagem(`✅ Status do veículo atualizado para ${status}!`, 'success');
            this.atualizarUICompleta();
        }
    }

    obterDadosFormularioVeiculo() {
        const anoInput = document.getElementById('ano');
        let ano = new Date().getFullYear();
        
        if (anoInput && anoInput.value) {
            ano = parseInt(anoInput.value);
            if (isNaN(ano)) {
                ano = new Date().getFullYear();
            }
        }

        return {
            placa: document.getElementById('placa').value,
            modelo: document.getElementById('modelo').value,
            marca: document.getElementById('marca').value,
            ano: ano,
            tipo: document.getElementById('tipo').value,
            status: document.getElementById('statusVeiculo').value
        };
    }

    validarDadosVeiculo(dados) {
        if (!dados.placa || !dados.modelo || !dados.marca || !dados.ano) {
            this.mostrarMensagem('⚠️ Preencha placa, modelo, marca e ano!', 'warning');
            return false;
        }

        // Validar formato da placa (antigo ou Mercosul)
        const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
        if (!placaRegex.test(dados.placa.replace('-', ''))) {
            this.mostrarMensagem('⚠️ Formato de placa inválido!', 'warning');
            return false;
        }

        if (parseInt(dados.ano) < 1900 || parseInt(dados.ano) > new Date().getFullYear() + 1) {
            this.mostrarMensagem('⚠️ Ano do veículo inválido!', 'warning');
            return false;
        }

        return true;
    }

    limparFormularioVeiculo() {
        const form = document.getElementById('veiculoForm');
        if (form) {
            form.reset();
            document.getElementById('statusVeiculo').value = 'Disponível';
            const submitBtn = document.querySelector('#veiculoForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="btn-icon">💾</span> Cadastrar Veículo';
            }
            this.veiculoEditando = null;
            const placaInput = document.getElementById('placa');
            if (placaInput) placaInput.focus();
        }
    }

    atualizarListaVeiculos() {
        const tbody = document.getElementById('veiculosBody');
        if (!tbody) return;

        const veiculos = this.veiculosManager.obterTodos();

        if (veiculos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-icon">🚚</div>
                        <h3>Nenhum veículo cadastrado</h3>
                        <p>Cadastre o primeiro veículo usando o formulário acima.</p>
                        <button class="btn btn-primary" onclick="document.getElementById('placa').focus()">
                            🚚 Cadastrar Veículo
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = veiculos.map(veiculo => `
            <tr>
                <td>
                    <div class="vehicle-info">
                        <span class="vehicle-placa">${veiculo.placa}</span>
                    </div>
                </td>
                <td>${veiculo.modelo}</td>
                <td>${veiculo.marca}</td>
                <td>${veiculo.ano}</td>
                <td>
                    <span class="tipo-badge">${veiculo.tipo}</span>
                </td>
                <td>
                    <span class="status-badge status-${veiculo.status.toLowerCase()}">
                        ${veiculo.status}
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" onclick="app.editarVeiculo('${veiculo.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-icon btn-danger" onclick="app.excluirVeiculo('${veiculo.id}')" title="Excluir">
                        🗑️
                    </button>
                    ${veiculo.status === 'Disponível' ? `
                        <button class="btn-icon btn-warning" onclick="app.alterarStatusVeiculo('${veiculo.id}', 'Manutenção')" title="Enviar para Manutenção">
                            🔧
                        </button>
                    ` : `
                        <button class="btn-icon btn-success" onclick="app.alterarStatusVeiculo('${veiculo.id}', 'Disponível')" title="Disponibilizar">
                            ✅
                        </button>
                    `}
                </td>
            </tr>
        `).join('');
    }

    // DASHBOARD
    atualizarDashboard() {
        const totais = this.carregamentosManager.calcularTotais();
        const motoristasAtivos = this.motoristasManager.obterAtivos().length;
        const totalVeiculos = this.veiculosManager.obterTodos().length;
        const veiculosDisponiveis = this.veiculosManager.obterDisponiveis().length;

        // Atualizar stats do dashboard
        this.atualizarElementoTexto('dashboardTotalMensal', `R$ ${this.formatarMoeda(totais.totalMensal)}`);
        this.atualizarElementoTexto('dashboardCarregamentos', totais.totalRegistros);
        this.atualizarElementoTexto('dashboardMotoristas', motoristasAtivos);
        this.atualizarElementoTexto('dashboardDias', totais.diasTrabalhados);
        this.atualizarElementoTexto('dashboardVeiculos', totalVeiculos);

        // Atualizar badges da sidebar
        this.atualizarElementoTexto('carregamentosCount', totais.totalRegistros);
        this.atualizarElementoTexto('motoristasCount', this.motoristasManager.obterTodos().length);
        this.atualizarElementoTexto('veiculosCount', totalVeiculos);

        // Atualizar componentes do dashboard
        this.atualizarAtividadeRecente();
        this.atualizarMotoristasMaioresValores();
        this.atualizarGraficoComparacao();
        this.atualizarMetricasRapidas();
    }

    // NOVA FUNÇÃO: Métricas rápidas
    atualizarMetricasRapidas() {
        const hoje = new Date().toISOString().split('T')[0];
        const carregamentosHoje = this.carregamentosManager.obterTodos()
            .filter(c => c.data === hoje);
        
        const valorHoje = carregamentosHoje.reduce((sum, c) => sum + c.valor, 0);
        const pendentes = this.carregamentosManager.obterTodos()
            .filter(c => c.status === 'Pendente').length;

        // Atualizar métricas rápidas se existirem
        const metricsContainer = document.getElementById('metricasRapidas');
        if (metricsContainer) {
            metricsContainer.innerHTML = `
                <div class="metric-card">
                    <div class="metric-icon">💰</div>
                    <div class="metric-info">
                        <div class="metric-value">R$ ${this.formatarMoeda(valorHoje)}</div>
                        <div class="metric-label">Faturamento Hoje</div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">📦</div>
                    <div class="metric-info">
                        <div class="metric-value">${carregamentosHoje.length}</div>
                        <div class="metric-label">Carregamentos Hoje</div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">⏳</div>
                    <div class="metric-info">
                        <div class="metric-value">${pendentes}</div>
                        <div class="metric-label">Pendentes</div>
                    </div>
                </div>
            `;
        }
    }

    atualizarAtividadeRecente() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const carregamentos = this.carregamentosManager.obterTodos().slice(0, 5);
        
        if (carregamentos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <p>Nenhum carregamento recente</p>
                    <button class="btn btn-primary btn-sm" onclick="app.mudarSecao('carregamentos')">
                        ➕ Novo Carregamento
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = carregamentos.map(c => `
            <div class="activity-item">
                <div class="activity-icon">📦</div>
                <div class="activity-content">
                    <div class="activity-title">${c.motoristaNome}</div>
                    <div class="activity-subtitle">${c.rota} • ${this.formatarData(c.data)}</div>
                </div>
                <div class="activity-value">R$ ${this.formatarMoeda(c.valor)}</div>
            </div>
        `).join('');
    }

    atualizarMotoristasMaioresValores() {
        const container = document.getElementById('featuredDrivers');
        if (!container) return;

        const estatisticas = this.carregamentosManager.obterEstatisticasMotoristas().slice(0, 4);
        
        if (estatisticas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⭐</div>
                    <p>Nenhum motorista com carregamentos</p>
                    <button class="btn btn-primary btn-sm" onclick="app.mudarSecao('motoristas')">
                        👥 Ver Motoristas
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = estatisticas.map(e => `
            <div class="driver-card">
                <div class="driver-header">
                    <div class="driver-avatar">${e.motorista.charAt(0)}</div>
                    <div class="driver-info">
                        <h4>${e.motorista}</h4>
                        <p>${e.totalCarregamentos} carregamentos</p>
                    </div>
                </div>
                <div class="driver-stats">
                    <div class="driver-stat">
                        <div class="driver-stat-value">R$ ${this.formatarMoeda(e.totalValor)}</div>
                        <div class="driver-stat-label">Faturamento</div>
                    </div>
                    <div class="driver-stat">
                        <div class="driver-stat-value">${e.diasTrabalhados}</div>
                        <div class="driver-stat-label">Dias</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    atualizarGraficoComparacao() {
        const ctx = document.getElementById('comparisonChart');
        if (!ctx) return;

        // Destruir gráfico anterior se existir
        if (this.comparisonChart) {
            this.comparisonChart.destroy();
        }

        const estatisticas = this.carregamentosManager.obterEstatisticasMotoristas();

        if (estatisticas.length === 0) {
            ctx.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8;">
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                        <p>Nenhum dado disponível</p>
                        <p style="font-size: 0.8rem;">Adicione carregamentos para ver o gráfico</p>
                    </div>
                </div>
            `;
            return;
        }

        const nomes = estatisticas.map(e => e.motorista);
        const valores = estatisticas.map(e => e.totalValor);

        this.comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: nomes,
                datasets: [{
                    label: 'Faturamento por Motorista (R$)',
                    data: valores,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(139, 92, 246)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Comparação de Faturamento por Motorista',
                        color: '#f1f5f9',
                        font: {
                            size: 14
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cbd5e1',
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        },
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }

    // RELATÓRIOS
    carregarRelatorios() {
        this.aplicarFiltrosRelatorios();
    }

    aplicarFiltrosRelatorios() {
        const motoristaId = document.getElementById('filtroMotorista')?.value;
        const veiculoId = document.getElementById('filtroVeiculo')?.value;
        const dataInicio = document.getElementById('filtroDataInicio')?.value;
        const dataFim = document.getElementById('filtroDataFim')?.value;

        let carregamentos = this.carregamentosManager.obterTodos();

        // Aplicar filtros
        if (motoristaId) {
            carregamentos = carregamentos.filter(c => c.motoristaId === motoristaId);
        }

        if (veiculoId) {
            carregamentos = carregamentos.filter(c => c.veiculoId === veiculoId);
        }

        if (dataInicio) {
            carregamentos = carregamentos.filter(c => new Date(c.data) >= new Date(dataInicio));
        }

        if (dataFim) {
            carregamentos = carregamentos.filter(c => new Date(c.data) <= new Date(dataFim));
        }

        this.atualizarRelatorios(carregamentos);
    }

    atualizarRelatorios(carregamentosFiltrados) {
        const estatisticas = this.calcularEstatisticasFiltradas(carregamentosFiltrados);
        const totais = this.calcularTotaisFiltrados(carregamentosFiltrados);
        const tbody = document.getElementById('relatorioBody');
        if (!tbody) return;

        // Atualizar métricas
        this.atualizarElementoTexto('relatorioFaturamento', `R$ ${this.formatarMoeda(totais.totalMensal)}`);
        this.atualizarElementoTexto('relatorioTicketMedio', `R$ ${this.formatarMoeda(totais.ticketMedio)}`);
        this.atualizarElementoTexto('relatorioDiasTrabalhados', totais.diasTrabalhados);

        if (estatisticas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-icon">📊</div>
                        <h3>Nenhum dado para exibir</h3>
                        <p>Adicione carregamentos ou ajuste os filtros.</p>
                    </td>
                </tr>
            `;
            
            this.limparGraficoRelatorio();
            return;
        }

        tbody.innerHTML = estatisticas.map(estatistica => `
            <tr>
                <td><strong>${estatistica.motorista}</strong></td>
                <td>${estatistica.totalCarregamentos}</td>
                <td class="valor-destaque">R$ ${this.formatarMoeda(estatistica.totalValor)}</td>
                <td>${estatistica.diasTrabalhados}</td>
                <td>R$ ${this.formatarMoeda(estatistica.vtDiario)}</td>
                <td>R$ ${this.formatarMoeda(estatistica.vtTotal)}</td>
                <td class="valor-destaque">R$ ${this.formatarMoeda(estatistica.ticketMedio)}</td>
            </tr>
        `).join('');

        this.atualizarGraficoRelatorio(estatisticas);
    }

    calcularEstatisticasFiltradas(carregamentosFiltrados) {
        const motoristas = this.motoristasManager.obterAtivos();
        const estatisticas = [];

        motoristas.forEach(motorista => {
            const carregamentosMotorista = carregamentosFiltrados.filter(c => c.motoristaId === motorista.id);
            
            if (carregamentosMotorista.length > 0) {
                const totalValor = carregamentosMotorista.reduce((sum, c) => sum + c.valor, 0);
                const diasUnicos = new Set(carregamentosMotorista.map(c => c.data)).size;
                const vtTotal = diasUnicos * motorista.vtDiario;
                const ticketMedio = totalValor / carregamentosMotorista.length;

                estatisticas.push({
                    motorista: motorista.nome,
                    totalCarregamentos: carregamentosMotorista.length,
                    totalValor: totalValor,
                    diasTrabalhados: diasUnicos,
                    vtDiario: motorista.vtDiario,
                    vtTotal: vtTotal,
                    ticketMedio: ticketMedio
                });
            }
        });

        return estatisticas.sort((a, b) => b.totalValor - a.totalValor);
    }

    calcularTotaisFiltrados(carregamentosFiltrados) {
        if (carregamentosFiltrados.length === 0) {
            return {
                totalMensal: 0,
                ticketMedio: 0,
                diasTrabalhados: 0,
                vtTotal: 0
            };
        }

        const totalMensal = carregamentosFiltrados.reduce((sum, c) => sum + c.valor, 0);
        const ticketMedio = totalMensal / carregamentosFiltrados.length;
        
        const diasUnicos = new Set(carregamentosFiltrados.map(c => c.data)).size;
        
        let vtTotal = 0;
        const motoristasAtivos = this.motoristasManager.obterAtivos();
        
        motoristasAtivos.forEach(motorista => {
            const carregamentosMotorista = carregamentosFiltrados.filter(c => c.motoristaId === motorista.id);
            const diasTrabalhadosMotorista = new Set(carregamentosMotorista.map(c => c.data)).size;
            vtTotal += diasTrabalhadosMotorista * motorista.vtDiario;
        });

        return {
            totalMensal,
            ticketMedio,
            diasTrabalhados: diasUnicos,
            vtTotal
        };
    }

    atualizarGraficoRelatorio(estatisticas) {
        const ctx = document.getElementById('relatorioChart');
        if (!ctx) return;
        
        // Destruir gráfico anterior se existir
        if (this.relatorioChart) {
            this.relatorioChart.destroy();
        }

        if (estatisticas.length === 0) {
            ctx.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8;">
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                        <p>Nenhum dado disponível</p>
                        <p style="font-size: 0.8rem;">Adicione carregamentos para ver o gráfico</p>
                    </div>
                </div>
            `;
            return;
        }

        const nomes = estatisticas.map(e => e.motorista);
        const valores = estatisticas.map(e => e.totalValor);

        this.relatorioChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: nomes,
                datasets: [{
                    label: 'Faturamento por Motorista (R$)',
                    data: valores,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Comparação de Faturamento - Relatório',
                        color: '#f1f5f9',
                        font: {
                            size: 14
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cbd5e1',
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        },
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }

    limparGraficoRelatorio() {
        const ctx = document.getElementById('relatorioChart');
        if (ctx) {
            ctx.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8;">
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                        <p>Nenhum dado disponível</p>
                        <p style="font-size: 0.8rem;">Adicione carregamentos para ver o gráfico</p>
                    </div>
                </div>
            `;
        }
    }

    // BUSCA GLOBAL
    realizarBusca(termo) {
        if (!termo.trim()) {
            // Se busca vazia, restaurar visualização normal baseada na seção atual
            const secaoAtiva = document.querySelector('.nav-item.active')?.dataset.section || 'dashboard';
            this.mudarSecao(secaoAtiva);
            return;
        }

        termo = termo.toLowerCase();
        
        // Buscar em todas as seções
        const resultados = {
            carregamentos: this.carregamentosManager.obterTodos().filter(c => 
                c.motoristaNome.toLowerCase().includes(termo) ||
                c.veiculoPlaca.toLowerCase().includes(termo) ||
                c.rota.toLowerCase().includes(termo) ||
                c.numeroCarregamento.toLowerCase().includes(termo) ||
                c.valor.toString().includes(termo) ||
                c.status.toLowerCase().includes(termo)
            ),
            motoristas: this.motoristasManager.obterTodos().filter(m =>
                m.nome.toLowerCase().includes(termo) ||
                m.cpf.includes(termo.replace(/\D/g, '')) ||
                m.cnh.includes(termo) ||
                m.categoriaCnh.toLowerCase().includes(termo) ||
                m.telefone?.includes(termo.replace(/\D/g, ''))
            ),
            veiculos: this.veiculosManager.obterTodos().filter(v =>
                v.placa.toLowerCase().includes(termo) ||
                v.modelo.toLowerCase().includes(termo) ||
                v.marca.toLowerCase().includes(termo) ||
                v.ano.toString().includes(termo) ||
                v.tipo.toLowerCase().includes(termo) ||
                v.status.toLowerCase().includes(termo)
            )
        };

        // Mostrar resultados
        this.mostrarResultadosBusca(resultados, termo);
    }

    mostrarResultadosBusca(resultados, termo) {
        // Criar ou atualizar seção de resultados
        let resultadosSection = document.getElementById('busca-section');
        
        if (!resultadosSection) {
            resultadosSection = document.createElement('div');
            resultadosSection.id = 'busca-section';
            resultadosSection.className = 'section active';
            resultadosSection.innerHTML = `
                <div class="container">
                    <div class="section-header">
                        <h2>🔍 Resultados da Busca</h2>
                        <p>Resultados para: "<strong>${termo}</strong>"</p>
                        <button class="btn btn-secondary btn-sm" onclick="app.voltarDaBusca()">
                            ← Voltar
                        </button>
                    </div>
                    <div id="conteudoResultadosBusca"></div>
                </div>
            `;
            document.querySelector('.main-content').appendChild(resultadosSection);
        }

        const conteudo = document.getElementById('conteudoResultadosBusca');
        if (!conteudo) return;

        let html = '';

        // Armazenar seção anterior para voltar
        if (!this.secaoAnteriorBusca) {
            this.secaoAnteriorBusca = document.querySelector('.nav-item.active')?.dataset.section || 'dashboard';
        }

        // Ocultar outras seções
        document.querySelectorAll('.section').forEach(section => {
            if (section.id !== 'busca-section') {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });

        // Mostrar seção de busca
        resultadosSection.style.display = 'block';
        resultadosSection.classList.add('active');

        // Contar resultados totais
        const totalResultados = resultados.carregamentos.length + resultados.motoristas.length + resultados.veiculos.length;

        if (totalResultados === 0) {
            html = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Nenhum item corresponde à sua busca por "<strong>${termo}</strong>"</p>
                    <div class="suggestions">
                        <p>Sugestões:</p>
                        <ul>
                            <li>Verifique a ortografia</li>
                            <li>Use termos mais genéricos</li>
                            <li>Tente buscar por parte do nome ou placa</li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            html = `
                <div class="search-summary">
                    <div class="search-stats">
                        <span class="stat-badge">📦 ${resultados.carregamentos.length} carregamentos</span>
                        <span class="stat-badge">👥 ${resultados.motoristas.length} motoristas</span>
                        <span class="stat-badge">🚚 ${resultados.veiculos.length} veículos</span>
                    </div>
                </div>
            `;

            // Resultados de Carregamentos
            if (resultados.carregamentos.length > 0) {
                html += `
                    <div class="search-category">
                        <h3>📦 Carregamentos (${resultados.carregamentos.length})</h3>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Motorista</th>
                                        <th>Veículo</th>
                                        <th>Data</th>
                                        <th>Rota</th>
                                        <th>Nº Carga</th>
                                        <th>Valor</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${resultados.carregamentos.map(c => `
                                        <tr>
                                            <td>
                                                <div class="driver-info-small">
                                                    <div class="driver-avatar-small">${c.motoristaNome.charAt(0)}</div>
                                                    <span>${this.destacarTermo(c.motoristaNome, termo)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="vehicle-info">
                                                    <span class="vehicle-placa">${this.destacarTermo(c.veiculoPlaca, termo)}</span>
                                                </div>
                                            </td>
                                            <td>${this.formatarData(c.data)}</td>
                                            <td>
                                                <span class="rota-badge">${this.destacarTermo(c.rota, termo)}</span>
                                            </td>
                                            <td>
                                                <span class="numero-carregamento">${this.destacarTermo(c.numeroCarregamento, termo)}</span>
                                            </td>
                                            <td class="valor-destaque">R$ ${this.formatarMoeda(c.valor)}</td>
                                            <td>
                                                <span class="status-badge status-${c.status.toLowerCase().replace(' ', '-')}">
                                                    ${c.status}
                                                </span>
                                            </td>
                                            <td class="actions-cell">
                                                <button class="btn-icon btn-edit" onclick="app.editarCarregamento('${c.id}')" title="Editar">
                                                    ✏️
                                                </button>
                                                <button class="btn-icon btn-delete" onclick="app.removerCarregamento('${c.id}')" title="Excluir">
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }

            // Resultados de Motoristas
            if (resultados.motoristas.length > 0) {
                html += `
                    <div class="search-category">
                        <h3>👥 Motoristas (${resultados.motoristas.length})</h3>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>CPF</th>
                                        <th>Telefone</th>
                                        <th>CNH</th>
                                        <th>VT Diário</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${resultados.motoristas.map(m => `
                                        <tr>
                                            <td>
                                                <div class="driver-info-small">
                                                    <div class="driver-avatar-small">${m.nome.charAt(0)}</div>
                                                    <div>
                                                        <strong>${this.destacarTermo(m.nome, termo)}</strong>
                                                        <div class="driver-details">
                                                            <small>Categoria: ${m.categoriaCnh}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>${this.motoristasManager.formatarCPF(m.cpf)}</td>
                                            <td>${m.telefone ? this.motoristasManager.formatarTelefone(m.telefone) : '-'}</td>
                                            <td>${this.destacarTermo(m.cnh, termo)}</td>
                                            <td>R$ ${this.formatarMoeda(m.vtDiario)}</td>
                                            <td>
                                                <span class="status-badge ${m.ativo ? 'status-active' : 'status-inactive'}">
                                                    ${m.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td class="actions-cell">
                                                <button class="btn-icon btn-edit" onclick="app.editarMotorista('${m.id}')" title="Editar">
                                                    ✏️
                                                </button>
                                                ${m.ativo ? `
                                                    <button class="btn-icon btn-warning" onclick="app.inativarMotorista('${m.id}')" title="Inativar">
                                                        🚫
                                                    </button>
                                                ` : `
                                                    <button class="btn-icon btn-success" onclick="app.ativarMotorista('${m.id}')" title="Ativar">
                                                        ✅
                                                    </button>
                                                `}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }

            // Resultados de Veículos
            if (resultados.veiculos.length > 0) {
                html += `
                    <div class="search-category">
                        <h3>🚚 Veículos (${resultados.veiculos.length})</h3>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Placa</th>
                                        <th>Modelo</th>
                                        <th>Marca</th>
                                        <th>Ano</th>
                                        <th>Tipo</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${resultados.veiculos.map(v => `
                                        <tr>
                                            <td>
                                                <div class="vehicle-info">
                                                    <span class="vehicle-placa">${this.destacarTermo(v.placa, termo)}</span>
                                                </div>
                                            </td>
                                            <td>${this.destacarTermo(v.modelo, termo)}</td>
                                            <td>${this.destacarTermo(v.marca, termo)}</td>
                                            <td>${v.ano}</td>
                                            <td>
                                                <span class="tipo-badge">${v.tipo}</span>
                                            </td>
                                            <td>
                                                <span class="status-badge status-${v.status.toLowerCase()}">
                                                    ${v.status}
                                                </span>
                                            </td>
                                            <td class="actions-cell">
                                                <button class="btn-icon btn-edit" onclick="app.editarVeiculo('${v.id}')" title="Editar">
                                                    ✏️
                                                </button>
                                                <button class="btn-icon btn-danger" onclick="app.excluirVeiculo('${v.id}')" title="Excluir">
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
        }

        conteudo.innerHTML = html;
    }

    destacarTermo(texto, termo) {
        if (!termo) return texto;
        const regex = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return texto.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    // Voltar para a seção anterior após busca
    voltarDaBusca() {
        const buscaSection = document.getElementById('busca-section');
        if (buscaSection) {
            buscaSection.remove();
        }
        
        if (this.secaoAnteriorBusca) {
            this.mudarSecao(this.secaoAnteriorBusca);
        } else {
            this.mudarSecao('dashboard');
        }
        
        // Limpar campo de busca
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.secaoAnteriorBusca = null;
    }

    // ATUALIZAÇÃO COMPLETA DO SISTEMA
    atualizarUICompleta() {
        console.log('🔄 Atualizando interface completa...');
        
        // Atualizar todas as seções
        this.atualizarTabelaCarregamentos();
        this.atualizarListaMotoristas();
        this.atualizarListaVeiculos();
        
        // Atualizar estatísticas
        this.atualizarStatsMotoristas();
        this.atualizarStatsVeiculos();
        this.atualizarStatsCarregamentos();
        
        // Atualizar selects
        this.carregarMotoristasSelect();
        this.carregarVeiculosSelect();
        this.carregarFiltroMotoristas();
        this.carregarFiltroVeiculos();
        
        // Atualizar dashboard se estiver ativo
        if (document.querySelector('#dashboard-section.active')) {
            this.atualizarDashboard();
        }
        
        // Atualizar relatórios se estiver ativo
        if (document.querySelector('#relatorios-section.active')) {
            this.carregarRelatorios();
        }
        
        // Atualizar contadores da sidebar
        this.atualizarContadoresSidebar();
    }

    atualizarStatsCarregamentos() {
        const totais = this.carregamentosManager.calcularTotais();
        const hoje = new Date().toISOString().split('T')[0];
        const carregamentosHoje = this.carregamentosManager.obterTodos()
            .filter(c => c.data === hoje).length;
        
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        const carregamentosSemana = this.carregamentosManager.obterTodos()
            .filter(c => new Date(c.data) >= umaSemanaAtras).length;

        this.atualizarElementoTexto('totalCarregamentos', totais.totalRegistros);
        this.atualizarElementoTexto('carregamentosHoje', carregamentosHoje);
        this.atualizarElementoTexto('carregamentosSemana', carregamentosSemana);
        this.atualizarElementoTexto('valorTotal', `R$ ${this.formatarMoeda(totais.totalMensal)}`);
    }

    atualizarStatsMotoristas() {
        const motoristas = this.motoristasManager.obterTodos();
        const ativos = motoristas.filter(m => m.ativo).length;
        const inativos = motoristas.filter(m => !m.ativo).length;
        
        let vtTotal = 0;
        motoristas.filter(m => m.ativo).forEach(motorista => {
            const carregamentos = this.carregamentosManager.obterPorMotorista(motorista.id);
            const diasUnicos = new Set(carregamentos.map(c => c.data)).size;
            vtTotal += diasUnicos * motorista.vtDiario;
        });

        this.atualizarElementoTexto('totalMotoristas', motoristas.length);
        this.atualizarElementoTexto('motoristasAtivos', ativos);
        this.atualizarElementoTexto('motoristasInativos', inativos);
        this.atualizarElementoTexto('vtTotalMotoristas', `R$ ${this.formatarMoeda(vtTotal)}`);
    }

    atualizarStatsVeiculos() {
        const veiculos = this.veiculosManager.obterTodos();
        const disponiveis = veiculos.filter(v => v.status === 'Disponível').length;
        const manutencao = veiculos.filter(v => v.status === 'Manutenção').length;
        const total = veiculos.length;

        this.atualizarElementoTexto('totalVeiculos', total);
        this.atualizarElementoTexto('veiculosAtivos', disponiveis);
        this.atualizarElementoTexto('veiculosManutencao', manutencao);
        this.atualizarElementoTexto('veiculosDisponiveis', disponiveis);
    }

    atualizarContadoresSidebar() {
        this.atualizarElementoTexto('carregamentosCount', this.carregamentosManager.obterTodos().length);
        this.atualizarElementoTexto('motoristasCount', this.motoristasManager.obterTodos().length);
        this.atualizarElementoTexto('veiculosCount', this.veiculosManager.obterTodos().length);
    }

    // UTILITÁRIOS
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }

    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    mostrarMensagem(mensagem, tipo = 'info') {
        this.exportManager.mostrarMensagem(mensagem, tipo);
    }

    aplicarMascaraCPF(cpf) {
        return cpf.replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .slice(0, 14);
    }

    aplicarMascaraTelefone(telefone) {
        const numbers = telefone.replace(/\D/g, '');
        if (numbers.length === 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (numbers.length === 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return numbers;
    }

    // NOVA FUNÇÃO: Atualizar elemento de forma segura
    atualizarElementoTexto(id, texto) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = texto;
        }
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado - Iniciando LoadControl Pro');
    window.app = new LoadControlApp();
});