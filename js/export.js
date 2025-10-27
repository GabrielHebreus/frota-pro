// Gerenciamento de exportação
class ExportManager {
    constructor() {
        this.mensagemTimeout = null;
    }

    exportarParaExcel() {
        try {
            const carregamentos = carregamentosManager.obterTodos();
            
            if (carregamentos.length === 0) {
                this.mostrarMensagem('❌ Não há dados para exportar!', 'warning');
                return;
            }

            const workbook = XLSX.utils.book_new();
            
            const dadosExportacao = carregamentos.map(c => {
                // CORREÇÃO: Cálculo do percentual - Valor (R$) ÷ Valor do Carregamento
                const percentual = c.valorCarregamento > 0 ? 
                    ((c.valor / c.valorCarregamento) * 100).toFixed(1) + '%' : 
                    '0%';

                return {
                    'Motorista': c.motoristaNome,
                    'Veículo': c.veiculoPlaca,
                    'Data': app.formatarData(c.data),
                    'Rota': c.rota,
                    'Número Carregamento': c.numeroCarregamento,
                    'Valor (R$)': c.valor,
                    'Valor Carregamento (R$)': c.valorCarregamento,
                    'Percentual': percentual,
                    'Status': c.status
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
            
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Carregamentos');
            
            const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            const nomeArquivo = `carregamentos_${dataAtual}.xlsx`;
            
            XLSX.writeFile(workbook, nomeArquivo);
            this.mostrarMensagem('✅ Planilha exportada com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.mostrarMensagem('❌ Erro ao exportar planilha!', 'error');
        }
    }

    exportarRelatorioFiltrado(dadosExportacao) {
        try {
            const workbook = XLSX.utils.book_new();
            
            // Worksheet 1: Carregamentos Detalhados
            const carregamentosData = dadosExportacao.carregamentos.map(c => {
                // CORREÇÃO: Cálculo do percentual - Valor (R$) ÷ Valor do Carregamento
                const percentual = c.valorCarregamento > 0 ? 
                    ((c.valor / c.valorCarregamento) * 100).toFixed(1) + '%' : 
                    '0%';

                return {
                    'Motorista': c.motoristaNome,
                    'Veículo': c.veiculoPlaca,
                    'Data': app.formatarData(c.data),
                    'Rota': c.rota,
                    'Número Carregamento': c.numeroCarregamento,
                    'Valor (R$)': c.valor,
                    'Valor Carregamento (R$)': c.valorCarregamento,
                    'Percentual': percentual,
                    'Status': c.status
                };
            });

            const carregamentosWorksheet = XLSX.utils.json_to_sheet(carregamentosData);
            XLSX.utils.book_append_sheet(workbook, carregamentosWorksheet, 'Carregamentos');

            // Worksheet 2: Estatísticas por Motorista
            const estatisticasData = dadosExportacao.estatisticas.map(e => ({
                'Motorista': e.motorista,
                'Total Carregamentos': e.totalCarregamentos,
                'Faturamento Total (R$)': e.totalValor,
                'Dias Trabalhados': e.diasTrabalhados,
                'VT Diário (R$)': e.vtDiario,
                'VT Total (R$)': e.vtTotal,
                'Ticket Médio (R$)': e.ticketMedio
            }));

            const estatisticasWorksheet = XLSX.utils.json_to_sheet(estatisticasData);
            XLSX.utils.book_append_sheet(workbook, estatisticasWorksheet, 'Estatísticas');

            // Worksheet 3: Resumo Geral
            const resumoData = [
                {'Descrição': 'Faturamento Total', 'Valor': `R$ ${app.formatarMoeda(dadosExportacao.totais.totalMensal)}`},
                {'Descrição': 'Ticket Médio', 'Valor': `R$ ${app.formatarMoeda(dadosExportacao.totais.ticketMedio)}`},
                {'Descrição': 'Dias Trabalhados', 'Valor': dadosExportacao.totais.diasTrabalhados},
                {'Descrição': 'VT Total', 'Valor': `R$ ${app.formatarMoeda(dadosExportacao.totais.vtTotal)}`},
                {'Descrição': 'Filtro Motorista', 'Valor': dadosExportacao.filtros.motorista},
                {'Descrição': 'Filtro Veículo', 'Valor': dadosExportacao.filtros.veiculo},
                {'Descrição': 'Período Início', 'Valor': dadosExportacao.filtros.dataInicio},
                {'Descrição': 'Período Fim', 'Valor': dadosExportacao.filtros.dataFim}
            ];

            const resumoWorksheet = XLSX.utils.json_to_sheet(resumoData);
            XLSX.utils.book_append_sheet(workbook, resumoWorksheet, 'Resumo');

            const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            const nomeArquivo = `relatorio_filtrado_${dataAtual}.xlsx`;
            
            XLSX.writeFile(workbook, nomeArquivo);
            this.mostrarMensagem('📊 Relatório filtrado exportado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            this.mostrarMensagem('❌ Erro ao exportar relatório!', 'error');
        }
    }

    mostrarMensagem(mensagem, tipo = 'info') {
        const mensagemAnterior = document.querySelector('.message-toast');
        if (mensagemAnterior) {
            mensagemAnterior.remove();
        }

        if (this.mensagemTimeout) {
            clearTimeout(this.mensagemTimeout);
        }

        const toast = document.createElement('div');
        toast.className = `message-toast message-${tipo}`;
        toast.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${this.getIcone(tipo)}</span>
                <span class="message-text">${mensagem}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        this.mensagemTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 5000);
    }

    getIcone(tipo) {
        const icones = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icones[tipo] || 'ℹ️';
    }
}

// Instância global
const exportManager = new ExportManager();