/* =======================================================
   ESCROW PIGGY BANK & AUTOMATED MONTHLY DISBURSEMENTS
   ======================================================= */

function getDynamicPricing() {
  const proCount = state.proCustomerCount || 0;
  const tier5k = Math.floor(proCount / APP_CONFIG.PRO_PRICE_BUMP_INTERVAL);
  const multiplier = 1 + (tier5k * APP_CONFIG.PRO_PRICE_BUMP_RATE);

  const priceOnce = Math.round(APP_CONFIG.BASE_PRICE_ONCE * multiplier);
  const priceAnnualMonthly = Math.round(APP_CONFIG.BASE_PRICE_MONTHLY_ANNUAL * multiplier);
  const priceMonthly = Math.round(priceAnnualMonthly / 12);

  return { proCount, tier5k, multiplier, priceOnce, priceAnnualMonthly, priceMonthly };
}

function getDynamicLockPercentage() {
  const proCount = state.proCustomerCount || 0;
  const thousands = Math.floor(proCount / APP_CONFIG.PRO_LOCK_INTERVAL);
  const computed = APP_CONFIG.BASE_LOCK_PCT + (thousands * APP_CONFIG.PRO_LOCK_GROWTH);
  return Math.min(computed, APP_CONFIG.MAX_LOCK_PCT);
}

function updatePaywallLockDisplay() {
  const pricing = getDynamicPricing();
  const lockPct = getDynamicLockPercentage();

  const badge = document.getElementById('current-lock-badge');
  const lockText = document.getElementById('lock-pct-text');
  const lockBar = document.getElementById('lock-progress-bar');
  const trackedEl = document.getElementById('pro-tracked-users');
  const bumpEl = document.getElementById('pro-next-bump');

  if (badge) badge.innerText = `${lockPct}% Locked`;
  if (lockText) lockText.innerText = `${lockPct}% / ${APP_CONFIG.MAX_LOCK_PCT}% Max Lock`;
  if (lockBar) lockBar.style.width = `${lockPct}%`;

  if (trackedEl) trackedEl.innerText = `${pricing.proCount.toLocaleString()} Subscribers`;
  const nextBumpPro = (pricing.tier5k + 1) * APP_CONFIG.PRO_PRICE_BUMP_INTERVAL;
  if (bumpEl) bumpEl.innerText = `at ${nextBumpPro.toLocaleString()} Pro Users`;

  const tierOnceEl = document.getElementById('tier-price-once');
  const tierMoEl = document.getElementById('tier-price-monthly');
  const tierAnnualMoEl = document.getElementById('tier-price-annual-monthly');

  if (tierOnceEl) tierOnceEl.innerText = pricing.priceOnce;
  if (tierMoEl) tierMoEl.innerText = pricing.priceMonthly;
  if (tierAnnualMoEl) tierAnnualMoEl.innerText = pricing.priceAnnualMonthly;

  const selectedPlan = document.querySelector('input[name="pro-plan-type"]:checked')?.value || 'once';
  updateVaultPaymentAmount(selectedPlan);

  // Expose private UPI destination inside Founder Desk only
  const fndUpiTarget = document.getElementById('founder-vault-private-upi');
  if (fndUpiTarget && state.isFounderUser) {
    fndUpiTarget.innerText = APP_CONFIG.PRIVATE_VAULT_UPI_ID;
  }
}

function updateVaultPaymentAmount(planType) {
  const pricing = getDynamicPricing();
  const amt = planType === 'once' ? pricing.priceOnce : pricing.priceMonthly;
  const amtEl = document.getElementById('pay-btn-amt');
  if (amtEl) amtEl.innerText = amt;

  const btn = document.getElementById('vault-pay-btn');
  if (btn) {
    btn.href = `upi://pay?pa=${encodeURIComponent(APP_CONFIG.PRIVATE_VAULT_UPI_ID)}&pn=${encodeURIComponent(APP_CONFIG.FOUNDER_NAME)}&am=${amt}&cu=INR`;
  }
}

function simulateCustomerPaymentSuccess() {
  alert('Transaction verified. Routed to Zenith Escrow.');
  state.user.isPro = true;
  saveState();
}

function updateFounderProUsersCount() {
  const input = document.getElementById('fnd-pro-users-input');
  state.proCustomerCount = parseInt(input.value) || 0;
  saveState();
  alert('Pro subscriber scale updated. Pricing and paywall updated.');
}