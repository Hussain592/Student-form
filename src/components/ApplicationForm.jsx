import babulLogo from '../Babul.png';

function Field({ children, className = '' }) {
  return <div className={`min-w-0 ${className}`}>{children}</div>;
}

const inputClass = 'mt-2 min-h-11 w-full rounded-lg border border-slate-700 bg-[#0b1624]/90 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/15';
const labelClass = 'block text-sm font-medium text-slate-300';

function StatusIcon({ status }) {
  if (status === 'sending') {
    return (
      <svg className="size-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    );
  }

  if (status === 'success') {
    return (
      <svg className="size-5 shrink-0 animate-check-pop" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="m7.5 12.5 3 3 6-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v6m0 4h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export default function ApplicationForm({ form, update, submit, status, message, frameRef }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(13,91,84,0.22),transparent_55%),linear-gradient(155deg,#0b1220_10%,#101c2b_68%,#0c292c_100%)]" />
      <div className="relative w-full max-w-xl animate-form-in">
        <header className="mb-8 text-center">
          <img className="mx-auto mb-4 size-14 rounded-xl object-cover object-[center_35%]" src={babulLogo} alt="Babul Tech logo" />
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Student interest form</h1>
          <p className="m-0 text-sm leading-6 text-slate-400">Share your contact details and current education or work.</p>
        </header>

        <form className="rounded-2xl border border-slate-700/80 bg-[#101a29]/90 p-5 shadow-[0_24px_90px_rgba(0,0,0,.3)] backdrop-blur sm:p-8" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <label className={labelClass} htmlFor="name">Full name <span className="text-teal-300">*</span></label>
              <input className={inputClass} id="name" name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" required minLength="2" maxLength="100" />
            </Field>

            <Field>
              <label className={labelClass} htmlFor="email">Email address <span className="text-teal-300">*</span></label>
              <input className={inputClass} id="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" type="email" autoComplete="email" required maxLength="254" />
            </Field>

            <Field>
              <label className={labelClass} htmlFor="phone">Phone number <span className="text-teal-300">*</span></label>
              <input className={inputClass} id="phone" name="phone" value={form.phone} onChange={update} placeholder="+92 300 1234567" type="tel" autoComplete="tel" required maxLength="30" />
            </Field>

            <Field className="sm:col-span-2">
              <label className={labelClass} htmlFor="education">Education / current work <span className="text-teal-300">*</span></label>
              <input className={inputClass} id="education" name="education" value={form.education} onChange={update} placeholder="What are you studying or doing?" required maxLength="200" />
            </Field>

            <Field className="sm:col-span-2">
              <label className={labelClass} htmlFor="motivation">Why are you interested in this course? <span className="text-teal-300">*</span></label>
              <textarea className={`${inputClass} min-h-24 resize-y leading-6`} id="motivation" name="motivation" value={form.motivation} onChange={update} placeholder="Tell us what interests you…" required maxLength="500" rows="3" />
              <span className="mt-1 block text-right text-xs text-slate-500">{form.motivation.length}/500</span>
            </Field>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-400">
            <input className="mt-0.5 size-4 shrink-0 accent-teal-400" name="consent" type="checkbox" checked={form.consent} onChange={update} required />
            <span>I agree that the course team may use these details to contact me about this course.</span>
          </label>

          <div className="absolute size-px overflow-hidden [clip:rect(0,0,0,0)]" aria-hidden="true">
            <label htmlFor="website">Leave this field empty</label>
            <input id="website" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" />
          </div>

          {message && (
            <div key={status} className={`mt-5 flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5 animate-status-in ${status === 'success' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : status === 'sending' ? 'border-teal-300/20 bg-teal-300/10 text-teal-100' : 'border-rose-400/20 bg-rose-400/10 text-rose-200'}`} role={status === 'error' ? 'alert' : 'status'} aria-live={status === 'error' ? 'assertive' : 'polite'}>
              <StatusIcon status={status} />
              {message}
            </div>
          )}

          <button className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 text-sm font-semibold text-[#082022] transition hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-[#101a29] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={status === 'sending'}>
            {status === 'sending' && (<svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="3" /></svg>)}
            {status === 'sending' ? 'Sending…' : 'Submit interest'}
          </button>
          <p className="mb-0 mt-4 text-center text-xs text-slate-500">Your information is only used to contact you about this course.</p>
        </form>
      </div>

      <iframe ref={frameRef} name="sheets-submit-frame" title="Form submission response" className="absolute size-px overflow-hidden [clip:rect(0,0,0,0)]" tabIndex="-1" aria-hidden="true" />
    </section>
  );
}
