/**
 * Client-side controller for the multi-step intake form.
 *
 * - Steps are toggled with the `hidden` attribute; all fields stay in the DOM,
 *   so nothing is lost when moving between steps.
 * - A draft is kept in sessionStorage (cleared when the tab closes or after a
 *   successful submission) so an accidental refresh does not lose answers.
 * - Validation and submission are delegated to src/lib/intake/.
 */
import { minFillTimeMs, steps as stepConfig } from '@/config/intake';
import { firm } from '@/config/site';
import {
  emptyIntake,
  firstInvalidStep,
  stepFields,
  validateField,
  validateStep,
  type FieldErrors,
  type FieldName,
  type IntakeData,
} from '@/lib/intake/validation';
import { summarize, summaryText } from '@/lib/intake/summary';
import { buildPayload, resolveProvider, submitIntake, type SubmitOutcome } from '@/lib/intake/submit';

const DRAFT_KEY = 'hl-intake-draft';
const LAST_STEP = stepConfig.length - 1;

/** Fields that are never written to the draft. */
const NOT_SAVED: FieldName[] = ['acknowledgment'];

const FIELD_LABELS: Record<FieldName, string> = {
  fullName: 'Full name',
  email: 'Email address',
  phone: 'Phone number',
  disputeState: 'State where the dispute arose',
  disputeType: 'Type of dispute',
  opposingParty: 'Opposing party',
  opposingLocation: 'Opposing party’s city and state',
  amount: 'Approximate amount',
  description: 'What happened',
  resolution: 'Resolution sought',
  hasDeadline: 'Deadline or court date',
  deadlineDetails: 'Deadline details',
  acknowledgment: 'Acknowledgment',
};

const storage = {
  read(): Partial<IntakeData> | null {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as Partial<IntakeData>) : null;
    } catch {
      return null;
    }
  },
  write(data: IntakeData) {
    try {
      const draft: Partial<IntakeData> = { ...data };
      NOT_SAVED.forEach((key) => delete draft[key]);
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* Storage unavailable (private mode, quota). The form still works. */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  },
};

export function initIntakeForm(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-form]')!;
  const stepEls = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  const progressSteps = [...root.querySelectorAll<HTMLElement>('[data-progress-step]')];
  const progressBar = root.querySelector<HTMLElement>('[data-progress-bar]')!;
  const progressCount = root.querySelector<HTMLElement>('[data-progress-count]')!;
  const announcer = root.querySelector<HTMLElement>('[data-announcer]')!;
  const errorSummary = root.querySelector<HTMLElement>('[data-error-summary]')!;
  const errorList = root.querySelector<HTMLElement>('[data-error-list]')!;
  const prevBtn = root.querySelector<HTMLButtonElement>('[data-prev]')!;
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-next]')!;
  const submitBtn = root.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = root.querySelector<HTMLElement>('[data-submit-label]')!;
  const submitError = root.querySelector<HTMLElement>('[data-submit-error]')!;
  const submitErrorText = root.querySelector<HTMLElement>('[data-submit-error-text]')!;
  const review = root.querySelector<HTMLElement>('[data-review]')!;
  const deadlineDetails = root.querySelector<HTMLElement>('[data-deadline-details]')!;
  const honeypot = form.querySelector<HTMLInputElement>('[name="hl_ref"]')!;
  const outcomes = [...root.querySelectorAll<HTMLElement>('[data-outcome]')];
  const mailtoLink = root.querySelector<HTMLAnchorElement>('[data-mailto]');
  const demoNote = root.querySelector<HTMLElement>('[data-demo-note]');

  const provider = resolveProvider({
    provider: import.meta.env.PUBLIC_INTAKE_PROVIDER,
    endpoint: import.meta.env.PUBLIC_INTAKE_ENDPOINT,
    isDev: import.meta.env.DEV || import.meta.env.PUBLIC_INTAKE_ALLOW_DEMO === 'true',
  });

  const startedAt = Date.now();
  let current = 0;
  let submitting = false;
  /** Fields the user has interacted with or that failed a step check; only these show live errors. */
  const touched = new Set<FieldName>();

  // ---------- Data ----------
  const read = (): IntakeData => {
    const data = emptyIntake();
    const fd = new FormData(form);
    (Object.keys(data) as FieldName[]).forEach((key) => {
      if (key === 'acknowledgment') {
        data.acknowledgment = fd.get('acknowledgment') === 'on';
      } else {
        (data as unknown as Record<string, string>)[key] = String(fd.get(key) ?? '');
      }
    });
    return data;
  };

  const restore = (draft: Partial<IntakeData>) => {
    (Object.entries(draft) as [FieldName, unknown][]).forEach(([key, value]) => {
      if (typeof value !== 'string' || NOT_SAVED.includes(key)) return;
      const controls = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        `[name="${key}"]`,
      );
      controls.forEach((control) => {
        if (control instanceof HTMLInputElement && control.type === 'radio') control.checked = control.value === value;
        else control.value = value;
      });
    });
  };

  // ---------- Field-level errors ----------
  const fieldContainer = (name: FieldName) => form.querySelector<HTMLElement>(`[data-field="${name}"]`);
  const controlsFor = (name: FieldName) =>
    [...form.querySelectorAll<HTMLElement>(`[name="${name}"]`)] as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

  const showFieldError = (name: FieldName, message?: string) => {
    const container = fieldContainer(name);
    const errorEl = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    container?.classList.toggle('is-invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message ?? '';
    controlsFor(name).forEach((control) => {
      if (message) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    });
  };

  const renderErrorSummary = (errors: FieldErrors) => {
    const entries = Object.entries(errors) as [FieldName, string][];
    errorList.replaceChildren(
      ...entries.map(([name, message]) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${controlsFor(name)[0]?.id ?? ''}`;
        link.textContent = message;
        link.addEventListener('click', (event) => {
          event.preventDefault();
          controlsFor(name)[0]?.focus();
        });
        li.append(link);
        return li;
      }),
    );
    errorSummary.hidden = entries.length === 0;
  };

  const clearErrorSummary = () => {
    errorSummary.hidden = true;
    errorList.replaceChildren();
  };

  /** Validate the current step; show errors and move focus to the summary if invalid. */
  const checkStep = (step: number): boolean => {
    const data = read();
    const errors = validateStep(step, data);
    (stepFields[step] ?? []).forEach((name) => {
      touched.add(name);
      showFieldError(name, errors[name]);
    });
    if (Object.keys(errors).length) {
      renderErrorSummary(errors);
      errorSummary.focus();
      announce(`${Object.keys(errors).length} ${Object.keys(errors).length === 1 ? 'problem' : 'problems'} to fix on this step.`);
      return false;
    }
    clearErrorSummary();
    return true;
  };

  // ---------- Steps ----------
  const announce = (message: string) => {
    announcer.textContent = '';
    window.setTimeout(() => (announcer.textContent = message), 50);
  };

  const showStep = (step: number, { focus = true } = {}) => {
    current = step;
    stepEls.forEach((el, index) => (el.hidden = index !== step));

    progressSteps.forEach((el, index) => {
      const state = el.querySelector<HTMLElement>('[data-progress-state]');
      el.classList.toggle('is-complete', index < step);
      if (index === step) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
      if (state) state.textContent = index < step ? ' (completed)' : index === step ? ' (current step)' : '';
    });
    progressBar.style.width = `${((step + 1) / stepConfig.length) * 100}%`;
    progressCount.textContent = `Step ${step + 1} of ${stepConfig.length}`;

    prevBtn.hidden = step === 0;
    nextBtn.hidden = step === LAST_STEP;
    submitBtn.hidden = step !== LAST_STEP;

    clearErrorSummary();
    submitError.hidden = true;
    if (step === LAST_STEP) renderReview();

    if (focus) {
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      stepEls[step].querySelector<HTMLElement>('.step__title')?.focus({ preventScroll: true });
      announce(`Step ${step + 1} of ${stepConfig.length}: ${stepConfig[step].title}`);
    }
  };

  const renderReview = () => {
    const sections = summarize(read());
    review.replaceChildren(
      ...sections.map((section) => {
        const wrapper = document.createElement('section');
        wrapper.className = 'review__section';

        const head = document.createElement('div');
        head.className = 'review__head';
        const title = document.createElement('h3');
        title.textContent = section.title;
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'review__edit';
        edit.textContent = 'Edit';
        edit.setAttribute('aria-label', `Edit ${section.title.toLowerCase()}`);
        edit.addEventListener('click', () => showStep(section.step));
        head.append(title, edit);

        const list = document.createElement('dl');
        section.rows.forEach((row) => {
          const item = document.createElement('div');
          const dt = document.createElement('dt');
          dt.textContent = row.label;
          const dd = document.createElement('dd');
          dd.textContent = row.value;
          if (row.value === 'Not provided') dd.classList.add('is-empty');
          item.append(dt, dd);
          list.append(item);
        });

        wrapper.append(head, list);
        return wrapper;
      }),
    );
  };

  const syncDeadline = () => {
    const show = read().hasDeadline === 'yes';
    deadlineDetails.hidden = !show;
    if (!show) showFieldError('deadlineDetails');
  };

  const updateCounters = () => {
    form.querySelectorAll<HTMLTextAreaElement>('textarea[data-counter]').forEach((textarea) => {
      const counter = root.querySelector(`#${textarea.dataset.counter} [data-count]`);
      if (counter) counter.textContent = textarea.value.length.toLocaleString('en-US');
    });
  };

  // ---------- Outcomes ----------
  const showOutcome = (outcome: SubmitOutcome) => {
    if (outcome.status === 'error') {
      submitErrorText.textContent =
        outcome.reason === 'timeout'
          ? 'The request took too long to send. Your information has not been lost. Please try again, or contact the office directly.'
          : 'Something went wrong while sending. Your information has not been lost. Please try again, or contact the office directly.';
      submitError.hidden = false;
      submitError.focus();
      return;
    }

    form.hidden = true;
    root.querySelector<HTMLElement>('.progress')!.hidden = true;
    outcomes.forEach((el) => (el.hidden = el.dataset.outcome !== outcome.status));
    const shown = outcomes.find((el) => !el.hidden);

    if (outcome.status === 'delivered') {
      storage.clear();
      if (demoNote) demoNote.hidden = !outcome.demo;
    }
    if (outcome.status === 'not_configured' && mailtoLink) {
      const data = read();
      const subject = `Demand letter request: ${data.fullName}`;
      mailtoLink.href = `mailto:${firm.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summaryText(data))}`;
    }

    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    shown?.focus({ preventScroll: true });
  };

  const backToForm = () => {
    outcomes.forEach((el) => (el.hidden = true));
    form.hidden = false;
    root.querySelector<HTMLElement>('.progress')!.hidden = false;
    showStep(LAST_STEP);
  };

  const setSubmitting = (busy: boolean) => {
    submitting = busy;
    submitBtn.disabled = busy;
    prevBtn.disabled = busy;
    submitBtn.setAttribute('aria-busy', String(busy));
    submitLabel.textContent = busy ? 'Submitting…' : 'Submit Request';
    form.setAttribute('aria-busy', String(busy));
  };

  // ---------- Events ----------
  nextBtn.addEventListener('click', () => {
    if (checkStep(current)) showStep(current + 1);
  });

  prevBtn.addEventListener('click', () => showStep(current - 1));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    // Re-check every step in case something was edited from the review screen.
    const data = read();
    const invalidStep = firstInvalidStep(data);
    if (invalidStep !== -1 && invalidStep !== LAST_STEP) {
      showStep(invalidStep);
      checkStep(invalidStep);
      return;
    }
    if (!checkStep(LAST_STEP)) return;

    submitError.hidden = true;
    setSubmitting(true);
    announce('Submitting your request.');
    try {
      const payload = buildPayload(
        data,
        { honeypot: honeypot.value, elapsedMs: Date.now() - startedAt },
        window.location.pathname,
      );
      const outcome = await submitIntake(provider, payload, minFillTimeMs);
      showOutcome(outcome);
    } finally {
      setSubmitting(false);
    }
  });

  // Enter in a single-line input advances instead of submitting early.
  form.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    if (event.key === 'Enter' && target instanceof HTMLInputElement && target.type !== 'checkbox' && current !== LAST_STEP) {
      event.preventDefault();
      nextBtn.click();
    }
  });

  let saveTimer: number | undefined;
  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const name = target.name as FieldName;
    if (name === 'hasDeadline') syncDeadline();
    if (target.tagName === 'TEXTAREA') updateCounters();

    // Live re-validation once a field has been visited, so errors clear as they are fixed.
    if (touched.has(name)) {
      const message = validateField(name, read());
      showFieldError(name, message);
      if (!message && !errorSummary.hidden) {
        const remaining = validateStep(current, read());
        if (Object.keys(remaining).length === 0) clearErrorSummary();
        else renderErrorSummary(remaining);
      }
    }

    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => storage.write(read()), 300);
  };

  form.addEventListener('input', onChange);
  form.addEventListener('change', onChange);
  form.addEventListener(
    'blur',
    (event) => {
      const target = event.target as HTMLInputElement;
      const name = target.name as FieldName;
      if (!name || !(name in FIELD_LABELS) || target.type === 'radio' || name === 'acknowledgment') return;
      // Only flag a field on blur once it has a value, to avoid errors while tabbing through.
      if (target.value.trim() !== '' || touched.has(name)) {
        touched.add(name);
        showFieldError(name, validateField(name, read()));
      }
    },
    true,
  );

  root.querySelector('[data-back-to-form]')?.addEventListener('click', backToForm);

  // ---------- Init ----------
  const draft = storage.read();
  if (draft) restore(draft);
  syncDeadline();
  updateCounters();
  showStep(0, { focus: false });
}
