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
            // Dados de exemplo com veículos associados
            const motoristasExemplo = [
                {
                    id: '1',
                    nome: 'João Silva',
                    cpf: '12345678901',
                    telefone: '11999999999',
                    cnh: '12345678901',
                    categoriaCnh: 'C',
                    veiculoAssociadoId: '1', // NOVO: ID do veículo associado
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
                    veiculoAssociadoId: '2', // NOVO: ID do veículo associado
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

        // Verificar se CNH já existe
        if (this.motoristas.some(m => m.cnh === motorista.cnh)) {
            throw new Error('CNH já cadastrada!');
        }

        const novoMotorista = {
            id: Date.now().toString(),
            nome: motorista.nome,
            cpf: motorista.cpf,
            telefone: motorista.telefone || '',
            cnh: motorista.cnh,
            categoriaCnh: motorista.categoriaCnh,
            veiculoAssociadoId: motorista.veiculoAssociadoId, // NOVO: Veículo associado
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

            // Verificar se outro motorista já tem esta CNH
            const cnhExistente = this.motoristas.some(m => 
                m.id !== id && m.cnh === dadosAtualizados.cnh
            );
            
            if (cnhExistente) {
                throw new Error('CNH já cadastrada em outro motorista!');
            }

            this.motoristas[index] = {
                ...this.motoristas[index],
                ...dadosAtualizados,
                veiculoAssociadoId: dadosAtualizados.veiculoAssociadoId, // NOVO: Atualizar veículo associado
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

// Instância global do gerenciador de motoristas
const motoristasManager = new MotoristasManager();