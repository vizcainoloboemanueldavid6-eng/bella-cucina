'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Leaf, Wheat } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { menu, menuTagLabels, type MenuItem, type MenuTag } from '@/data/menu';
import { cn, formatPrice } from '@/lib/utils';

const badgeBase =
  'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold uppercase leading-5 tracking-[0.14em]';

/** Gold reads too pale for small text, so the GF badge carries the tint and ink carries the letters. */
const tagStyles: Record<MenuTag, { badge: string; icon: ReactNode }> = {
  V: {
    badge: 'border-olive/40 bg-olive/10 text-olive-dark',
    icon: <Leaf className="h-4 w-4 text-olive" aria-hidden="true" strokeWidth={1.75} />,
  },
  GF: {
    badge: 'border-gold-dark/45 bg-gold/20 text-ink',
    icon: <Wheat className="h-4 w-4 text-gold-dark" aria-hidden="true" strokeWidth={1.75} />,
  },
};

const tagKeys = Object.keys(menuTagLabels) as MenuTag[];

function tabId(categoryId: string): string {
  return `menu-tab-${categoryId}`;
}

function panelId(categoryId: string): string {
  return `menu-panel-${categoryId}`;
}

function Dish({ item }: { item: MenuItem }) {
  return (
    <li>
      <div className="flex items-end gap-x-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-display text-lg font-semibold leading-snug text-ink">{item.name}</h3>

          {item.tags && item.tags.length > 0 ? (
            <span className="flex items-center gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className={cn(badgeBase, tagStyles[tag].badge)}>
                  <span aria-hidden="true">{tag}</span>
                  <span className="sr-only">{menuTagLabels[tag]}</span>
                </span>
              ))}
            </span>
          ) : null}
        </div>

        <span aria-hidden="true" className="mb-[0.45rem] h-px min-w-[1rem] flex-1 bg-ink/20" />

        <span className="shrink-0 font-display text-lg font-semibold leading-snug text-terracotta-dark">
          {formatPrice(item.price)}
        </span>
      </div>

      <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-ink-muted">
        {item.description}
      </p>
    </li>
  );
}

export default function Menu() {
  const [activeId, setActiveId] = useState(menu[0].id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function select(index: number) {
    setActiveId(menu[index].id);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = menu.length - 1;
    let target: number;

    switch (event.key) {
      case 'ArrowRight':
        target = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
        target = index === 0 ? last : index - 1;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    select(target);
  }

  return (
    <section id="menu" className="section bg-cream-dark" aria-labelledby="menu-heading">
      <div className="container">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">The Menu</p>
          <h2 id="menu-heading" className="section-title">
            Cooked the way it was taught to us
          </h2>
          <p className="section-lede">
            The pasta is rolled at the front window every morning, the dough proves for two days and
            the ragù never leaves the stove before dinner. Five short lists, changed only when the
            market gives us a reason.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="-mx-2 mt-10 overflow-x-auto px-2 py-2">
            <div
              role="tablist"
              aria-label="Menu categories"
              className="flex w-max gap-1 rounded-full border border-ink/10 bg-cream/80 p-1.5 shadow-soft"
            >
              {menu.map((category, index) => {
                const isSelected = category.id === activeId;
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    id={tabId(category.id)}
                    aria-selected={isSelected}
                    aria-controls={panelId(category.id)}
                    tabIndex={isSelected ? 0 : -1}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    onClick={() => select(index)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    // scroll-mx keeps the 4px focus ring off the scrollport edge when
                    // an arrow key scrolls an off-screen tab into view.
                    className={cn(
                      'shrink-0 scroll-mx-3 whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 ease-entrance',
                      isSelected
                        ? 'bg-terracotta text-cream shadow-soft'
                        : 'text-ink-muted hover:bg-cream hover:text-ink',
                    )}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-4xl border border-ink/10 bg-white/70 p-6 shadow-soft sm:p-9 lg:p-12">
            {menu.map((category) => {
              const isSelected = category.id === activeId;
              return (
                <div
                  key={category.id}
                  role="tabpanel"
                  id={panelId(category.id)}
                  aria-labelledby={tabId(category.id)}
                  tabIndex={0}
                  hidden={!isSelected}
                >
                  {/* Re-keyed on selection so the fade replays every time the tab changes. */}
                  <div
                    key={isSelected ? `on-${activeId}` : `off-${category.id}`}
                    className={cn(isSelected && 'animate-fade-in')}
                  >
                    <p className="max-w-prose text-base leading-relaxed text-ink-muted">
                      {category.blurb}
                    </p>

                    <ul className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:gap-x-16">
                      {category.items.map((item) => (
                        <Dish key={item.name} item={item} />
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}

            <div className="mt-10 border-t border-ink/10 pt-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  Dietary notes
                </span>

                {tagKeys.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-2 text-sm text-ink-muted">
                    <span aria-hidden="true" className={cn(badgeBase, tagStyles[tag].badge)}>
                      {tag}
                    </span>
                    {tagStyles[tag].icon}
                    {menuTagLabels[tag]}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-sm text-ink-muted">
                All prices in USD. Tell us about allergies and the kitchen will adapt most dishes.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
