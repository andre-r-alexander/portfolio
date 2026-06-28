document.addEventListener('DOMContentLoaded', function () {
  if (typeof gtag !== 'function') return;

  const sourcePage = window.location.pathname;
  const currentPage = window.location.pathname;
  const pageTitle = document.title;

  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('developer') === 'true') {
    localStorage.setItem('andre_developer_mode', 'true');
  }

  if (urlParams.get('developer') === 'false') {
    localStorage.removeItem('andre_developer_mode');
  }

  const developerMode =
    localStorage.getItem('andre_developer_mode') === 'true' ? 'true' : 'false';

  gtag('set', 'user_properties', {
    developer_mode: developerMode
  });

  let lastPdfViewed = 'none';
  let lastPdfTitle = 'none';

  function sendEvent(eventName, params = {}) {
    gtag('event', eventName, {
      ...params,
      source_page: sourcePage,
      current_page: currentPage,
      page_title: pageTitle,
      developer_mode: developerMode,
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

  function openDropdown(panel) {
    panel.style.display = 'block';

    requestAnimationFrame(function () {
      panel.classList.add('dropdown-open');
    });
  }

  function closeDropdown(panel, callback) {
    panel.classList.remove('dropdown-open');

    setTimeout(function () {
      panel.style.display = 'none';
      if (typeof callback === 'function') callback();
    }, 150);
  }

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

  window.toggleServices = function () {
    const servicesList = document.getElementById('servicesList');
    const servicesButton = document.getElementById('servicesButton');
    const servicesWrapper = document.querySelector('.services-wrapper');

    if (!servicesList || !servicesButton) return;

    if (servicesList.style.display === 'block') {
      servicesButton.innerText = '▼ Freelancing Services';
      servicesWrapper?.classList.add('services-closed');
      sendEvent('freelancing_services_collapse');
      closeDropdown(servicesList);
    } else {
      servicesButton.innerText = '▲ Freelancing Services';
      servicesWrapper?.classList.remove('services-closed');
      sendEvent('freelancing_services_expand');
      openDropdown(servicesList);
    }
  };

  let meetAndreTimersStarted = false;
  let meetAndreTimerIds = [];

  function startMeetAndreTimers() {
    if (meetAndreTimersStarted) return;

    meetAndreTimersStarted = true;

    const milestones = [
      { seconds: 10, eventName: 'meet_andre_10_seconds' },
      { seconds: 20, eventName: 'meet_andre_20_seconds' },
      { seconds: 40, eventName: 'meet_andre_40_seconds' }
    ];

    milestones.forEach(milestone => {
      const timerId = setTimeout(function () {
        const aboutPanel = document.getElementById('aboutPanel');

        if (aboutPanel && aboutPanel.style.display === 'block') {
          sendEvent(milestone.eventName, {
            seconds_open: milestone.seconds
          });
        }
      }, milestone.seconds * 1000);

      meetAndreTimerIds.push(timerId);
    });
  }

  function resetMeetAndreTimers() {
    meetAndreTimerIds.forEach(timerId => clearTimeout(timerId));
    meetAndreTimerIds = [];
    meetAndreTimersStarted = false;
  }

  window.toggleAbout = function () {
    const aboutPanel = document.getElementById('aboutPanel');
    const aboutButton = document.getElementById('aboutButton');

    if (!aboutPanel || !aboutButton) return;

    if (aboutPanel.style.display === 'block') {
      aboutButton.innerText = '▼ Meet Andre';
      sendEvent('meet_andre_collapse');

      closeDropdown(aboutPanel, function () {
        resetMeetAndreTimers();
      });
    } else {
      aboutButton.innerText = '▲ Meet Andre';
      sendEvent('meet_andre_expand');
      openDropdown(aboutPanel);
      startMeetAndreTimers();
    }
  };

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

  window.openProjectInquiry = function (event) {
    if (event) event.preventDefault();

    sendEvent('project_inquiry_click');

    const user = 'andre';
    const domain = 'andreralexander.com';
    const subject = encodeURIComponent('Project inquiry');

    window.location.href = `mailto:${user}@${domain}?subject=${subject}`;
  };

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
