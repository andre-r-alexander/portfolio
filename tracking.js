document.addEventListener('DOMContentLoaded', function () {
  if (typeof gtag !== 'function') return;

  function trackClick(eventName, params = {}) {
    gtag('event', eventName, {
      ...params,
      source_page: window.location.pathname,
      transport_type: 'beacon'
    });
  }

  // Track all PDF clicks
  document.querySelectorAll('a[href$=".pdf"]').forEach(link => {
    link.addEventListener('click', function () {
      const href = link.getAttribute('href');
      const linkText = link.innerText.trim() || 'PDF link';

      let category = 'pdf_download';

      if (href.includes('Resume')) {
        category = 'resume_download';
      } else if (link.closest('.portfolio-item')) {
        category = 'portfolio_pdf_download';
      } else if (link.closest('.archive-item')) {
        category = 'archive_pdf_download';
      }

      const itemTitle =
        link.closest('.portfolio-item, .archive-item')
          ?.querySelector('h3')
          ?.innerText
          ?.trim() || linkText;

      trackClick(category, {
        file_name: href,
        item_title: itemTitle,
        link_text: linkText,
        file_url: new URL(href, window.location.href).href
      });
    });
  });

  // Track portfolio navigation
  document.querySelectorAll('a[href="portfolio.html"]').forEach(link => {
    link.addEventListener('click', function () {
      trackClick('portfolio_click', {
        link_text: link.innerText.trim()
      });
    });
  });

  // Track archives navigation
  document.querySelectorAll('a[href="archives.html"]').forEach(link => {
    link.addEventListener('click', function () {
      trackClick('archives_click', {
        link_text: link.innerText.trim()
      });
    });
  });

  // Track LinkedIn clicks
  document.querySelectorAll('a[href*="linkedin.com"]').forEach(link => {
    link.addEventListener('click', function () {
      trackClick('linkedin_click', {
        link_text: link.innerText.trim(),
        outbound_url: link.href
      });
    });
  });
});
