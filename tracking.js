document.addEventListener('DOMContentLoaded', function() {
    // Resume tracking
    const resumeLinks = document.querySelectorAll('a[href$="Resume_Public.pdf"]');
    resumeLinks.forEach(link => {
        link.addEventListener('click', () => {
            gtag('event', 'resume_download');
        });
    });

    // Portfolio PDF tracking
    const portfolioPDFs = document.querySelectorAll('.portfolio-item a[href$=".pdf"]');
    portfolioPDFs.forEach(link => {
        link.addEventListener('click', (e) => {
            const fileName = e.target.closest('.portfolio-item')?.querySelector('h3')?.innerText || 'unknown_portfolio_pdf';
            gtag('event', 'portfolio_pdf_download', { 'file_name': fileName });
        });
    });

    // Archive PDF tracking
    const archivePDFs = document.querySelectorAll('.archive-item a[href$=".pdf"]');
    archivePDFs.forEach(link => {
        link.addEventListener('click', (e) => {
            const fileName = e.target.closest('.archive-item')?.querySelector('h3')?.innerText || 'unknown_archive_pdf';
            gtag('event', 'archive_pdf_download', { 'file_name': fileName });
        });
    });

    // Navigation and Social tracking
    document.querySelector('a[href="portfolio.html"]')?.addEventListener('click', () => gtag('event', 'portfolio_click'));
    document.querySelector('a[href="archives.html"]')?.addEventListener('click', () => gtag('event', 'archives_click'));
    document.querySelector('a[href*="linkedin.com"]')?.addEventListener('click', () => gtag('event', 'linkedin_click'));
});
