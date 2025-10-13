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

    // NOVO: Exportar relatório filtrado
    exportarRelatorioFiltrado(dadosExportacao) {
        try {
            const { carregamentos, estatisticas, totais, filtros } = dadosExportacao;

            // Criar workbook
            const wb = XLSX.utils.book_new();

            // Sheet de carregamentos
            const wsCarregamentos = XLSX.utils.json_to_sheet(carregamentos.map(c => ({
                'Motorista': c.motoristaNome,
                'Veículo': c.veiculoPlaca,
                'Data': this.formatarDataExcel(c.data),
                'Rota': c.rota,
                'Número Carregamento': c.numeroCarregamento,
                'Valor': c.valor,
                'Status': c.status
            })));

            // Sheet de estatísticas
            const wsEstatisticas = XLSX.utils.json_to_sheet(estatisticas.map(e => ({
                'Motorista': e.motorista,
                'Total Carregamentos': e.totalCarregamentos,
                'Faturamento Total': e.totalValor,
                'Dias Trabalhados': e.diasTrabalhados,
                'VT Diário': e.vtDiario,
                'VT Total': e.vtTotal,
                'Ticket Médio': e.ticketMedio
            })));

            // Sheet de totais
            const wsTotais = XLSX.utils.json_to_sheet([{
                'Descrição': 'Valor',
                'Total Mensal': totais.totalMensal,
                'Ticket Médio': totais.ticketMedio,
                'Dias Trabalhados': totais.diasTrabalhados,
                'VT Total': totais.vtTotal
            }]);

            // Sheet de filtros aplicados
            const wsFiltros = XLSX.utils.json_to_sheet([
                { 'Filtro': 'Motorista', 'Valor': filtros.motorista },
                { 'Filtro': 'Veículo', 'Valor': filtros.veiculo },
                { 'Filtro': 'Data Início', 'Valor': filtros.dataInicio },
                { 'Filtro': 'Data Fim', 'Valor': filtros.dataFim }
            ]);

            // Aplicar estilos
            this.aplicarEstilosExcel(wsCarregamentos, carregamentos.length);
            this.aplicarEstilosExcel(wsEstatisticas, estatisticas.length);
            this.aplicarEstilosExcel(wsTotais, 1);
            this.aplicarEstilosExcel(wsFiltros, 4);

            // Adicionar sheets
            XLSX.utils.book_append_sheet(wb, wsCarregamentos, 'Carregamentos');
            XLSX.utils.book_append_sheet(wb, wsEstatisticas, 'Estatísticas');
            XLSX.utils.book_append_sheet(wb, wsTotais, 'Totais');
            XLSX.utils.book_append_sheet(wb, wsFiltros, 'Filtros Aplicados');

            // Gerar arquivo
            const nomeArquivo = `relatorio_filtrado_${this.formatarDataExcel(new Date())}.xlsx`;
            XLSX.writeFile(wb, nomeArquivo);

        } catch (error) {
            console.error('Erro na exportação do relatório filtrado:', error);
            this.mostrarMensagem('Erro ao exportar relatório filtrado!', 'error');
        }
    }

    // NOVO: Exportar template para importação
    exportarTemplate() {
        const template = [
            {
                'Motorista': 'João Silva',
                'Veículo': 'ABC-1234',
                'Data': '2024-01-15',
                'Rota': 'SP-RJ',
                'Número Carregamento': '12345/67890',
                'Valor': 1500.00,
                'Status': 'Pendente'
            }
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(template);
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'template_importacao_carregamentos.xlsx');
        
        this.mostrarMensagem('📋 Template baixado! Preencha e importe os dados.', 'success');
    }

    // NOVO: Importar de Excel
    async importarDeExcel(arquivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    
                    let importados = 0;
                    let erros = 0;
                    
                    jsonData.forEach((linha, index) => {
                        try {
                            // Validar dados básicos
                            if (!linha.Motorista || !linha.Veículo || !linha.Data) {
                                console.warn(`Linha ${index + 2}: Dados incompletos`);
                                erros++;
                                return;
                            }
                            
                            // Aqui você implementaria a lógica de importação
                            // Buscar ID do motorista pelo nome, etc.
                            
                            importados++;
                        } catch (error) {
                            console.error(`Erro na linha ${index + 2}:`, error);
                            erros++;
                        }
                    });
                    
                    resolve({ importados, erros });
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.readAsArrayBuffer(arquivo);
        });
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