// Gerenciamento de veículos
class VeiculosManager {
    constructor() {
        this.veiculos = this.carregarDoLocalStorage();
    }

    // Carregar dados do localStorage
    carregarDoLocalStorage() {
        const dados = localStorage.getItem('veiculos');
        if (dados) {
            return JSON.parse(dados);
        } else {
            // Dados de exemplo
            const veiculosExemplo = [
                {
                    id: '1',
                    placa: 'ABC-1234',
                    modelo: 'Volvo FH 540',
                    marca: 'Volvo',
                    ano: 2023,
                    capacidade: 25000,
                    tipo: 'Carreta',
                    status: 'Disponível',
                    timestamp: new Date().toISOString()
                },
                {
                    id: '2',
                    placa: 'XYZ-5678',
                    modelo: 'Mercedes-Benz Actros',
                    marca: 'Mercedes-Benz',
                    ano: 2022,
                    capacidade: 18000,
                    tipo: 'Caminhão',
                    status: 'Disponível',
                    timestamp: new Date().toISOString()
                }
            ];
            this.salvarNoLocalStorage(veiculosExemplo);
            return veiculosExemplo;
        }
    }

    // Salvar dados no localStorage
    salvarNoLocalStorage(dados = this.veiculos) {
        localStorage.setItem('veiculos', JSON.stringify(dados));
    }

    // Adicionar novo veículo
    adicionar(veiculo) {
        // Verificar se placa já existe
        if (this.veiculos.some(v => v.placa === veiculo.placa)) {
            throw new Error('Placa já cadastrada!');
        }

        const novoVeiculo = {
            id: Date.now().toString(),
            placa: veiculo.placa.toUpperCase(),
            modelo: veiculo.modelo,
            marca: veiculo.marca,
            ano: parseInt(veiculo.ano),
            capacidade: parseFloat(veiculo.capacidade) || 0,
            tipo: veiculo.tipo,
            status: veiculo.status || 'Disponível',
            timestamp: new Date().toISOString()
        };

        this.veiculos.push(novoVeiculo);
        this.salvarNoLocalStorage();
        return novoVeiculo;
    }

    // Remover veículo
    remover(id) {
        this.veiculos = this.veiculos.filter(v => v.id !== id);
        this.salvarNoLocalStorage();
    }

    // Editar veículo
    editar(id, dadosAtualizados) {
        const index = this.veiculos.findIndex(v => v.id === id);
        if (index !== -1) {
            // Verificar se outro veículo já tem esta placa
            const placaExistente = this.veiculos.some(v => 
                v.id !== id && v.placa === dadosAtualizados.placa
            );
            
            if (placaExistente) {
                throw new Error('Placa já cadastrada em outro veículo!');
            }

            this.veiculos[index] = {
                ...this.veiculos[index],
                ...dadosAtualizados,
                ano: parseInt(dadosAtualizados.ano),
                capacidade: parseFloat(dadosAtualizados.capacidade) || 0
            };
            this.salvarNoLocalStorage();
            return this.veiculos[index];
        }
        return null;
    }

    // Alterar status do veículo
    alterarStatus(id, status) {
        const index = this.veiculos.findIndex(v => v.id === id);
        if (index !== -1) {
            this.veiculos[index].status = status;
            this.salvarNoLocalStorage();
            return this.veiculos[index];
        }
        return null;
    }

    // Obter veículo por ID
    obterPorId(id) {
        return this.veiculos.find(v => v.id === id);
    }

    // Obter veículos disponíveis
    obterDisponiveis() {
        return this.veiculos.filter(v => v.status === 'Disponível');
    }

    // Obter todos os veículos
    obterTodos() {
        return this.veiculos.sort((a, b) => a.placa.localeCompare(b.placa));
    }

    // Obter veículos por status
    obterPorStatus(status) {
        return this.veiculos.filter(v => v.status === status);
    }

    // NOVO: Obter veículos por tipo
    obterPorTipo(tipo) {
        return this.veiculos.filter(v => v.tipo === tipo);
    }

    // NOVO: Obter estatísticas da frota
    obterEstatisticasFrota() {
        const total = this.veiculos.length;
        const disponiveis = this.obterDisponiveis().length;
        const emManutencao = this.obterPorStatus('Manutenção').length;
        const taxaUtilizacao = total > 0 ? Math.round((disponiveis / total) * 100) : 0;

        return {
            total,
            disponiveis,
            emManutencao,
            taxaUtilizacao
        };
    }

    // NOVO: Buscar veículos por termo
    buscarVeiculos(termo) {
        termo = termo.toLowerCase();
        return this.veiculos.filter(v => 
            v.placa.toLowerCase().includes(termo) ||
            v.modelo.toLowerCase().includes(termo) ||
            v.marca.toLowerCase().includes(termo) ||
            v.tipo.toLowerCase().includes(termo) ||
            v.status.toLowerCase().includes(termo)
        );
    }

    // Formatar placa
    formatarPlaca(placa) {
        return placa.replace(/([A-Za-z]{3})(\d{4})/, '$1-$2');
    }
}

// Instância global do gerenciador de veículos
const veiculosManager = new VeiculosManager();