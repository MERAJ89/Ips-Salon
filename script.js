// Basic interactive behaviors: mobile nav, gallery lightbox, smooth scroll, form handling
document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  const burger = document.getElementById('burger');
  const nav = document.querySelector('.main-nav');
  burger.setAttribute('aria-expanded', 'false');
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
    // hide burger while menu is open to match requested behaviour
    burger.style.display = isOpen ? 'none' : '';
  });

  // Mobile nav close button (inside nav)
  const navClose = document.getElementById('navClose');
  if(navClose){
    navClose.addEventListener('click', ()=>{
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.style.display = '';
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        e.preventDefault();
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.style.display = '';
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Gallery lightbox
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  if (galleryItems && galleryItems.length && lightbox && lightboxImg) {
    galleryItems.forEach(btn => {
      btn.addEventListener('click', () => {
        // prefer data-src, fallback to nested img src
        let src = btn.getAttribute('data-src');
        if (!src) {
          const img = btn.querySelector('img');
          src = img ? img.src : '';
        }
        if (!src) {
          console.warn('Gallery item has no image source');
          return;
        }
        lightboxImg.src = src;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  } else {
    console.warn('Lightbox or gallery elements missing in DOM');
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Contact form -> send to Google Sheets via Google Apps Script endpoint
  // IMPORTANT: replace the SHEET_ENDPOINT value below with your published Apps Script web app URL
  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_SCRIPT_ID/exec';
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Simple form data collection
      const formData = {
        name: contactForm.name?.value || '',
        phone: contactForm.phone?.value || '',
        service: contactForm.service?.value || '',
        message: contactForm.message?.value || '',
        timestamp: new Date().toISOString()
      };

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      try {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

        const res = await fetch(SHEET_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!res.ok) throw new Error('Network response was not ok');

        // Optionally parse JSON response from Apps Script (if returned)
        let json = null;
        try { json = await res.json(); } catch (_) { /* ignore parse errors */ }

        alert('Thanks! Your request was sent. We will contact you shortly.');
        contactForm.reset();

      } catch (err) {
        console.error('Contact form submit error', err);
        // alert('Conform Your Details & Click "Ok".');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Request'; }
      }
    });
  }
});

// Page loader: hide after full load or fallback
(function(){
  const loader = document.getElementById('pageLoader');
  function hideLoader(){
    if (!loader) return;
    loader.setAttribute('aria-hidden', 'true');
    // remove from flow after transition
    setTimeout(() => { loader.style.display = 'none'; }, 420);
  }

  // Hide when window finishes loading resources
  window.addEventListener('load', () => { hideLoader(); });

  // Fallback: ensure loader doesn't hang (max 4s)
  setTimeout(() => { hideLoader(); }, 4000);

  // expose for debug/testing
  window.hidePageLoader = hideLoader;
})();
