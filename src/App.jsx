import { useEffect, useRef, useState } from 'react';
import ApplicationForm from './components/ApplicationForm.jsx';
import babulLogo from './Babul.png';

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  education: '',
  motivation: '',
  consent: false,
  website: '',
};

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const frameRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const introTimer = window.setTimeout(() => setShowIntro(false), reducedMotion ? 0 : 1250);
    return () => window.clearTimeout(introTimer);
  }, []);

  function update(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  useEffect(() => {
    function handleResponse(event) {
      if (
        event.data?.type !== 'course-interest-result' ||
        event.data.nonce !== requestRef.current?.nonce
      ) {
        return;
      }

      window.clearTimeout(requestRef.current.timeout);
      requestRef.current = null;
      setStatus(event.data.ok ? 'success' : 'error');
      setMessage(event.data.message);
      if (event.data.ok) setForm(EMPTY_FORM);
    }

    window.addEventListener('message', handleResponse);
    return () => {
      window.removeEventListener('message', handleResponse);
      if (requestRef.current) window.clearTimeout(requestRef.current.timeout);
    };
  }, []);

  function submit(event) {
    event.preventDefault();
    setMessage('');

    if (!SCRIPT_URL || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(SCRIPT_URL)) {
      setStatus('error');
      setMessage('Google Sheets is not connected yet. Please contact the course team before submitting.');
      return;
    }

    if (!window.crypto?.getRandomValues || !frameRef.current) {
      setStatus('error');
      setMessage('This browser cannot securely submit the form. Please try an up-to-date browser.');
      return;
    }

    const random = new Uint8Array(16);
    window.crypto.getRandomValues(random);
    const nonce = Array.from(random, (byte) => byte.toString(16).padStart(2, '0')).join('');
    requestRef.current = {
      nonce,
      timeout: window.setTimeout(() => {
        requestRef.current = null;
        setStatus('error');
        setMessage('We could not confirm your submission. Please check with the course team before submitting again.');
      }, 30000),
    };
    setStatus('sending');
    setMessage('Submitting your form...');

    try {
      const submission = document.createElement('form');
      submission.method = 'POST';
      submission.action = SCRIPT_URL;
      submission.target = frameRef.current.name;
      const sheetFields = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        education: form.education,
        motivation: form.motivation,
        consent: form.consent,
        website: form.website,
        nonce,
      };
      Object.entries(sheetFields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = String(value);
        submission.appendChild(input);
      });
      document.body.appendChild(submission);
      submission.submit();
      submission.remove();
    } catch {
      window.clearTimeout(requestRef.current?.timeout);
      requestRef.current = null;
      setStatus('error');
      setMessage('We could not send your details. Please check your connection and try again.');
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1220] text-slate-100">
      {showIntro ? (
        <section className="relative grid min-h-screen place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_100%,rgba(13,91,84,0.22),transparent_55%),linear-gradient(155deg,#0b1220_10%,#101c2b_68%,#0c292c_100%)] px-4 text-center" aria-label="Welcome">
          <div className="animate-intro-in">
            <img className="mx-auto mb-5 size-20 rounded-2xl object-cover object-[center_35%] shadow-[0_0_40px_rgba(45,212,191,.16)]" src={babulLogo} alt="Babul Tech logo" />
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.24em] text-teal-300">Babul Tech</p>
            <h1 className="m-0 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Student interest form</h1>
            <p className="mt-3 text-sm text-slate-400">Your next step starts here.</p>
            <div className="mx-auto mt-7 h-1 w-24 overflow-hidden rounded-full bg-white/10"><div className="h-full w-full origin-left animate-intro-progress rounded-full bg-teal-300" /></div>
          </div>
        </section>
      ) : (
        <ApplicationForm
          form={form}
          update={update}
          submit={submit}
          status={status}
          message={message}
          frameRef={frameRef}
        />
      )}
    </main>
  );
}
