document.addEventListener('DOMContentLoaded', function () {
  if (typeof gtag !== 'function') return;

  function sendEvent(eventName, params) {
    gtag('event', eventName, {
      ...params,
      source_page: window.location.pathname,
      transport_type: 'beacon'
    });
  }

  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function () {
      const href = link.getAttribute('href') || '';
      const fullUrl = new URL(href, window.location.href).href;
      const linkText = link.innerText.trim() || 'Untitled link';

      const container = link.closest('.portfolio-item, .archive-item');
      const itemTitle = container?.querySelector('h3')?.innerText.trim() || linkText;

      if (href.endsWith('.pdf')) {
        let eventName = 'pdf_click';
        let pdfType = 'other_pdf';

        if (href.includes('Resume')) {
          eventName = 'resume_click';
          pdfType = 'resume';
        } else if (link.closest('.portfolio-item')) {
          eventName = 'portfolio_sample_click';
          pdfType = 'portfolio_sample';
        } else if (link.closest('.archive-item')) {
          eventName = 'archive_sample_click';
          pdfType = 'archive_sample';
        }

        sendEvent(eventName, {
          pdf_type: pdfType,
          file_name: href,
          file_url: fullUrl,
          item_title: itemTitle,
          link_text: linkText
        });
      }

      else if (href === 'portfolio.html') {
        sendEvent('portfolio_page_click', {
          link_text: linkText
        });
      }

      else if (href === 'archives.html') {
        sendEvent('archives_page_click', {
          link_text: linkText
        });
      }

      else if (href.includes('linkedin.com')) {
        sendEvent('linkedin_click', {
          outbound_url: fullUrl,
          link_text: linkText
        });
      }
    });
  });
});
