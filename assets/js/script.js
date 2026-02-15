// Inicialize o AOS apenas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 600,      // Reduzido para animações mais rápidas e fluidas
        easing: 'ease-out', // Easing otimizado para performance
        once: true,         // Evita que o navegador re-calcule a animação ao subir a página
        offset: 50,         // Diminuir o offset faz a animação disparar mais rápido
        disable: false,
        mirror: false,      // Não reverte animação ao rolar para cima
        anchorPlacement: 'top-bottom'  // Anima quando o topo do elemento atinge o bottom do viewport
    });

    const header = document.querySelector('header');
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const navOverlay = document.querySelector('.nav-overlay');

    let lastScrollY = window.scrollY;

// 1. Mostrar/Esconder Navbar ao Scroll
window.addEventListener('scroll', () => {
    // Se o menu mobile estiver aberto, não esconde a navbar
    if (nav.classList.contains('active')) return;

    if (window.scrollY > lastScrollY && window.scrollY > 100) {
        header.classList.add('nav-hidden'); // Desce: Esconde
    } else {
        header.classList.remove('nav-hidden'); // Sobe: Mostra
    }
    lastScrollY = window.scrollY;
});

// 2. Toggle Menu Mobile
function toggleMenu() {
    const isOpen = nav.classList.contains('active');
    
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
    navOverlay.classList.toggle('active');
    header.classList.toggle('menu-open'); // Remove/adiciona a linha de fundo
    
    // Trava o scroll do body quando aberto
    document.body.style.overflow = isOpen ? 'auto' : 'hidden';
}

hamburger.addEventListener('click', toggleMenu);
navOverlay.addEventListener('click', toggleMenu);

// Fechar ao clicar em links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (nav.classList.contains('active')) toggleMenu();
    });
});

// Smooth scroll corrigido com offset do header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            // Se for o link para a Home (#home), o CSS cuidará do offset de 70px
            // Se forem os outros, eles encostarão no topo do navegador
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Atualiza o hash na URL sem causar pulos bruscos
            history.pushState(null, null, targetId);
        }
    });
});

// --- PORTFOLIO CAROUSEL ---
const portfolioTrack = document.getElementById('portfolioTrack');
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');

if (portfolioTrack && nextBtn && prevBtn) {
    // Função para mover o slide com navegação circular
    function moveSlide(direction) {
        const scrollAmount = portfolioTrack.clientWidth * 0.8;
        const isAtStart = portfolioTrack.scrollLeft <= 10;
        const isAtEnd = portfolioTrack.scrollLeft + portfolioTrack.clientWidth >= portfolioTrack.scrollWidth - 10;
        
        if (direction === 'next') {
            // Se está no final e clica para direita, volta ao início
            if (isAtEnd) {
                portfolioTrack.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                portfolioTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        } else {
            // Se está no início e clica para esquerda, vai ao final
            if (isAtStart) {
                portfolioTrack.scrollTo({ left: portfolioTrack.scrollWidth, behavior: 'smooth' });
            } else {
                portfolioTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    }

    nextBtn.addEventListener('click', () => moveSlide('next'));
    prevBtn.addEventListener('click', () => moveSlide('prev'));

    // Autoplay: Muda a cada 5 segundos
    let autoPlay = setInterval(() => {
        // Verifica se chegou no final, se sim volta ao início
        const isAtEnd = portfolioTrack.scrollLeft + portfolioTrack.clientWidth >= portfolioTrack.scrollWidth - 10;
        if (isAtEnd) {
            portfolioTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            moveSlide('next');
        }
    }, 5000);

    // Para o autoplay quando o usuário interage
    portfolioTrack.addEventListener('mousedown', () => clearInterval(autoPlay));
    portfolioTrack.addEventListener('touchstart', () => clearInterval(autoPlay));
    
    // Reinicia o autoplay após alguns segundos sem interação
    let restartTimeout;
    function restartAutoPlay() {
        clearTimeout(restartTimeout);
        restartTimeout = setTimeout(() => {
            autoPlay = setInterval(() => {
                const isAtEnd = portfolioTrack.scrollLeft + portfolioTrack.clientWidth >= portfolioTrack.scrollWidth - 10;
                if (isAtEnd) {
                    portfolioTrack.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    moveSlide('next');
                }
            }, 5000);
        }, 10000); // Reinicia após 10 segundos de inatividade
    }
    
    portfolioTrack.addEventListener('mouseup', restartAutoPlay);
    portfolioTrack.addEventListener('touchend', restartAutoPlay);
}

// --- LIGHTBOX ---
const lightbox = document.getElementById('portfolioLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const captionText = document.getElementById('lightboxCaption');
const closeBtn = document.querySelector('.lightbox-close');

if (portfolioTrack && lightbox && lightboxImg && captionText && closeBtn) {
    // Função para abrir a Lightbox
    function openLightbox(e) {
        // Verifica se clicamos em uma imagem ou no overlay do card
        const card = e.target.closest('.portfolio-item');
        if (card) {
            const img = card.querySelector('img');
            const caption = card.querySelector('.portfolio-overlay span');
            
            if (img && caption) {
                e.preventDefault();
                e.stopPropagation();
                
                lightbox.style.display = "flex";
                setTimeout(() => lightbox.classList.add('active'), 10);
                
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                captionText.innerHTML = caption.innerHTML;
                
                // Trava o scroll da página ao ver a foto
                document.body.style.overflow = 'hidden';
            }
        }
    }
    
    // Variável para controlar se é um tap ou scroll
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchMove = false;
    
    // Suporte para click (desktop)
    portfolioTrack.addEventListener('click', openLightbox);
    
    // Suporte para touch (mobile)
    portfolioTrack.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTouchMove = false;
    }, { passive: true });
    
    portfolioTrack.addEventListener('touchmove', function(e) {
        // Detecta se houve movimento (scroll)
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const diffX = Math.abs(touchX - touchStartX);
        const diffY = Math.abs(touchY - touchStartY);
        
        if (diffX > 10 || diffY > 10) {
            isTouchMove = true;
        }
    }, { passive: true });
    
    portfolioTrack.addEventListener('touchend', function(e) {
        // Só abre se NÃO houve movimento (é um tap, não um scroll)
        if (!isTouchMove) {
            openLightbox(e);
        }
    });

    // Fechar ao clicar no X ou fora da imagem
    function closeLightbox(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightbox.style.display = "none";
            document.body.style.overflow = 'auto';
        }, 300);
    }

    closeBtn.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        closeLightbox(e);
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox(e);
    });
    lightbox.addEventListener('touchend', (e) => {
        if (e.target === lightbox) {
            e.preventDefault();
            closeLightbox(e);
        }
    });
}
});
