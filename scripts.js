function switchTab(section, tab) {
    const buttons = document.querySelectorAll(`[data-section="${section}"]`);
    buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tab);
    });

    const panels = document.querySelectorAll(`.tab-panel[data-section="${section}"]`);
    panels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tab === tab);
    });
}

const NAV_ITEMS = [
    { href: '/index.html', label: 'Home' },
    { href: '/about.html', label: 'About' },
    { href: '/services.html', label: 'Services' },

    { href: '/wiki.html', label: 'Wiki' },

    { href: '/students.html', label: 'Students' },
    { href: '/contact.html', label: 'Contact' }
];

function createNav() {
    const fragment = document.createDocumentFragment();
    const nav = document.createElement('nav');
    nav.className = 'fixed inset-x-0 top-0 z-50 py-4 glass-panel shadow-lg shadow-slate-950/20 backdrop-blur-xl';

    const inner = document.createElement('div');
    // Mobile-first: stack brand + CTA vertically to prevent overflow.
    // Desktop: switch to a single row.
    inner.className = 'max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3';

    const brand = document.createElement('a');
    brand.href = '/index.html';
    brand.className = 'flex items-center gap-3 nav-link justify-center md:justify-start';
    brand.innerHTML = `<span class="w-3 h-3 rounded-full bg-cyan-400 pulse-dot"></span><span class="text-white font-bold tracking-widest text-sm">PACMON</span>`;

    const cta = document.createElement('a');
    cta.href = '/contact.html';
    cta.className = 'rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition md:justify-self-end self-center md:self-auto';
    cta.textContent = 'Start a Project';

    // Two-tier structure: swipeable link row under brand/CTA on mobile.
    const linksRow = document.createElement('div');
    linksRow.className = [
        // Mobile swipe mechanics
        'w-full',
        'overflow-x-auto',
        'whitespace-nowrap',
        'no-scrollbar',
        // Desktop: make it non-swipe and align in the row
        'md:overflow-hidden md:whitespace-normal',
        'flex items-center gap-8 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300',

        'pb-1',
        // Keep it from collapsing on mobile
        'justify-start'
    ].join(' ');

    NAV_ITEMS.forEach(item => {
        const a = document.createElement('a');
        a.href = item.href;
        a.className = 'nav-link';
        a.textContent = item.label;
        linksRow.appendChild(a);
    });

    // Desktop layout: show brand + links + CTA. Mobile layout: brand + CTA + swipe links.
    inner.appendChild(brand);
    inner.appendChild(cta);

    // Use a single linksRow node. On mobile it sits below brand+CTA and scrolls horizontally.
    // On desktop it becomes the in-row link strip.
    inner.appendChild(linksRow);

    // Desktop: constrain layout to a single row and keep swipe container visually stable.
    // (Mobile remains swipeable; desktop disables overflow-x via md:overflow-visible.)



    nav.appendChild(inner);
    fragment.appendChild(nav);
    return fragment;
}


function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'border-t border-slate-800 py-8 text-center footer-text text-sm font-mono';
    footer.innerHTML = '<p>Pacmon Security &amp; Solutions © 2026</p>';
    return footer;
}

function markActiveNav() {
    const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('#shared-nav a.nav-link').forEach(link => {
        try {
            const href = link.getAttribute('href') || '';
            const hrefName = href.split('/').pop().split('#')[0].toLowerCase();
            if (hrefName === current || (hrefName === 'index.html' && current === '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        } catch (e) {
            // ignore malformed hrefs
        }
    });
}

function insertSharedLayout() {
    const navContainer = document.getElementById('shared-nav');
    if (navContainer && navContainer.children.length === 0) {
        navContainer.appendChild(createNav());
    }

    const footerContainer = document.getElementById('shared-footer');
    if (footerContainer && footerContainer.children.length === 0) {
        footerContainer.appendChild(createFooter());
    }

    markActiveNav();
}

document.addEventListener('DOMContentLoaded', () => {
    insertSharedLayout();

    // Temporal bot counter-measure: mark page readiness timestamp.
    window.__pacmonPageInitTs = Date.now();

    // Event delegation for tab buttons to avoid attaching many listeners
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-button');
        if (!btn) return;
        const section = btn.dataset.section;
        const tab = btn.dataset.tab;
        if (section && tab) switchTab(section, tab);
    });
});

// Submission temporal validation (contact portal hardening)
// Reject/neutralize submission triggered faster than 2000ms after init.
function __pacmonTemporalGateAllow() {
    const initTs = window.__pacmonPageInitTs;
    if (!initTs) return false;
    return (Date.now() - initTs) >= 2000;
}

// Wrap executeFormSubmission if present on the contact page.
(function () {
    const original = window.executeFormSubmission;
    if (typeof original !== 'function') return;

    window.executeFormSubmission = function () {
        try {
            if (!__pacmonTemporalGateAllow()) {
                const form = document.getElementById('pacmon-intake-form');
                if (form) {
                    // Neutralize fast-bot attempts; keep UX quiet.
                    form.setAttribute('data-submission-blocked', 'temporal');
                }
                return;
            }
        } catch (e) {
            return;
        }
        return original.apply(this, arguments);
    };
})();
