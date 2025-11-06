// Tema escuro
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Define tema inicial baseado na preferência do sistema
    if (prefersDark) {
        document.body.setAttribute('data-theme', 'dark');
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Restaura tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// Animações no scroll
function initAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const options = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    elements.forEach(el => observer.observe(el));
}

// Botão voltar ao topo
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Formulário de contato
function initContactForm() {
    const form = document.getElementById('contactForm');
    const feedback = document.getElementById('mensagem-enviada');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const button = form.querySelector('button');
        const buttonText = button.querySelector('.btn-text');
        const loader = button.querySelector('.btn-loader');
        
        // Mostra loading
        buttonText.style.opacity = '0';
        loader.style.display = 'block';
        
        try {
            // Simula envio (substitua por sua lógica de envio real)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            feedback.textContent = 'Mensagem enviada com sucesso!';
            feedback.style.color = 'var(--accent-primary)';
            form.reset();
            
        } catch (error) {
            feedback.textContent = 'Erro ao enviar mensagem. Tente novamente.';
            feedback.style.color = '#dc3545';
            
        } finally {
            // Remove loading
            buttonText.style.opacity = '1';
            loader.style.display = 'none';
            
            // Mostra feedback
            feedback.style.display = 'block';
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 5000);
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAnimations();
    initBackToTop();
    initContactForm();
    initChatbot();
});