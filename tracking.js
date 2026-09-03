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

      if (typeof callback === 'function') {
        callback();
      }
    }, 150);
  }


  /*
   * --------------------------------------------------------
   * LINK TRACKING
   * --------------------------------------------------------
   */

  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (event) {
      const href = link.getAttribute('href') || '';
      const fullUrl = new URL(href, window.location.href).href;
      const linkText = link.innerText.trim() || 'Untitled link';

      const container = link.closest('.portfolio-item, .archive-item');

      const itemTitle =
        container?.querySelector('h3')?.innerText.trim() || linkText;


      /*
       * Project inquiry
       */

      if (link.classList.contains('project-inquiry-link')) {
        event.preventDefault();
        openProjectInquiry(event);
        return;
      }


      /*
       * PDF tracking
       */

      if (isPdfLink(href)) {
        let eventName = 'pdf_click';
        let pdfType = 'other_pdf';
        let resumeType = 'not_resume';

        /*
         * Clinical AI & Informatics Resume
         */

        if (
          href.includes('Andre_Alexander_AI_Informatics_Resume')
        ) {
          eventName = 'resume_click';
          pdfType = 'resume';
          resumeType = 'clinical_ai_informatics';
        }

        /*
         * Medical Communications Resume
         */

        else if (
          href.includes('Andre_Alexander_Resume_Public')
        ) {
          eventName = 'resume_click';
          pdfType = 'resume';
          resumeType = 'medical_communications';
        }

        /*
         * Other resume PDF, if one is ever added later
         */

        else if (href.includes('Resume')) {
          eventName = 'resume_click';
          pdfType = 'resume';
          resumeType = 'other_resume';
        }

        /*
         * Portfolio sample
         */

        else if (link.closest('.portfolio-item')) {
          eventName = 'portfolio_sample_click';
          pdfType = 'portfolio_sample';
        }

        /*
         * Archive sample
         */

        else if (link.closest('.archive-item')) {
          eventName = 'archive_sample_click';
          pdfType = 'archive_sample';
        }


        lastPdfViewed = getFileNameFromHref(href);
        lastPdfTitle = itemTitle;

        sendEvent(eventName, {
          pdf_type: pdfType,
          resume_type: resumeType,
          file_name: lastPdfViewed,
          file_url: fullUrl,
          item_title: itemTitle,
          link_text: linkText
        });
      }


      /*
       * Portfolio page
       */

      else if (href === 'portfolio.html') {
        sendEvent('portfolio_page_click', {
          link_text: linkText
        });
      }


      /*
       * Archives page
       */

      else if (href === 'archives.html') {
        sendEvent('archives_page_click', {
          link_text: linkText
        });
      }


      /*
       * Return home
       */

      else if (
        href === 'index.html' ||
        href === '/' ||
        href === './'
      ) {
        sendEvent('return_home_click', {
          link_text: linkText
        });
      }


      /*
       * LinkedIn
       */

      else if (href.includes('linkedin.com')) {
        sendEvent('linkedin_click', {
          outbound_url: fullUrl,
          link_text: linkText
        });
      }
    });
  });


  /*
   * --------------------------------------------------------
   * SERVICES DROPDOWN
   * --------------------------------------------------------
   */

  window.toggleServices = function () {
    const servicesList =
      document.getElementById('servicesList');

    const servicesButton =
      document.getElementById('servicesButton');

    const servicesWrapper =
      document.querySelector('.services-wrapper');

    if (!servicesList || !servicesButton) return;

    if (servicesList.style.display === 'block') {
      servicesButton.innerText =
        '▼ Medical Consulting & Communication Services';

      servicesWrapper?.classList.add('services-closed');

      sendEvent('medical_services_collapse');

      closeDropdown(servicesList);
    }

    else {
      servicesButton.innerText =
        '▲ Medical Consulting & Communication Services';

      servicesWrapper?.classList.remove('services-closed');

      sendEvent('medical_services_expand');

      openDropdown(servicesList);
    }
  };


  /*
   * --------------------------------------------------------
   * MEET ANDRE
   * --------------------------------------------------------
   */

  let meetAndreTimersStarted = false;
  let meetAndreTimerIds = [];

  function startMeetAndreTimers() {
    if (meetAndreTimersStarted) return;

    meetAndreTimersStarted = true;

    const milestones = [
      {
        seconds: 10,
        eventName: 'meet_andre_10_seconds'
      },
      {
        seconds: 20,
        eventName: 'meet_andre_20_seconds'
      },
      {
        seconds: 40,
        eventName: 'meet_andre_40_seconds'
      }
    ];

    milestones.forEach(milestone => {
      const timerId = setTimeout(function () {
        const aboutPanel =
          document.getElementById('aboutPanel');

        if (
          aboutPanel &&
          aboutPanel.style.display === 'block'
        ) {
          sendEvent(milestone.eventName, {
            seconds_open: milestone.seconds
          });
        }
      }, milestone.seconds * 1000);

      meetAndreTimerIds.push(timerId);
    });
  }

  function resetMeetAndreTimers() {
    meetAndreTimerIds.forEach(
      timerId => clearTimeout(timerId)
    );

    meetAndreTimerIds = [];
    meetAndreTimersStarted = false;
  }

  window.toggleAbout = function () {
    const aboutPanel =
      document.getElementById('aboutPanel');

    const aboutButton =
      document.getElementById('aboutButton');

    if (!aboutPanel || !aboutButton) return;

    if (aboutPanel.style.display === 'block') {
      aboutButton.innerText =
        '▼ Meet Andre';

      sendEvent('meet_andre_collapse');

      closeDropdown(
        aboutPanel,
        function () {
          resetMeetAndreTimers();
        }
      );
    }

    else {
      aboutButton.innerText =
        '▲ Meet Andre';

      sendEvent('meet_andre_expand');

      openDropdown(aboutPanel);

      startMeetAndreTimers();
    }
  };


  /*
   * --------------------------------------------------------
   * SERVICE INTEREST
   * --------------------------------------------------------
   */

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

      const trackingKey =
        `${serviceName}-${interactionType}`;

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


  /*
   * --------------------------------------------------------
   * RESUME SELECTOR
   * --------------------------------------------------------
   */

  window.toggleResumeMenu = function (event) {
    if (event) {
      event.stopPropagation();
    }

    const resumeMenu =
      document.getElementById('resumeMenu');

    const resumeButton =
      document.getElementById('resumeButton');

    if (!resumeMenu || !resumeButton) return;

    const isOpen =
      resumeMenu.classList.contains('open');


    /*
     * Close selector
     */

    if (isOpen) {
      resumeMenu.classList.remove('open');

      sendEvent('resume_selector_collapse');

      setTimeout(function () {
        if (
          !resumeMenu.classList.contains('open')
        ) {
          resumeMenu.style.display = 'none';
        }
      }, 150);

      resumeButton.setAttribute(
        'aria-expanded',
        'false'
      );
    }


    /*
     * Open selector
     */

    else {
      resumeMenu.style.display = 'block';

      requestAnimationFrame(function () {
        resumeMenu.classList.add('open');
      });

      sendEvent('resume_selector_expand');

      resumeButton.setAttribute(
        'aria-expanded',
        'true'
      );
    }
  };


  /*
   * Close resume selector when clicking elsewhere
   */

  document.addEventListener(
    'click',
    function (event) {
      const resumeWrapper =
        document.querySelector('.resume-wrapper');

      const resumeMenu =
        document.getElementById('resumeMenu');

      const resumeButton =
        document.getElementById('resumeButton');

      if (
        resumeWrapper &&
        resumeMenu &&
        resumeButton &&
        resumeMenu.classList.contains('open') &&
        !resumeWrapper.contains(event.target)
      ) {
        resumeMenu.classList.remove('open');

        sendEvent('resume_selector_collapse', {
          close_method: 'outside_click'
        });

        setTimeout(function () {
          if (
            !resumeMenu.classList.contains('open')
          ) {
            resumeMenu.style.display = 'none';
          }
        }, 150);

        resumeButton.setAttribute(
          'aria-expanded',
          'false'
        );
      }
    }
  );


  /*
   * Close resume selector with Escape
   */

  document.addEventListener(
    'keydown',
    function (event) {
      if (event.key !== 'Escape') return;

      const resumeMenu =
        document.getElementById('resumeMenu');

      const resumeButton =
        document.getElementById('resumeButton');

      if (
        resumeMenu &&
        resumeMenu.classList.contains('open')
      ) {
        resumeMenu.classList.remove('open');

        sendEvent('resume_selector_collapse', {
          close_method: 'escape_key'
        });

        setTimeout(function () {
          if (
            !resumeMenu.classList.contains('open')
          ) {
            resumeMenu.style.display = 'none';
          }
        }, 150);
      }

      if (resumeButton) {
        resumeButton.setAttribute(
          'aria-expanded',
          'false'
        );
      }
    }
  );


  /*
   * --------------------------------------------------------
   * PROJECT INQUIRY
   * --------------------------------------------------------
   */

  window.openProjectInquiry = function (event) {
    if (event) {
      event.preventDefault();
    }

    sendEvent('project_inquiry_click');

    const user = 'andre';
    const domain = 'andreralexander.com';

    const subject =
      encodeURIComponent('Project inquiry');

    window.location.href =
      `mailto:${user}@${domain}?subject=${subject}`;
  };


  /*
   * --------------------------------------------------------
   * TIME-ON-PAGE MILESTONES
   * --------------------------------------------------------
   */

  const timeMilestones = [
    {
      seconds: 10,
      eventName: 'time_10_seconds'
    },
    {
      seconds: 30,
      eventName: 'time_30_seconds'
    },
    {
      seconds: 60,
      eventName: 'time_60_seconds'
    },
    {
      seconds: 120,
      eventName: 'time_120_seconds'
    }
  ];

  timeMilestones.forEach(milestone => {
    setTimeout(function () {
      sendEvent(milestone.eventName, {
        seconds_on_page: milestone.seconds
      });
    }, milestone.seconds * 1000);
  });

});
