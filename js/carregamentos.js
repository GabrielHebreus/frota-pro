// Gerenciamento de carregamentos
class CarregamentosManager {
    constructor() {
        this.carregamentos = this.carregarDoLocalStorage();
        this.vtDiario = parseFloat(localStorage.getItem('vtDiario')) || 9.00;
    }

    // Carregar dados do localStorage
    carregarDoLocalStorage() {
        const dados = localStorage.getItem('carregamentos');
        return dados ? JSON.parse(dados) : [];
    }

    // Salvar dados no localStorage
    salvarNoLocalStorage() {
        localStorage.setItem('carregamentos', JSON.stringify(this.carregamentos));
    }

    // Configurar VT diário
    configurarVtDiario(valor) {
        this.vtDiario = parseFloat(valor);
        localStorage.setItem('vtDiario', this.vtDiario.toString());
    }

    // Obter VT diário
    obterVtDiario() {
        return this.vtDiario;
    }

    // Adicionar novo carregamento
    adicionar(carregamento) {
        // Verificar se motorista existe e está ativo
        const motorista = motoristasManager.obterPorId(carregamento.motoristaId);
        if (!motorista || !motorista.ativo) {
            throw new Error('Motorista não encontrado ou inativo!');
        }

        // Verificar se veículo existe
        const veiculo = veiculosManager.obterPorId(carregamento.veiculoId);
        if (!veiculo) {
            throw new Error('Veículo não encontrado!');
        }

        const novoCarregamento = {
            id: Date.now().toString(),
            motoristaId: carregamento.motoristaId,
            motoristaNome: motorista.nome,
            veiculoId: carregamento.veiculoId,
            veiculoPlaca: veiculo.placa,
            data: carregamento.data,
            rota: carregamento.rota,
            numeroCarregamento: carregamento.numeroCarregamento,
            valor: parseFloat(carregamento.valor),
            valorCarregamento: parseFloat(carregamento.valorCarregamento),
            status: carregamento.status || 'Pendente',
            timestamp: new Date().toISOString()
        };

        this.carregamentos.push(novoCarregamento);
        this.salvarNoLocalStorage();
        return novoCarregamento;
    }

    // Remover carregamento
    remover(id) {
        this.carregamentos = this.carregamentos.filter(c => c.id !== id);
        this.salvarNoLocalStorage();
    }

    // Editar carregamento
    editar(id, dadosAtualizados) {
        const index = this.carregamentos.findIndex(c => c.id === id);
        if (index !== -1) {
            this.carregamentos[index] = {
                ...this.carregamentos[index],
                ...dadosAtualizados,
                valor: parseFloat(dadosAtualizados.valor),
                valorCarregamento: parseFloat(dadosAtualizados.valorCarregamento)
            };
            this.salvarNoLocalStorage();
            return this.carregamentos[index];
        }
        return null;
    }

    // Limpar todos os carregamentos
    limparTodos() {
        this.carregamentos = [];
        this.salvarNoLocalStorage();
    }

    // Calcular totais - função atualizada para incluir valor total dos carregamentos
    calcularTotais() {
        if (this.carregamentos.length === 0) {
            return {
                totalMensal: 0,
                valorTotalCarregamentos: 0,
                ticketMedio: 0,
                diasTrabalhados: 0,
                vtTotal: 0,
                totalRegistros: 0
            };
        }

        const totalMensal = this.carregamentos.reduce((sum, c) => sum + c.valor, 0);
        const valorTotalCarregamentos = this.carregamentos.reduce((sum, c) => sum + c.valorCarregamento, 0);
        const ticketMedio = totalMensal / this.carregamentos.length;
        
        // Contar dias únicos trabalhados
        const diasUnicos = new Set(this.carregamentos.map(c => c.data)).size;
        
        // Calcular VT total corretamente - somar VT de cada motorista pelos dias que trabalhou
        let vtTotal = 0;
        const motoristasAtivos = motoristasManager.obterAtivos();
        
        motoristasAtivos.forEach(motorista => {
            const carregamentosMotorista = this.obterPorMotorista(motorista.id);
            const diasTrabalhadosMotorista = new Set(carregamentosMotorista.map(c => c.data)).size;
            vtTotal += diasTrabalhadosMotorista * motorista.vtDiario;
        });

        return {
            totalMensal,
            valorTotalCarregamentos,
            ticketMedio,
            diasTrabalhados: diasUnicos,
            vtTotal,
            totalRegistros: this.carregamentos.length
        };
    }

    // Obter carregamentos por motorista
    obterPorMotorista(motoristaId) {
        return this.carregamentos.filter(c => c.motoristaId === motoristaId);
    }

    // Obter carregamentos por veículo
    obterPorVeiculo(veiculoId) {
        return this.carregamentos.filter(c => c.veiculoId === veiculoId);
    }

    // Obter todos os carregamentos
    obterTodos() {
        return this.carregamentos.sort((a, b) => new Date(b.data) - new Date(a.data));
    }

    // Obter carregamento por ID
    obterPorId(id) {
        return this.carregamentos.find(c => c.id === id);
    }

    // Filtrar carregamentos por período
    filtrarPorPeriodo(dataInicio, dataFim) {
        return this.carregamentos.filter(c => {
            const dataCarregamento = new Date(c.data);
            return dataCarregamento >= new Date(dataInicio) && 
                   dataCarregamento <= new Date(dataFim);
        });
    }

    // Obter estatísticas por motorista
    obterEstatisticasMotoristas() {
        const motoristas = motoristasManager.obterAtivos();
        const estatisticas = [];

        motoristas.forEach(motorista => {
            const carregamentosMotorista = this.obterPorMotorista(motorista.id);
            
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

    // NOVO: Buscar carregamentos por número
    buscarPorNumero(numero) {
        return this.carregamentos.filter(c => 
            c.numeroCarregamento.toLowerCase().includes(numero.toLowerCase())
        );
    }

    // NOVO: Obter estatísticas rápidas do dia
    obterEstatisticasHoje() {
        const hoje = new Date().toISOString().split('T')[0];
        const carregamentosHoje = this.carregamentos.filter(c => c.data === hoje);
        
        return {
            total: carregamentosHoje.length,
            valorTotal: carregamentosHoje.reduce((sum, c) => sum + c.valor, 0),
            pendentes: carregamentosHoje.filter(c => c.status === 'Pendente').length
        };
    }

    // NOVA FUNÇÃO: Obter estatísticas do dia incluindo valor total dos carregamentos
    obterEstatisticasHojeCompleto() {
        const hoje = new Date().toISOString().split('T')[0];
        const carregamentosHoje = this.carregamentos.filter(c => c.data === hoje);
        
        const valorTotalDiarias = carregamentosHoje.reduce((sum, c) => sum + c.valor, 0);
        const valorTotalCarregamentos = carregamentosHoje.reduce((sum, c) => sum + c.valorCarregamento, 0);
        
        return {
            total: carregamentosHoje.length,
            valorTotalDiarias: valorTotalDiarias,
            valorTotalCarregamentos: valorTotalCarregamentos,
            pendentes: carregamentosHoje.filter(c => c.status === 'Pendente').length
        };
    }

    // NOVA FUNÇÃO: Obter estatísticas completas incluindo valor total dos carregamentos
    obterEstatisticasCompletas() {
        const totais = this.calcularTotais();
        const estatisticasMotoristas = this.obterEstatisticasMotoristas();
        
        return {
            ...totais,
            estatisticasMotoristas,
            valorMedioCarregamento: totais.totalRegistros > 0 ? 
                totais.valorTotalCarregamentos / totais.totalRegistros : 0
        };
    }

    // NOVO: Sugerir próximo número de carregamento
    sugerirProximoNumero() {
        const hoje = new Date().toISOString().split('T')[0];
        const carregamentosHoje = this.carregamentos.filter(c => c.data === hoje);
        return carregamentosHoje.length + 1;
    }

    // NOVO: Obter rotas mais frequentes
    obterRotasFrequentes() {
        const rotasCount = {};
        this.carregamentos.forEach(c => {
            rotasCount[c.rota] = (rotasCount[c.rota] || 0) + 1;
        });
        
        return Object.keys(rotasCount)
            .sort((a, b) => rotasCount[b] - rotasCount[a])
            .slice(0, 5);
    }

    // NOVA FUNÇÃO: Calcular valor total das diárias
    calcularValorTotalDiarias() {
        return this.carregamentos.reduce((sum, c) => sum + c.valor, 0);
    }

    // NOVA FUNÇÃO: Calcular valor total dos carregamentos
    calcularValorTotalCarregamentos() {
        return this.carregamentos.reduce((sum, c) => sum + c.valorCarregamento, 0);
    }
}

// Instância global do gerenciador
const carregamentosManager = new CarregamentosManager();