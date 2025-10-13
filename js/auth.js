// Sistema de autenticação
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Verificar se há usuário logado no localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            this.showApp();
        } else {
            this.showAuthModal();
        }

        this.bindEvents();
    }

    bindEvents() {
        // Formulário de login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Botão de logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Validação - usuário: admin, senha: 123456
        if (username === 'Paulojesus' && password === '050615') {
            this.currentUser = {
                username: username,
                name: 'Administrador',
                role: 'Gestor de Frota'
            };
            this.isAuthenticated = true;
            
            // Salvar no localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            this.showApp();
            this.showMessage('Login realizado com sucesso!', 'success');
        } else {
            this.showMessage('Usuário ou senha incorretos!', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('currentUser');
        this.showAuthModal();
        this.showMessage('Logout realizado com sucesso!', 'info');
    }

    showAuthModal() {
        document.getElementById('authModal').classList.add('active');
        document.querySelector('.app-container').style.display = 'none';
    }

    showApp() {
        document.getElementById('authModal').classList.remove('active');
        document.querySelector('.app-container').style.display = 'flex';
        
        // Atualizar informações do usuário
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userAvatar').textContent = this.currentUser.name.charAt(0);
        
        // Inicializar a aplicação principal
        if (window.app) {
            window.app.init();
        }
    }

    showMessage(mensagem, tipo = 'info') {
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

// Instância global do gerenciador de autenticação
const authManager = new AuthManager();