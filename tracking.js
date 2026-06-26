document.addEventListener('DOMContentLoaded', function () {
  if (typeof gtag !== 'function') return;

  const sourcePage = window.location.pathname;

  function sendEvent(eventName, params = {}) {
    gtag('event', eventName, {
      ...params,
      source_page: sourcePage,
      transport_type: 'beacon'
    });
  }

  // Track all link clicks
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function () {
      const href = link.getAttribute('href') || '';
      const fullUrl = new URL(href, window.location.href).href;
      const linkText = link.innerText.trim() || 'Untitled link';

      const container = link.closest('.portfolio-item, .archive-item');
      const itemTitle =
        container?.querySelector('h3')?.innerText.trim() || linkText;

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

  // Track time-on-page milestones
  const timeMilestones = [
    { seconds: 10, eventName: 'time_10_seconds' },
    { seconds: 30, eventName: 'time_30_seconds' },
    { seconds: 60, eventName: 'time_60_seconds' },
    { seconds: 120, eventName: 'time_120_seconds' }
  ];

  timeMilestones.forEach(milestone => {
    setTimeout(function () {
      sendEvent(milestone.eventName, {
        seconds_on_page: milestone.seconds
      });
    }, milestone.seconds * 1000);
  });
});
