const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

const closeMenu = () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Ouvrir le menu');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
};

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Ouvrir le menu' : 'Fermer le menu');
  navigation.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.querySelector('[data-year]').textContent = new Date().getFullYear();

const equipmentScene = document.querySelector('[data-equipment-scene]');
const equipmentPieces = equipmentScene ? [...equipmentScene.querySelectorAll('.equipment-piece')] : [];
let equipmentFrame;

const updateEquipmentScene = () => {
  equipmentFrame = null;
  if (!equipmentScene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rect = equipmentScene.getBoundingClientRect();
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const stageRect = equipmentScene.querySelector('.equipment-stage')?.getBoundingClientRect() || rect;
  const desktopDistance = Math.min(rect.height * .68, window.innerHeight * .58);
  const mobileProgress = (window.innerHeight * .96 - stageRect.top) / (stageRect.height + window.innerHeight * .28);
  const heroProgress = isMobile
    ? Math.max(0, Math.min(1, mobileProgress))
    : Math.max(0, Math.min(1, window.scrollY / desktopDistance));
  const spread = equipmentScene.dataset.equipmentScene === 'hero'
    ? Math.pow(heroProgress, isMobile ? .82 : .72)
    : Math.max(0, Math.min(1, (((window.innerHeight - rect.top) / (window.innerHeight + rect.height)) - .16) / .5));
  const mobileScale = isMobile ? (window.innerWidth <= 430 ? .68 : .76) : 1;
  const mobileEdge = Math.max(34, window.innerWidth * .08);
  const groupContainScale = isMobile
    ? equipmentPieces.reduce((scale, piece) => {
        const fullX = (Number(piece.dataset.baseX || 0) + Number(piece.dataset.x)) * mobileScale;
        const limit = Math.max(0, (stageRect.width - piece.offsetWidth) / 2 - mobileEdge - 10);
        return fullX === 0 ? scale : Math.min(scale, limit / Math.abs(fullX));
      }, 1)
    : 1;

  equipmentPieces.forEach((piece, index) => {
    const baseX = Number(piece.dataset.baseX || 0) * mobileScale;
    const targetX = baseX + (Number(piece.dataset.x) * spread * mobileScale);
    const x = targetX * groupContainScale;
    const baseY = Number(piece.dataset.y) * spread * mobileScale;
    const floatY = Math.sin((spread * Math.PI) + index * .8) * 10 * spread;
    const rotation = Number(piece.dataset.r) * spread * (isMobile ? .55 * groupContainScale : 1);
    piece.style.setProperty('--tx', `${x}px`);
    piece.style.setProperty('--ty', `${baseY + floatY}px`);
    piece.style.setProperty('--rot', `${rotation}deg`);
  });
};

const requestEquipmentUpdate = () => {
  if (!equipmentFrame) equipmentFrame = requestAnimationFrame(updateEquipmentScene);
};

if (equipmentScene) {
  updateEquipmentScene();
  window.addEventListener('scroll', requestEquipmentUpdate, { passive: true });
  window.addEventListener('resize', requestEquipmentUpdate, { passive: true });
  document.addEventListener('touchmove', requestEquipmentUpdate, { passive: true });
  window.visualViewport?.addEventListener('scroll', requestEquipmentUpdate, { passive: true });
  window.visualViewport?.addEventListener('resize', requestEquipmentUpdate, { passive: true });
}
