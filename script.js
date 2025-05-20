// Rolagem suave para navegação
document.querySelectorAll('a.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Simulação de envio de formulário
function enviarFormulario(event) {
  event.preventDefault();
  document.querySelector('.contact-form').style.display = 'none';
  document.getElementById('mensagem-enviada').style.display = 'block';
  return false;
}