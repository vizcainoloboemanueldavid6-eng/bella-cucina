'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu as MenuIcon, Phone, X } from 'lucide-react';
import { site } from '@/config/site';
import { cn } from '@/lib/utils';

/** Every nav target plus the reservation block, so the CTA can light up too. */
const SECTION_IDS = [...site.nav.map((item) => item.href.slice(1)), 'reserve'];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  /** `false` while the bar floats over the hero, `true` once it needs its own surface. */
  const [solid, setSolid] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const update = () => setSolid(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // One observer for the whole page. The margins leave a thin band across the
  // upper third of the viewport; whichever section sits in that band is "current".
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const sections = SECTION_IDS.map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
      .sort((a, b) => a.offsetTop - b.offsetTop);

    if (sections.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = sections.find((section) => visible.has(section.id));
        setActiveId(current ? current.id : null);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Locking the body also removes the classic scrollbar on desktop-width windows,
  // which would otherwise reflow the page behind the drawer. Pad the gap back.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [open]);

  // Focus trap + Escape. The drawer covers the bar, so every focusable control
  // the visitor needs — close button included — lives inside the panel.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const items = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    items()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = items();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // A drawer left open while the viewport grows past `lg` would keep scroll locked.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia('(min-width: 1024px)');
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [open]);

  // Send focus back to the hamburger however the drawer was dismissed.
  useEffect(() => {
    if (wasOpen.current && !open) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      {/* data-site-header is the hook globals.css uses to give the bar its solid treatment
          when scripting is off and `solid` can never flip. */}
      <header
        data-site-header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ease-entrance',
          solid
            ? 'border-ink/10 bg-cream/95 shadow-soft backdrop-blur-md'
            : 'border-transparent bg-transparent',
        )}
      >
        <div className="container flex h-[var(--header-height)] items-center justify-between gap-4">
          <a
            href="#top"
            className={cn(
              'group flex shrink-0 items-center gap-2.5 transition-colors duration-300 ease-entrance',
              solid ? 'text-ink' : 'text-shadow-hero text-cream',
            )}
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta font-display text-base italic leading-none text-cream shadow-soft transition-transform duration-300 ease-entrance group-hover:-rotate-12"
            >
              {site.name.charAt(0)}
            </span>
            <span className="font-display text-lg font-semibold tracking-tight sm:text-xl">
              {site.name}
            </span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {site.nav.map((item) => {
                const isActive = activeId === item.href.slice(1);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'relative py-2 text-sm font-medium tracking-wide transition-colors duration-300 ease-entrance',
                        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-entrance after:content-['']",
                        'hover:after:scale-x-100 focus-visible:after:scale-x-100',
                        isActive && 'after:scale-x-100',
                        solid
                          ? cn('hover:text-terracotta', isActive ? 'text-terracotta' : 'text-ink')
                          : 'text-shadow-hero text-cream',
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#reserve"
              aria-current={activeId === 'reserve' ? 'true' : undefined}
              className={cn('hidden sm:inline-flex', solid ? 'btn-primary' : 'btn-on-dark')}
            >
              Reserve a Table
            </a>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 ease-entrance lg:hidden',
                solid
                  ? 'border-ink/15 text-ink hover:bg-cream-dark'
                  : 'border-cream/45 text-cream hover:bg-cream/15',
              )}
            >
              {open ? (
                <X aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
              ) : (
                <MenuIcon aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
              )}
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 animate-fade-in bg-ink/60 backdrop-blur-sm lg:hidden"
          />
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={`${site.name} menu`}
            className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm animate-slide-down flex-col bg-cream shadow-lift lg:hidden"
          >
            <div className="flex h-[var(--header-height)] shrink-0 items-center justify-between gap-4 border-b border-ink/10 px-5 sm:px-6">
              <span className="font-display text-lg font-semibold tracking-tight text-ink">
                {site.name}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-cream-dark"
              >
                <X aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <nav
              aria-label="Mobile"
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6"
            >
              <ul className="flex flex-col">
                {site.nav.map((item) => {
                  const isActive = activeId === item.href.slice(1);
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                          'flex min-h-[44px] items-center border-l-2 py-3.5 pl-4 font-display text-xl transition-colors',
                          isActive
                            ? 'border-terracotta text-terracotta'
                            : 'border-transparent text-ink hover:border-ink/20 hover:text-terracotta',
                        )}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="shrink-0 border-t border-ink/10 px-5 py-6 sm:px-6">
              <a
                href="#reserve"
                onClick={() => setOpen(false)}
                aria-current={activeId === 'reserve' ? 'true' : undefined}
                className="btn-primary w-full"
              >
                Reserve a Table
              </a>
              <a
                href={site.phone.href}
                onClick={() => setOpen(false)}
                className="mt-4 flex min-h-[44px] items-center justify-center gap-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-terracotta"
              >
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2} />
                {site.phone.display}
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
