// Gerenciamento de autenticação
class AuthManager {
    constructor() {
        this.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Credenciais padrão (em produção, isso deve ser substituído por autenticação segura)
        const validCredentials = [
            { username: 'admin', password: 'admin123', name: 'Administrador' },
            { username: 'PauloJesus', password: '050615', name: 'Paulo Jesus' }
        ];

        const user = validCredentials.find(u => 
            u.username === username && u.password === password
        );

        if (user) {
            this.isAuthenticated = true;
            this.currentUser = {
                name: user.name,
                username: user.username,
                role: user.name === 'Administrador' ? 'Administrador' : 'Usuário'
            };

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            this.mostrarMensagem(`Bem-vindo, ${user.name}!`, 'success');
            this.updateUI();
            
            // Inicializar aplicação principal
            if (window.app) {
                window.app.init();
            }
        } else {
            this.mostrarMensagem('Usuário ou senha inválidos!', 'error');
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');

        this.mostrarMensagem('Logout realizado com sucesso!', 'info');
        this.updateUI();
    }

    updateUI() {
        const authModal = document.getElementById('authModal');
        const appContainer = document.querySelector('.app-container');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        if (this.isAuthenticated) {
            if (authModal) authModal.classList.remove('active');
            if (appContainer) appContainer.style.display = 'flex';
            
            if (userAvatar && this.currentUser) {
                userAvatar.textContent = this.currentUser.name.charAt(0);
            }
            if (userName && this.currentUser) {
                userName.textContent = this.currentUser.name;
            }
        } else {
            if (authModal) authModal.classList.add('active');
            if (appContainer) appContainer.style.display = 'none';
        }
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

    // Verificar permissões
    temPermissao(permissao) {
        if (!this.currentUser) return false;
        
        const permissoes = {
            'Administrador': ['tudo'],
            'Usuário': ['visualizar', 'editar_limite']
        };

        return permissoes[this.currentUser.role]?.includes('tudo') || 
               permissoes[this.currentUser.role]?.includes(permissao);
    }
}

// Instância global do gerenciador de autenticação
const authManager = new AuthManager();