/* =========================================================
   BJ FINANCES — calculator.js
   EMI Calculator, BT Calculator
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── HELPER ────────────────────────────────────────────────
  function formatINR(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  // ── EMI CALCULATOR ────────────────────────────────────────
  const emiCalc = document.getElementById('emiCalculator');
  if (emiCalc) {
    const loanAmtSlider = emiCalc.querySelector('#loanAmount');
    const rateSlider    = emiCalc.querySelector('#interestRate');
    const tenureSlider  = emiCalc.querySelector('#tenure');
    const loanAmtDisp   = emiCalc.querySelector('#loanAmountDisp');
    const rateDisp      = emiCalc.querySelector('#interestRateDisp');
    const tenureDisp    = emiCalc.querySelector('#tenureDisp');
    const emiResult     = emiCalc.querySelector('#emiResult');
    const totalIntResult= emiCalc.querySelector('#totalInterestResult');
    const totalPayResult= emiCalc.querySelector('#totalPaymentResult');

    function calcEMI() {
      const P = parseFloat(loanAmtSlider.value);
      const r = parseFloat(rateSlider.value) / 12 / 100;
      const n = parseInt(tenureSlider.value);
      loanAmtDisp.textContent = formatINR(P);
      rateDisp.textContent    = parseFloat(rateSlider.value).toFixed(1) + '%';
      tenureDisp.textContent  = n + ' Months';

      const emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const totalPayment = emi * n;
      const totalInterest = totalPayment - P;

      if (emiResult)      emiResult.textContent      = formatINR(emi);
      if (totalIntResult) totalIntResult.textContent  = formatINR(totalInterest);
      if (totalPayResult) totalPayResult.textContent  = formatINR(totalPayment);
    }

    [loanAmtSlider, rateSlider, tenureSlider].forEach(s => {
      if (s) s.addEventListener('input', calcEMI);
    });
    calcEMI();
  }

  // ── BALANCE TRANSFER CALCULATOR ───────────────────────────
  const btCalc = document.getElementById('btCalculator');
  if (btCalc) {
    const outstandingSlider  = btCalc.querySelector('#btOutstanding');
    const currentRateSlider  = btCalc.querySelector('#btCurrentRate');
    const tenureSlider       = btCalc.querySelector('#btTenure');
    const newRateSlider      = btCalc.querySelector('#btNewRate');
    const outstandingDisp    = btCalc.querySelector('#btOutstandingDisp');
    const currentRateDisp    = btCalc.querySelector('#btCurrentRateDisp');
    const tenureDisp         = btCalc.querySelector('#btTenureDisp');
    const newRateDisp        = btCalc.querySelector('#btNewRateDisp');
    const currentEmiResult   = btCalc.querySelector('#btCurrentEmi');
    const newEmiResult       = btCalc.querySelector('#btNewEmi');
    const savingsResult      = btCalc.querySelector('#btSavings');

    function calcBT() {
      const P  = parseFloat(outstandingSlider.value);
      const r1 = parseFloat(currentRateSlider.value) / 12 / 100;
      const r2 = parseFloat(newRateSlider.value) / 12 / 100;
      const n  = parseInt(tenureSlider.value);

      outstandingDisp.textContent  = formatINR(P);
      currentRateDisp.textContent  = parseFloat(currentRateSlider.value).toFixed(1) + '%';
      tenureDisp.textContent       = n + ' Months';
      newRateDisp.textContent      = parseFloat(newRateSlider.value).toFixed(1) + '%';

      const emi1 = r1 === 0 ? P/n : P * r1 * Math.pow(1+r1,n) / (Math.pow(1+r1,n) - 1);
      const emi2 = r2 === 0 ? P/n : P * r2 * Math.pow(1+r2,n) / (Math.pow(1+r2,n) - 1);
      const diff = emi1 - emi2;

      if (currentEmiResult) currentEmiResult.textContent = formatINR(emi1);
      if (newEmiResult)     newEmiResult.textContent     = formatINR(emi2);
      if (savingsResult) {
        savingsResult.textContent = diff > 0 ? formatINR(diff) + '/mo' : '₹0';
        savingsResult.style.color = diff > 0 ? '#4ECBB4' : '#fff';
      }
    }

    [outstandingSlider, currentRateSlider, tenureSlider, newRateSlider].forEach(s => {
      if (s) s.addEventListener('input', calcBT);
    });
    calcBT();
  }

  // ── ELIGIBILITY INDICATOR ────────────────────────────────
  // (Quick rough estimate — always labelled as indicative)
  const eligCalc = document.getElementById('eligibilityCalc');
  if (eligCalc) {
    const incomeInp    = eligCalc.querySelector('#eligIncome');
    const existingInp  = eligCalc.querySelector('#eligExistingEmi');
    const result       = eligCalc.querySelector('#eligResult');

    function calcEligibility() {
      const income   = parseFloat(incomeInp.value) || 0;
      const existing = parseFloat(existingInp.value) || 0;
      // FOIR approx 50-55% of net income
      const maxEmi   = income * 0.50 - existing;
      if (maxEmi <= 0) {
        result.textContent = 'Your existing obligations may exceed typical FOIR limits.';
        return;
      }
      // rough reverse EMI calc at 12% for 48 months
      const r = 12 / 12 / 100;
      const n = 48;
      const loanAmt = maxEmi * (Math.pow(1+r,n) - 1) / (r * Math.pow(1+r,n));
      result.innerHTML = `Indicative eligibility estimate: <strong>${formatINR(loanAmt)}</strong><br>
        <span style="font-size:0.75rem;color:#8492A6">This is an indicative estimate only. Final eligibility is determined by the respective lender based on its policies and credit assessment.</span>`;
    }

    [incomeInp, existingInp].forEach(el => {
      if (el) el.addEventListener('input', calcEligibility);
    });
  }

});
