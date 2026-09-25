'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, ChevronDown, CircleAlert, Send } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { formatTime, site } from '@/config/site';
import { cn, dateInputOffset, formatLongDate } from '@/lib/utils';

const NOTE_MAX_LENGTH = 300;

/** "6 months" / "90 days" — derived so the message cannot drift from site.reservation. */
const BOOKING_WINDOW = (() => {
  // Widened on purpose: `site` is `as const`, so the literal type 180 would make every other
  // branch below a compile error rather than a branch.
  const days: number = site.reservation.maxDaysAhead;
  if (days % 365 === 0) return days === 365 ? 'a year' : `${days / 365} years`;
  if (days % 30 === 0) return days === 30 ? 'a month' : `${days / 30} months`;
  return `${days} days`;
})();

type FieldName = 'name' | 'phone' | 'date' | 'time' | 'guests' | 'note';
type FormValues = Record<FieldName, string>;
type FieldErrors = Partial<Record<FieldName, string>>;
type TouchedFields = Partial<Record<FieldName, boolean>>;

const EMPTY_VALUES: FormValues = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: '',
  note: '',
};

/** Also the order focus jumps through when a submit fails. */
const REQUIRED_FIELDS: FieldName[] = ['name', 'phone', 'date', 'time', 'guests'];

function minutesFromTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeFromMinutes(total: number): string {
  const hours = String(Math.floor(total / 60)).padStart(2, '0');
  const minutes = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function buildTimeSlots(): string[] {
  const { earliestTime, latestTime, slotMinutes } = site.reservation;
  const last = minutesFromTime(latestTime);
  const slots: string[] = [];
  for (let minutes = minutesFromTime(earliestTime); minutes <= last; minutes += slotMinutes) {
    slots.push(timeFromMinutes(minutes));
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

const GUEST_OPTIONS = Array.from(
  { length: site.reservation.maxGuests - site.reservation.minGuests + 1 },
  (_, index) => site.reservation.minGuests + index,
);

/**
 * Never called while rendering: the date rules read the current day, which would
 * disagree with the statically exported HTML.
 */
function validateField(field: FieldName, values: FormValues): string | undefined {
  switch (field) {
    case 'name': {
      const trimmed = values.name.trim();
      if (!trimmed) return 'Please tell us the name for the booking.';
      if (trimmed.length < 2) return 'Please enter at least 2 characters.';
      return undefined;
    }
    case 'phone': {
      const digitsOnly = values.phone.replace(/[+\s().-]/g, '');
      if (!/^\d{7,}$/.test(digitsOnly)) {
        return 'Enter a phone number we can reach you on, at least 7 digits.';
      }
      return undefined;
    }
    case 'date': {
      if (!values.date) return 'Please choose a date for your booking.';
      if (values.date < dateInputOffset(0)) {
        return 'That date has already passed. Please pick today or later.';
      }
      if (values.date > dateInputOffset(site.reservation.maxDaysAhead)) {
        return `We take bookings up to ${BOOKING_WINDOW} ahead.`;
      }
      return undefined;
    }
    case 'time': {
      if (!values.time) return 'Please choose a time.';
      // A slot earlier today is in the past, and the date field cannot catch it.
      if (values.date === dateInputOffset(0)) {
        const now = new Date();
        if (minutesFromTime(values.time) <= now.getHours() * 60 + now.getMinutes()) {
          return 'That time has already passed today. Please pick a later slot.';
        }
      }
      return undefined;
    }
    case 'guests':
      return values.guests ? undefined : 'How many people are joining?';
    default:
      return undefined;
  }
}

function RequiredMark() {
  return (
    <span className="text-terracotta" aria-hidden="true">
      *
    </span>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="field-error">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

function SummaryRow({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-olive-dark">{label}</dt>
      <dd className="mt-1 whitespace-pre-line break-words text-base text-ink">{value}</dd>
    </div>
  );
}

export default function Reservation() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [booking, setBooking] = useState<FormValues | null>(null);
  const [dateBounds, setDateBounds] = useState<{ min?: string; max?: string }>({});
  const [hydrated, setHydrated] = useState(false);

  const fieldRefs = useRef<Partial<Record<FieldName, HTMLElement | null>>>({});
  const confirmationRef = useRef<HTMLDivElement | null>(null);
  const returningToForm = useRef(false);
  const pendingFocus = useRef<FieldName | null>(null);

  // Until React has taken over, the submit button is inert and the browser's own validation
  // is left in charge: a native GET submit would put the guest's name and phone in the URL.
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Date bounds depend on "today", so they are attached after hydration, never rendered.
  useEffect(() => {
    setDateBounds({
      min: dateInputOffset(0),
      max: dateInputOffset(site.reservation.maxDaysAhead),
    });
  }, []);

  useEffect(() => {
    if (booking) {
      confirmationRef.current?.focus();
    } else if (returningToForm.current) {
      returningToForm.current = false;
      fieldRefs.current.name?.focus();
    }
  }, [booking]);

  useEffect(() => {
    const field = pendingFocus.current;
    if (!field) return;
    pendingFocus.current = null;
    fieldRefs.current[field]?.focus();
  }, [errors]);

  function updateField(field: FieldName, value: string) {
    const next: FormValues = { ...values, [field]: value };
    setValues(next);

    setErrors((previous) => {
      const updated: FieldErrors = { ...previous };
      if (touched[field]) updated[field] = validateField(field, next);
      // The time rule reads the date — a slot earlier today is in the past — so moving the
      // date has to re-run it, or a stale error sticks to a time that is now perfectly fine.
      if (field === 'date' && touched.time) updated.time = validateField('time', next);
      return updated;
    });
  }

  function handleBlur(field: FieldName) {
    setTouched((previous) => ({ ...previous, [field]: true }));
    setErrors((previous) => ({ ...previous, [field]: validateField(field, values) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    for (const field of REQUIRED_FIELDS) {
      nextErrors[field] = validateField(field, values);
    }

    setTouched({ name: true, phone: true, date: true, time: true, guests: true });
    setErrors(nextErrors);

    const firstInvalid = REQUIRED_FIELDS.find((field) => nextErrors[field]);
    if (firstInvalid) {
      // Focus after the commit, so the control already carries `aria-describedby`
      // and screen readers announce the field together with its error.
      pendingFocus.current = firstInvalid;
      return;
    }

    const details: FormValues = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      date: values.date,
      time: values.time,
      guests: values.guests,
      note: values.note.trim(),
    };

    const message = [
      `Hello ${site.name}! I would like to book a table.`,
      '',
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      `Date: ${formatLongDate(details.date)}`,
      `Time: ${formatTime(details.time)}`,
      `Guests: ${details.guests}`,
      `Note: ${details.note || '—'}`,
    ].join('\n');

    const url = `${site.whatsapp.link}?text=${encodeURIComponent(message)}`;
    // `noopener` in the feature string makes a *successful* open return null too, so the
    // handle could no longer tell success from a blocked popup — and every guest would be
    // navigated away from this page. The opener reference is severed by hand instead.
    const opened = window.open(url, '_blank');
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }

    setBooking(details);
  }

  function startAnotherBooking() {
    returningToForm.current = true;
    setValues(EMPTY_VALUES);
    setErrors({});
    setTouched({});
    setBooking(null);
  }

  const describedBy = (field: FieldName) => (errors[field] ? `reserve-${field}-error` : undefined);
  const controlClass = (field: FieldName, extra?: string) =>
    cn('field-control', errors[field] && 'field-control-invalid', extra);

  return (
    <section id="reserve" className="section bg-cream" aria-labelledby="reserve-heading">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Reservations</p>
          <h2 id="reserve-heading" className="section-title">
            Book your table
          </h2>
          <p className="section-lede mx-auto">
            Fill in the details below and we will open WhatsApp with your booking already written
            out — all you have to do is press send. We reply within a few minutes during opening
            hours.
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            Planning something bigger than {site.reservation.maxGuests} guests? Call us at{' '}
            <a
              href={site.phone.href}
              className="font-semibold text-terracotta underline decoration-terracotta/40 underline-offset-4 transition-colors hover:text-terracotta-dark hover:decoration-terracotta"
            >
              {site.phone.display}
            </a>{' '}
            and we will set the long table for you.
          </p>
        </Reveal>

        <Reveal delay={120} className="mx-auto mt-12 max-w-3xl">
          {booking ? (
            <div
              ref={confirmationRef}
              tabIndex={-1}
              role="status"
              className="rounded-4xl border border-olive/25 bg-olive/5 p-6 shadow-soft sm:p-10"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive text-cream">
                  <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-2xl text-ink">Your details are on their way</h3>
                  <p className="mt-2 text-ink-muted">
                    WhatsApp is open with the message below. Send it and your table is confirmed as
                    soon as we reply — usually within a few minutes.
                  </p>
                </div>
              </div>

              <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-olive/20 pt-6 sm:grid-cols-2">
                <SummaryRow label="Name" value={booking.name} />
                <SummaryRow label="Phone" value={booking.phone} />
                <SummaryRow label="Date" value={formatLongDate(booking.date)} />
                <SummaryRow label="Time" value={formatTime(booking.time)} />
                <SummaryRow
                  label="Guests"
                  value={`${booking.guests} ${booking.guests === '1' ? 'guest' : 'guests'}`}
                />
                <SummaryRow label="Note" value={booking.note || '—'} wide />
              </dl>

              <button type="button" className="btn-secondary mt-8" onClick={startAnotherBooking}>
                Make another booking
              </button>
            </div>
          ) : (
            <form
              noValidate={hydrated}
              onSubmit={handleSubmit}
              className="rounded-4xl border border-ink/10 bg-white/70 p-6 shadow-soft sm:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="reserve-name" className="field-label">
                    Name <RequiredMark />
                  </label>
                  <input
                    id="reserve-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Giulia Rossi"
                    className={controlClass('name')}
                    value={values.name}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={describedBy('name')}
                    onChange={(event) => updateField('name', event.target.value)}
                    onBlur={() => handleBlur('name')}
                    ref={(node) => {
                      fieldRefs.current.name = node;
                    }}
                  />
                  {errors.name ? (
                    <FieldError id="reserve-name-error" message={errors.name} />
                  ) : null}
                </div>

                <div>
                  <label htmlFor="reserve-phone" className="field-label">
                    Phone <RequiredMark />
                  </label>
                  <input
                    id="reserve-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="tel"
                    placeholder="+1 212 555 0148"
                    className={controlClass('phone')}
                    value={values.phone}
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={describedBy('phone')}
                    onChange={(event) => updateField('phone', event.target.value)}
                    onBlur={() => handleBlur('phone')}
                    ref={(node) => {
                      fieldRefs.current.phone = node;
                    }}
                  />
                  {errors.phone ? (
                    <FieldError id="reserve-phone-error" message={errors.phone} />
                  ) : null}
                </div>

                <div>
                  <label htmlFor="reserve-date" className="field-label">
                    Date <RequiredMark />
                  </label>
                  <input
                    id="reserve-date"
                    name="date"
                    type="date"
                    required
                    min={dateBounds.min}
                    max={dateBounds.max}
                    className={controlClass('date')}
                    value={values.date}
                    aria-invalid={errors.date ? true : undefined}
                    aria-describedby={describedBy('date')}
                    onChange={(event) => updateField('date', event.target.value)}
                    onBlur={() => handleBlur('date')}
                    ref={(node) => {
                      fieldRefs.current.date = node;
                    }}
                  />
                  {errors.date ? (
                    <FieldError id="reserve-date-error" message={errors.date} />
                  ) : null}
                </div>

                <div>
                  <label htmlFor="reserve-time" className="field-label">
                    Time <RequiredMark />
                  </label>
                  <div className="relative">
                    <select
                      id="reserve-time"
                      name="time"
                      required
                      className={controlClass(
                        'time',
                        cn('appearance-none pr-11', !values.time && 'text-ink-muted'),
                      )}
                      value={values.time}
                      aria-invalid={errors.time ? true : undefined}
                      aria-describedby={describedBy('time')}
                      onChange={(event) => updateField('time', event.target.value)}
                      onBlur={() => handleBlur('time')}
                      ref={(node) => {
                        fieldRefs.current.time = node;
                      }}
                    >
                      <option value="" disabled>
                        Select a time
                      </option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot} className="text-ink">
                          {formatTime(slot)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                      aria-hidden="true"
                    />
                  </div>
                  {errors.time ? (
                    <FieldError id="reserve-time-error" message={errors.time} />
                  ) : null}
                </div>

                <div>
                  <label htmlFor="reserve-guests" className="field-label">
                    Guests <RequiredMark />
                  </label>
                  <div className="relative">
                    <select
                      id="reserve-guests"
                      name="guests"
                      required
                      className={controlClass(
                        'guests',
                        cn('appearance-none pr-11', !values.guests && 'text-ink-muted'),
                      )}
                      value={values.guests}
                      aria-invalid={errors.guests ? true : undefined}
                      aria-describedby={describedBy('guests')}
                      onChange={(event) => updateField('guests', event.target.value)}
                      onBlur={() => handleBlur('guests')}
                      ref={(node) => {
                        fieldRefs.current.guests = node;
                      }}
                    >
                      <option value="" disabled>
                        How many of you?
                      </option>
                      {GUEST_OPTIONS.map((count) => (
                        <option key={count} value={String(count)} className="text-ink">
                          {`${count} ${count === 1 ? 'guest' : 'guests'}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                      aria-hidden="true"
                    />
                  </div>
                  {errors.guests ? (
                    <FieldError id="reserve-guests-error" message={errors.guests} />
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="reserve-note" className="field-label">
                    Allergies, a high chair, a birthday?{' '}
                    <span className="font-normal text-ink-muted">(optional)</span>
                  </label>
                  <textarea
                    id="reserve-note"
                    name="note"
                    rows={4}
                    maxLength={NOTE_MAX_LENGTH}
                    className="field-control resize-y"
                    placeholder="Anything that helps us look after you."
                    value={values.note}
                    aria-describedby="reserve-note-counter"
                    onChange={(event) => updateField('note', event.target.value)}
                  />
                  <p id="reserve-note-counter" className="mt-1.5 text-right text-xs text-ink-muted">
                    {/* One string so a translated page still sees the count change (About.tsx). */}
                    {`${values.note.length} / ${NOTE_MAX_LENGTH} characters`}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-muted">
                  <RequiredMark /> Required. We only use these details to hold your table.
                </p>
                <button type="submit" disabled={!hydrated} className="btn-primary w-full sm:w-auto">
                  <Send className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  Send via WhatsApp
                </button>
              </div>
            </form>
          )}

          <p className="mx-auto mt-6 max-w-prose text-center text-xs leading-relaxed text-ink-muted">
            Demo site: nothing is stored, and nothing is sent anywhere. The only message that leaves
            your device is the WhatsApp one you press send on yourself.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
