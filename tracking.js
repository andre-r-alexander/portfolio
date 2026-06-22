document.addEventListener('DOMContentLoaded', function() {
  if (typeof gtag !== 'function') return;

  // Track Resume Downloads
  document.querySelectorAll('a[href$="Resume_Public.pdf"]').forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'resume_download');
    });
  });

  // Track Portfolio PDF Downloads
  document.querySelectorAll('.portfolio-item a[href$=".pdf"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const title = e.target.closest('.portfolio-item')?.querySelector('h3')?.innerText || 'unknown_portfolio_pdf';
      gtag('event', 'portfolio_pdf_download', { file_name: title });
    });
  });

  // Track Archive PDF Downloads
  document.querySelectorAll('.archive-item a[href$=".pdf"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const title = e.target.closest('.archive-item')?.querySelector('h3')?.innerText || 'unknown_archive_pdf';
      gtag('event', 'archive_pdf_download', { file_name: title });
    });
  });

  // Track Navigation Clicks
  document.querySelectorAll('a[href="portfolio.html"]').forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'portfolio_click');
    });
  });

  document.querySelectorAll('a[href="archives.html"]').forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'archives_click');
    });
  });

  // Track LinkedIn Clicks
  document.querySelectorAll('a[href*="linkedin.com"]').forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'linkedin_click');
    });
  });
});
