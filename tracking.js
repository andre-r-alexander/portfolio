document.addEventListener('DOMContentLoaded', function () {
  if (typeof gtag !== 'function') return;

  const sourcePage = window.location.pathname;

  let lastPdfViewed = 'none';
  let lastPdfTitle = 'none';

  function sendEvent(eventName, params = {}) {
    gtag('event', eventName, {
      ...params,
      source_page: sourcePage,
      last_pdf_viewed: lastPdfViewed,
      last_pdf_title: lastPdfTitle,
      transport_type: 'beacon'
    });
  }

  function getFileNameFromHref(href) {
    try {
      return new URL(href, window.location.href).pathname;
    } catch {
      return href;
    }
  }

  function isPdfLink(href) {
    return href.toLowerCase().split('?')[0].endsWith('.pdf');
  }

  // Track all link clicks
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (event) {
      const href = link.getAttribute('href') || '';
      const fullUrl = new URL(href, window.location.href).href;
      const linkText = link.innerText.trim() || 'Untitled link';

      const container = link.closest('.portfolio-item, .archive-item');
      const itemTitle =
        container?.querySelector('h3')?.innerText.trim() || linkText;

      if (link.classList.contains('project-inquiry-link')) {
        event.preventDefault();
        openProjectInquiry(event);
        return;
      }

      if (isPdfLink(href)) {
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

        lastPdfViewed = getFileNameFromHref(href);
        lastPdfTitle = itemTitle;

        sendEvent(eventName, {
          pdf_type: pdfType,
          file_name: lastPdfViewed,
          file_url: fullUrl,
          item_title: itemTitle,
          link_text: linkText
        });
      }

      else if (href === 'portfolio.html') {
        sendEvent('portfolio_page_click', { link_text: linkText });
      }

      else if (href === 'archives.html') {
        sendEvent('archives_page_click', { link_text: linkText });
      }

      else if (href === 'index.html' || href === '/' || href === './') {
        sendEvent('return_home_click', { link_text: linkText });
      }

      else if (href.includes('linkedin.com')) {
        sendEvent('linkedin_click', {
          outbound_url: fullUrl,
          link_text: linkText
        });
      }
    });
  });

  // Freelancing services expand/collapse
  window.toggleServices = function () {
    const servicesList = document.getElementById('servicesList');
    const servicesButton = document.getElementById('servicesButton');

    if (!servicesList || !servicesButton) return;

    if (servicesList.style.display === 'block') {
      servicesList.style.display = 'none';
      servicesButton.innerText = '▼ Freelancing Services';
      sendEvent('freelancing_services_collapse');
    } else {
      servicesList.style.display = 'block';
      servicesButton.innerText = '▲ Freelancing Services';
      sendEvent('freelancing_services_expand');
    }
  };

  // Track which services visitors explore
  const trackedServices = new Set();

  document.querySelectorAll('.service-item').forEach(item => {
    function trackServiceInterest(interactionType) {
      const serviceName =
        item.getAttribute('data-service') ||
        item.querySelector('.service-title')?.innerText.trim() ||
        'Unknown service';

      const serviceDescription =
        item.querySelector('.service-description')?.innerText.trim() ||
        'No description';

      const trackingKey = `${serviceName}-${interactionType}`;

      if (!trackedServices.has(trackingKey)) {
        trackedServices.add(trackingKey);

        sendEvent('service_interest', {
          service_name: serviceName,
          service_description: serviceDescription,
          interaction_type: interactionType
        });
      }
    }

    item.addEventListener('mouseenter', function () {
      trackServiceInterest('hover');
    });

    item.addEventListener('focus', function () {
      trackServiceInterest('keyboard_focus');
    });

    item.addEventListener('click', function () {
      trackServiceInterest('click');
    });
  });

  // Obfuscated project inquiry email
  window.openProjectInquiry = function (event) {
    if (event) event.preventDefault();

    sendEvent('project_inquiry_click');

    const user = 'andre';
    const domain = 'andreralexander.com';
    const subject = encodeURIComponent('Project inquiry');

    window.location.href = `mailto:${user}@${domain}?subject=${subject}`;
  };

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
