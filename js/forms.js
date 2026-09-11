/* =========================================================
   BJ FINANCES — forms.js
   Lead capture, validation, and localStorage mini-CRM
   ========================================================= */

// ── LEAD STORAGE ──────────────────────────────────────────
const LEADS_KEY = 'bjf_leads';

function generateLeadId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `BJF-${ts}-${rand}`;
}

function getLeads() {
  try { return JSON.parse(localStorage.getItem(LEADS_KEY)) || []; }
  catch { return []; }
}

function saveLead(data) {
  const leads = getLeads();
  const lead = {
    leadId:           generateLeadId(),
    dateTime:         new Date().toISOString(),
    status:           'New',
    assignedEmployee: '',
    nextFollowUp:     '',
    remarks:          '',
    source:           data.source || document.title,
    ...data
  };
  leads.unshift(lead);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  return lead;
}

// ── VALIDATION HELPERS ────────────────────────────────────
function isValidPhone(v) { return /^[6-9]\d{9}$/.test(v.replace(/\s/g,'')); }
function isValidName(v)  { return v.trim().length >= 2; }
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidAmount(v){ return parseFloat(v) > 0; }

function showError(input, msg) {
  clearError(input);
  input.style.borderColor = '#E53E3E';
  const err = document.createElement('span');
  err.className = 'field-error';
  err.style.cssText = 'color:#E53E3E;font-size:0.75rem;margin-top:4px;display:block;';
  err.textContent = msg;
  input.parentNode.appendChild(err);
}
function clearError(input) {
  input.style.borderColor = '';
  const old = input.parentNode.querySelector('.field-error');
  if (old) old.remove();
}
function clearAllErrors(form) {
  form.querySelectorAll('.field-error').forEach(e => e.remove());
  form.querySelectorAll('input,select,textarea').forEach(el => el.style.borderColor = '');
}

// ── SHOW SUCCESS MESSAGE ──────────────────────────────────
function showSuccess(form, leadId) {
  const successEl = form.closest('.form-card, .hero-form-card')
    ?.querySelector('.form-success');
  if (successEl) {
    form.style.display = 'none';
    successEl.style.display = 'block';
    const lidEl = successEl.querySelector('.lead-id');
    if (lidEl) lidEl.textContent = leadId;
  } else {
    form.innerHTML = `
      <div class="form-success" style="display:block;text-align:center;padding:32px 0;">
        <div style="font-size:3rem;margin-bottom:12px;">✅</div>
        <h3 style="color:#176B3A;margin-bottom:12px;">Thank You!</h3>
        <p style="font-size:0.9rem;color:#555;max-width:400px;margin:0 auto 12px;">
          Your information has been received. A BJ FINANCES representative may contact you
          to understand your requirements and discuss the next steps.
        </p>
        <p style="font-size:0.78rem;color:#8492A6;">Reference ID: <strong>${leadId}</strong></p>
      </div>`;
  }
}

// ── HERO FORM ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Hero quick form
  const heroForm = document.getElementById('heroForm');
  if (heroForm) {
    heroForm.addEventListener('submit', e => {
      e.preventDefault();
      clearAllErrors(heroForm);
      let valid = true;
      const name    = heroForm.querySelector('[name="fullName"]');
      const mobile  = heroForm.querySelector('[name="mobile"]');
      const income  = heroForm.querySelector('[name="income"]');
      const empType = heroForm.querySelector('[name="empType"]');
      const amount  = heroForm.querySelector('[name="amount"]');
      const product = heroForm.querySelector('[name="product"]');

      if (name && !isValidName(name.value)) { showError(name, 'Please enter your full name'); valid=false; }
      if (mobile && !isValidPhone(mobile.value)) { showError(mobile, 'Enter a valid 10-digit mobile number'); valid=false; }
      if (!valid) return;

      const lead = saveLead({
        fullName:       name?.value.trim(),
        mobile:         mobile?.value.trim(),
        monthlyIncome:  income?.value.trim(),
        employmentType: empType?.value,
        requiredAmount: amount?.value.trim(),
        product:        product?.value,
        source:         'Hero Form – Homepage'
      });
      showSuccess(heroForm, lead.leadId);
    });
  }

  // ── ELIGIBILITY FORM (multi-step) ────────────────────────
  const eligForm = document.getElementById('eligibilityForm');
  if (eligForm) {
    let currentStep = 1;
    const totalSteps = 3;

    function goToStep(n) {
      eligForm.querySelectorAll('.form-step').forEach((s, i) => {
        s.style.display = (i + 1 === n) ? 'block' : 'none';
      });
      document.querySelectorAll('.step-dot').forEach((d, i) => {
        d.classList.remove('active','done');
        if (i + 1 < n) d.classList.add('done');
        if (i + 1 === n) d.classList.add('active');
      });
      currentStep = n;
      window.scrollTo({ top: eligForm.closest('.form-card').offsetTop - 100, behavior: 'smooth' });
    }

    eligForm.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.dataset.next) - 1;
        if (currentStep < totalSteps) goToStep(currentStep + 1);
      });
    });
    eligForm.querySelectorAll('[data-prev]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) goToStep(currentStep - 1);
      });
    });

    eligForm.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(eligForm);
      const data = {};
      fd.forEach((v, k) => data[k] = v);
      const lead = saveLead({ ...data, source: 'Eligibility Form' });
      document.querySelector('.eligibility-form-wrap').innerHTML = `
        <div class="form-card" style="text-align:center;padding:60px 32px;">
          <div style="font-size:4rem;margin-bottom:20px;">✅</div>
          <h2 style="color:#176B3A;margin-bottom:16px;">Thank You!</h2>
          <p style="font-size:0.95rem;color:#555;max-width:460px;margin:0 auto 20px;line-height:1.75;">
            Your information has been received. A BJ FINANCES representative may contact you
            to understand your requirements and discuss the next steps.
          </p>
          <p style="font-size:0.82rem;color:#8492A6;">Your Reference ID: <strong>${lead.leadId}</strong></p>
          <a href="index.html" class="btn btn-primary mt-24" style="margin-top:24px;">Return to Home</a>
        </div>`;
    });

    goToStep(1);
  }

  // ── BALANCE TRANSFER FORM ─────────────────────────────────
  const btForm = document.getElementById('btForm');
  if (btForm) {
    btForm.addEventListener('submit', e => {
      e.preventDefault();
      clearAllErrors(btForm);
      let valid = true;
      const name   = btForm.querySelector('[name="fullName"]');
      const mobile = btForm.querySelector('[name="mobile"]');
      if (name && !isValidName(name.value)) { showError(name,'Enter your full name'); valid=false; }
      if (mobile && !isValidPhone(mobile.value)) { showError(mobile,'Enter valid 10-digit mobile'); valid=false; }
      if (!valid) return;
      const fd = new FormData(btForm);
      const data = {};
      fd.forEach((v,k) => data[k] = v);
      const lead = saveLead({ ...data, product:'Balance Transfer', source:'Balance Transfer Page' });
      showSuccess(btForm, lead.leadId);
    });
  }

  // ── GENERIC PRODUCT FORMS ─────────────────────────────────
  document.querySelectorAll('.product-lead-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      clearAllErrors(form);
      let valid = true;
      const name   = form.querySelector('[name="fullName"]');
      const mobile = form.querySelector('[name="mobile"]');
      if (name && !isValidName(name.value)) { showError(name,'Enter your full name'); valid=false; }
      if (mobile && !isValidPhone(mobile.value)) { showError(mobile,'Enter valid 10-digit mobile'); valid=false; }
      if (!valid) return;
      const fd = new FormData(form);
      const data = {};
      fd.forEach((v,k) => data[k] = v);
      const lead = saveLead({ ...data, source: form.dataset.source || document.title });
      showSuccess(form, lead.leadId);
    });
  });

  // ── CONTACT FORM ──────────────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      clearAllErrors(contactForm);
      let valid = true;
      const name   = contactForm.querySelector('[name="fullName"]');
      const mobile = contactForm.querySelector('[name="mobile"]');
      const email  = contactForm.querySelector('[name="email"]');
      if (name && !isValidName(name.value)) { showError(name,'Enter your full name'); valid=false; }
      if (mobile && !isValidPhone(mobile.value)) { showError(mobile,'Enter valid 10-digit mobile'); valid=false; }
      if (email && email.value && !isValidEmail(email.value)) { showError(email,'Enter valid email'); valid=false; }
      if (!valid) return;
      const fd = new FormData(contactForm);
      const data = {};
      fd.forEach((v,k) => data[k] = v);
      saveLead({ ...data, source: 'Contact Form' });
      contactForm.innerHTML = `
        <div style="text-align:center;padding:40px 0;">
          <div style="font-size:3rem;margin-bottom:12px;">✅</div>
          <h3 style="color:#176B3A;margin-bottom:12px;">Message Received!</h3>
          <p style="font-size:0.9rem;color:#555;">Our team will get back to you shortly.</p>
        </div>`;
    });
  }

  // ── CAREERS FORM ─────────────────────────────────────────
  const careersForm = document.getElementById('careersForm');
  if (careersForm) {
    careersForm.addEventListener('submit', e => {
      e.preventDefault();
      clearAllErrors(careersForm);
      let valid = true;
      const name  = careersForm.querySelector('[name="fullName"]');
      const mobile= careersForm.querySelector('[name="mobile"]');
      const email = careersForm.querySelector('[name="email"]');
      if (name && !isValidName(name.value)) { showError(name,'Enter your full name'); valid=false; }
      if (mobile && !isValidPhone(mobile.value)) { showError(mobile,'Enter valid 10-digit mobile'); valid=false; }
      if (email && !isValidEmail(email.value)) { showError(email,'Enter valid email'); valid=false; }
      if (!valid) return;
      careersForm.innerHTML = `
        <div style="text-align:center;padding:40px 0;">
          <div style="font-size:3rem;margin-bottom:12px;">🎉</div>
          <h3 style="color:#176B3A;margin-bottom:12px;">Application Submitted!</h3>
          <p style="font-size:0.9rem;color:#555;">Thank you for your interest in BJ FINANCES. Our HR team will review your application and reach out if your profile matches our requirements.</p>
        </div>`;
    });
  }

  // ── PRE-FILL PRODUCT IN FORMS ─────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const preProduct = params.get('product');
  if (preProduct) {
    document.querySelectorAll('select[name="product"]').forEach(sel => {
      Array.from(sel.options).forEach(opt => {
        if (opt.value.toLowerCase().includes(preProduct.toLowerCase())) sel.value = opt.value;
      });
    });
  }
  const prePosition = params.get('position');
  if (prePosition) {
    const sel = document.querySelector('select[name="position"]');
    if (sel) {
      Array.from(sel.options).forEach(opt => {
        if (opt.value.toLowerCase().includes(prePosition.toLowerCase())) sel.value = opt.value;
      });
    }
  }

});
