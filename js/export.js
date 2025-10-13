// Funcionalidades de exportação
class ExportManager {
    // Exportar para Excel
    exportarParaExcel() {
        const carregamentos = carregamentosManager.obterTodos();
        
        if (carregamentos.length === 0) {
            this.mostrarMensagem('Nenhum dado para exportar!', 'warning');
            return;
        }

        try {
            // Preparar dados para exportação
            const dadosExportacao = carregamentos.map(c => ({
                'Motorista': c.motoristaNome,
                'Veículo': c.veiculoPlaca,
                'Data': this.formatarDataExcel(c.data),
                'Rota': c.rota,
                'Número Carregamento': c.numeroCarregamento,
                'Valor': c.valor,
                'Status': c.status
            }));

            // Adicionar totais
            const totais = carregamentosManager.calcularTotais();
            dadosExportacao.push({
                'Motorista': 'TOTAIS',
                'Veículo': '',
                'Data': '',
                'Rota': '',
                'Número Carregamento': '',
                'Valor': totais.totalMensal,
                'Status': ''
            });

            // Criar workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(dadosExportacao.slice(0, -1));

            // Sheet de estatísticas por motorista
            const estatisticas = carregamentosManager.obterEstatisticasMotoristas();
            const wsEstatisticas = XLSX.utils.json_to_sheet(estatisticas.map(e => ({
                'Motorista': e.motorista,
                'Total Carregamentos': e.totalCarregamentos,
                'Faturamento Total': e.totalValor,
                'Dias Trabalhados': e.diasTrabalhados,
                'VT Diário': e.vtDiario,
                'VT Total': e.vtTotal,
                'Ticket Médio': e.ticketMedio
            })));

            // Sheet de veículos
            const veiculos = veiculosManager.obterTodos();
            const wsVeiculos = XLSX.utils.json_to_sheet(veiculos.map(v => ({
                'Placa': v.placa,
                'Modelo': v.modelo,
                'Marca': v.marca,
                'Ano': v.ano,
                'Capacidade': v.capacidade,
                'Tipo': v.tipo,
                'Status': v.status
            })));

            // Sheet de totais
            const wsTotais = XLSX.utils.json_to_sheet([{
                'Descrição': 'Valor',
                'Total Mensal': totais.totalMensal,
                'Ticket Médio': totais.ticketMedio,
                'Dias Trabalhados': totais.diasTrabalhados,
                'VT Total': totais.vtTotal
            }]);

            // Configurar estilos
            this.aplicarEstilosExcel(ws, carregamentos.length);
            this.aplicarEstilosExcel(wsEstatisticas, estatisticas.length);
            this.aplicarEstilosExcel(wsVeiculos, veiculos.length);
            this.aplicarEstilosExcel(wsTotais, 1);
            
            XLSX.utils.book_append_sheet(wb, ws, 'Carregamentos');
            XLSX.utils.book_append_sheet(wb, wsEstatisticas, 'Estatísticas');
            XLSX.utils.book_append_sheet(wb, wsVeiculos, 'Veículos');
            XLSX.utils.book_append_sheet(wb, wsTotais, 'Totais');

            // Gerar arquivo
            const nomeArquivo = `carregamentos_frota_${this.formatarDataExcel(new Date())}.xlsx`;
            XLSX.writeFile(wb, nomeArquivo);
            
            this.mostrarMensagem('Exportação concluída com sucesso!', 'success');
        } catch (error) {
            console.error('Erro na exportação:', error);
            this.mostrarMensagem('Erro ao exportar dados!', 'error');
        }
    }

    // Aplicar estilos ao Excel
    aplicarEstilosExcel(ws, totalLinhas) {
        if (!ws['!ref']) return;

        // Definir largura das colunas baseada no conteúdo
        const range = XLSX.utils.decode_range(ws['!ref']);
        const colunas = [];
        
        for (let C = range.s.c; C <= range.e.c; C++) {
            let maxLength = 0;
            for (let R = range.s.r; R <= range.e.r; R++) {
                const cell_ref = XLSX.utils.encode_cell({c: C, r: R});
                if (ws[cell_ref] && ws[cell_ref].v) {
                    const length = ws[cell_ref].v.toString().length;
                    if (length > maxLength) maxLength = length;
                }
            }
            colunas.push({ wch: Math.min(Math.max(maxLength + 2, 10), 30) });
        }
        ws['!cols'] = colunas;

        // Adicionar formatação básica
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cell_ref = XLSX.utils.encode_cell({c: C, r: R});
                
                if (!ws[cell_ref]) continue;

                // Formatar cabeçalho
                if (R === range.s.r) {
                    if (!ws[cell_ref].s) ws[cell_ref].s = {};
                    ws[cell_ref].s.font = { bold: true };
                }

                // Formatar colunas numéricas
                const isNumeric = !isNaN(ws[cell_ref].v) && ws[cell_ref].v !== '' && R !== range.s.r;
                if (isNumeric) {
                    if (!ws[cell_ref].s) ws[cell_ref].s = {};
                    ws[cell_ref].s.numFmt = '#,##0.00';
                }
            }
        }
    }

    // Formatar data para Excel
    formatarDataExcel(data) {
        const date = new Date(data);
        return date.toLocaleDateString('pt-BR');
    }

    // Mostrar mensagem de feedback
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

// Instância global do export manager
const exportManager = new ExportManager();