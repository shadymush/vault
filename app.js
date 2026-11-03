import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAdditionalUserInfo,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

const app = document.querySelector("#app");
app.classList.add("app-shell");
const storageKey = "vault-profile";
const stateKey = "vault-state";
const firebaseApp = initializeApp({
  apiKey: "AIzaSyA6VTdjXIqFU8sSummIqDm1OyVQj3fIvOE",
  authDomain: "vault-app-e609b.firebaseapp.com",
  projectId: "vault-app-e609b",
  storageBucket: "vault-app-e609b.firebasestorage.app",
  messagingSenderId: "1304669945",
  appId: "1:1304669945:web:35d7d8aeb9744e43673c28",
});
const auth = getAuth(firebaseApp);
let currentUser = null;
let authInitialized = false;
let authActionInProgress = false;

const icons = {
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13 2-3 9h8L9 22l3-9H4l9-11Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15.7 15.7 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.7 10.7 0 0 0 5.1-1.3"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 15h.01"/><path d="M6 5V3h12"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(.96)"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 14 5-5 5 5"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>',
};

function brand() {
  return `<a class="brand" href="#/" aria-label="Vault home"><span class="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path class="brand-v" d="M9 8 19 32 29 8"/><path class="brand-bolt" d="m22 13-7 11h6l-2 7 8-12h-6l1-6Z"/></svg></span><span>VAULT</span></a>`;
}

function themeToggle() {
  return `<button class="theme-toggle" type="button" data-action="theme-toggle" aria-label="Switch to light mode" title="Switch to light mode">${icons.sun}</button>`;
}

function applyTheme(theme) {
  const light = theme === "light";
  document.documentElement.dataset.theme = light ? "light" : "dark";
  document.querySelectorAll("[data-action='theme-toggle']").forEach((button) => {
    const label = light ? "Switch to dark mode" : "Switch to light mode";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = light ? icons.moon : icons.sun;
  });
}

function footer() {
  return '<footer class="site-footer">© 2026 Vault Assets Corp. Financial freedom within reach.</footer>';
}

function renderLanding() {
  app.innerHTML = `
    <header class="site-header">
      ${brand()}
      <nav class="header-actions" aria-label="Main navigation">
        ${themeToggle()}
        <a class="header-link" href="#/login">Sign In</a>
        <a class="header-cta" href="#/register">Get Started</a>
      </nav>
    </header>
    <main>
      <section class="hero">
        <div class="hero-content">
          <div class="eyebrow">${icons.bolt}<span>Tiered financial excellence</span></div>
          <h1>SECURE YOUR<span>LEGACY.</span></h1>
          <p class="hero-copy">The next generation of asset management. Tiered access to premium saving profiles, automated standing orders, and exclusive gold-tier money market funds.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#/register">Open Your Vault ${icons.arrow}</a>
            <a class="button button-secondary" href="#/login">Access Dashboard</a>
          </div>
        </div>
      </section>
      <section class="plans-section" aria-labelledby="plans-heading">
        <div class="section-heading">
          <div class="eyebrow">${icons.target}<span>Made for your next chapter</span></div>
          <h2 id="plans-heading">A plan for every ambition.</h2>
          <p>Start where you are. Grow at your own pace.</p>
        </div>
        <div class="plan-grid">
          <article class="plan-card">
            <div class="plan-icon">${icons.wallet}</div>
            <h3>Basic</h3>
            <ul><li>${icons.check}Secure deposits</li><li>${icons.check}Global withdrawals</li><li>${icons.check}Flexible saving profiles</li></ul>
          </article>
          <article class="plan-card featured">
            <span class="plan-tag">Most popular</span>
            <div class="plan-icon">${icons.target}</div>
            <h3>Premium</h3>
            <ul><li>${icons.check}Custom saving profiles</li><li>${icons.check}Target-based goals</li><li>${icons.check}Automated standing orders</li></ul>
          </article>
          <article class="plan-card">
            <span class="plan-tag">Vault Prime access</span>
            <div class="plan-icon">${icons.chart}</div>
            <h3>Gold</h3>
            <ul><li>${icons.check}Everything in Premium</li><li>${icons.check}High-yield money market</li><li>${icons.check}Priority support</li></ul>
          </article>
        </div>
      </section>
    </main>
    ${footer()}`;
}

function renderAuth(mode) {
  const registering = mode === "register";
  app.innerHTML = `
    <main class="auth-shell">
      <a class="auth-back" href="#/">← Back to Vault</a>
      ${themeToggle()}
      <section class="auth-card" aria-labelledby="auth-title">
        <div class="auth-brand">${brand()}</div>
        <h1 class="auth-title" id="auth-title">${registering ? "Create Vault Account" : "Welcome Back"}</h1>
        <p class="auth-subtitle">${registering ? "Secure your future with Vault." : "Access your Vault dashboard."}</p>
        <form class="auth-form" id="auth-form" novalidate>
          ${registering ? `
            <div class="field"><label for="full-name">Full Name</label><input id="full-name" name="name" autocomplete="name" required /></div>
            <div class="field-row">
              <div class="field"><label for="id-number">ID Number</label><input id="id-number" name="idNumber" inputmode="numeric" autocomplete="off" required /></div>
              <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" placeholder="+254..." autocomplete="tel" required /></div>
            </div>
            <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required /></div>
          ` : `
              <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" required /></div>
          `}
          <div class="field">
            <label for="password">Password</label>
            <div class="password-wrap">
              <input id="password" name="password" type="password" autocomplete="${registering ? "new-password" : "current-password"}" minlength="8" required />
              <button class="password-toggle" type="button" aria-label="Show password" aria-pressed="false">${icons.eye}</button>
            </div>
            ${registering ? '<p class="field-hint">At least 8 characters (12+ recommended). Use uppercase, lowercase, and numbers or symbols.</p>' : ""}
          </div>
          ${registering ? `
            <div class="field"><label for="plan">Select Plan</label><div class="select-wrap"><select id="plan" name="plan"><option>Basic</option><option>Premium</option><option>Gold</option></select></div></div>
          ` : ""}
          <p class="form-message" role="alert"></p>
          <button class="button button-primary auth-submit" type="submit">${registering ? "Continue to Vault" : "Sign In"}</button>
        </form>
        <div class="auth-divider"><span>or continue with</span></div>
        <button class="button button-secondary google-signin" type="button" data-action="google-signin">
          <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.93c-.58 2.96-2.27 5.48-4.75 7.18l7.73 6C44.42 37.85 46.98 31.7 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.54 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>
          Continue with Google
        </button>
        <p class="auth-switch">${registering ? 'Already have an account? <a class="text-link" href="#/login">Login</a>' : 'Don’t have an account? <a class="text-link" href="#/register">Register</a>'}</p>
        <p class="account-note">Sign-in is securely managed by Firebase. Your plan and dashboard data are currently stored in this browser.</p>
      </section>
    </main>`;

  const form = document.querySelector("#auth-form");
  const message = form.querySelector(".form-message");
  const googleButton = app.querySelector("[data-action='google-signin']");
  const password = document.querySelector("#password");
  const toggle = document.querySelector(".password-toggle");
  toggle.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    toggle.setAttribute("aria-pressed", String(show));
    toggle.innerHTML = show ? icons.eyeOff : icons.eye;
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("[type='submit']");
    message.classList.remove("visible");
    if (!form.reportValidity()) return;
    submit.disabled = true;
    let firebaseAuthSucceeded = false;
    try {
      const data = new FormData(form);
      const email = String(data.get("email")).trim().toLowerCase();
      const password = String(data.get("password"));
      await setPersistence(auth, browserLocalPersistence);
      authActionInProgress = true;
      if (registering) {
        const name = String(data.get("name")).trim();
        if (name.length < 2) {
          showFormError(message, "Please enter your full name.");
          return;
        }
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        currentUser = credential.user;
        firebaseAuthSucceeded = true;
        await updateProfile(credential.user, { displayName: name });
        ensureUserProfile(credential.user);
        saveProfile({
          name,
          email,
          plan: String(data.get("plan")),
          phone: String(data.get("phone")).trim(),
        }, credential.user);
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = credential.user;
        firebaseAuthSucceeded = true;
        ensureUserProfile(credential.user);
      }
      window.location.hash = "/dashboard";
    } catch (error) {
      console.error("Firebase authentication failed", error);
      if (firebaseAuthSucceeded && currentUser) {
        try {
          ensureUserProfile(currentUser);
        } catch (profileError) {
          console.error("Could not save the signed-in account profile", profileError);
        }
        window.location.hash = "/dashboard";
        notify("You’re signed in, but some profile details could not be saved in this browser.");
      } else {
        showFormError(message, firebaseAuthErrorMessage(error, registering ? "Account creation" : "Sign in"));
      }
    } finally {
      authActionInProgress = false;
      submit.disabled = false;
    }
  });
  googleButton.addEventListener("click", async () => {
    message.classList.remove("visible");
    googleButton.disabled = true;
    let firebaseAuthSucceeded = false;
    try {
      await setPersistence(auth, browserLocalPersistence);
      authActionInProgress = true;
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      currentUser = result.user;
      firebaseAuthSucceeded = true;
      const additionalInfo = getAdditionalUserInfo(result);
      if (additionalInfo?.isNewUser) {
        saveProfile({
          name: result.user.displayName || result.user.email?.split("@")[0] || "Vault Member",
          email: result.user.email || "",
          phone: result.user.phoneNumber || "",
          plan: registering ? String(new FormData(form).get("plan") || "Basic") : "Basic",
        }, result.user);
      } else {
        ensureUserProfile(result.user);
      }
      window.location.hash = "/dashboard";
    } catch (error) {
      console.error("Firebase Google sign-in failed", error);
      if (firebaseAuthSucceeded && currentUser) {
        try {
          ensureUserProfile(currentUser);
        } catch (profileError) {
          console.error("Could not save the Google account profile", profileError);
        }
        window.location.hash = "/dashboard";
        notify("You’re signed in, but some profile details could not be saved in this browser.");
      } else {
        showFormError(message, firebaseAuthErrorMessage(error, "Google sign in"));
      }
    } finally {
      authActionInProgress = false;
      googleButton.disabled = false;
    }
  });
}

function showFormError(message, text) {
  message.textContent = text;
  message.classList.add("visible");
}

function profileStorageKey(user) {
  return `${storageKey}:${user.uid}`;
}

function getProfile(user = currentUser) {
  if (!user) return null;
  try {
    const value = localStorage.getItem(profileStorageKey(user));
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Could not read the saved account profile", error);
    return null;
  }
}

function saveProfile(profile, user = currentUser) {
  if (!user) throw new Error("A signed-in Firebase user is required to save the profile.");
  localStorage.setItem(profileStorageKey(user), JSON.stringify({ ...profile, uid: user.uid }));
}

function ensureUserProfile(user) {
  const existing = getProfile(user);
  if (existing) return existing;

  let legacy = null;
  try {
    const value = localStorage.getItem(storageKey);
    legacy = value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Could not read a legacy browser profile", error);
  }
  const isMatchingLegacyProfile = typeof legacy?.email === "string"
    && legacy.email.trim().toLowerCase() === user.email?.toLowerCase();
  const profile = {
    name: isMatchingLegacyProfile ? legacy.name : user.displayName || user.email?.split("@")[0] || "Vault Member",
    email: user.email || "",
    phone: isMatchingLegacyProfile ? legacy.phone || "" : user.phoneNumber || "",
    plan: isMatchingLegacyProfile && ["Basic", "Premium", "Gold"].includes(legacy.plan) ? legacy.plan : "Basic",
  };
  saveProfile(profile, user);
  if (isMatchingLegacyProfile) localStorage.removeItem(storageKey);
  return profile;
}

function firebaseAuthErrorMessage(error, action) {
  const messages = {
    "auth/email-already-in-use": "An account already exists for this email. Sign in instead.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "auth/weak-password": "Choose a stronger password with at least 8 characters.",
    "auth/operation-not-supported-in-this-environment": "Google sign-in requires a supported browser and secure connection.",
    "auth/unauthorized-domain": "This site is not authorized in Firebase. Add its domain in Firebase Authentication settings.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow popups and try again.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/cancelled-popup-request": "Another sign-in window is already open.",
    "auth/account-exists-with-different-credential": "An account already exists for this email with a different sign-in method. Sign in using that method; account linking is not available yet.",
    "auth/too-many-requests": "Too many attempts. Wait a while and try again.",
    "auth/network-request-failed": "Could not reach Firebase. Check your internet connection and try again.",
    "auth/requires-recent-login": "Please sign in again before changing your password.",
  };
  if (error?.code === "auth/operation-not-allowed") {
    return action === "Google sign in"
      ? "Google sign-in is disabled. Enable the Google provider in Firebase Authentication settings."
      : "Email/password sign-in is disabled. Enable it in Firebase Authentication settings.";
  }
  return messages[error?.code] || `${action} failed. Please try again.`;
}

function getAccountPlan() {
  return getProfile()?.plan || "Basic";
}

function hasPlanAccess(requiredPlan) {
  const tiers = { Basic: 0, Premium: 1, Gold: 2 };
  return (tiers[getAccountPlan()] ?? 0) >= (tiers[requiredPlan] ?? 0);
}

const funds = [
  { name: "Cytonn MMF", minimum: 100, apy: "14.8%", color: "gold", description: "Consistently high-yielding fund with a focus on short-term debt.", risk: "Medium" },
  { name: "Sanlam MMF", minimum: 2500, apy: "11.5%", color: "green", description: "A balanced money market fund focused on steady income and capital preservation.", risk: "Low" },
  { name: "CIC Money Market", minimum: 5000, apy: "11.2%", color: "blue", description: "A diversified money market fund for long-term saving and liquidity.", risk: "Low" },
  { name: "ICEA Lion MMF", minimum: 500, apy: "10.8%", color: "purple", description: "A flexible money market fund designed for accessible savings.", risk: "Low" },
];

const markets = {
  Forex: [
    ["EUR", "Euro / US Dollar", "EURUSD", "1.0945", "—", "−0.12%"],
    ["GBP", "British Pound / US Dollar", "GBPUSD", "1.2650", "—", "+0.35%"],
    ["USD", "US Dollar / Japan Yen", "USDJPY", "151.2000", "—", "+0.45%"],
    ["AUD", "Australian Dollar / US Dollar", "AUDUSD", "0.6520", "—", "−0.65%"],
  ],
  Stocks: [
    ["AAP", "Apple Inc.", "AAPL", "$173.50", "$2.68T", "+1.24%"],
    ["MSF", "Microsoft", "MSFT", "$425.20", "$3.12T", "+0.80%"],
    ["NVD", "NVIDIA", "NVDA", "$890.50", "$2.20T", "+3.45%"],
    ["AMZ", "Amazon", "AMZN", "$185.30", "$1.95T", "−0.12%"],
  ],
  Crypto: [
    ["BTC", "Bitcoin", "btc", "$77,338.00", "$1.55T", "−4.79%"],
    ["ETH", "Ethereum", "eth", "$2,243.29", "$274.07B", "−4.41%"],
    ["USD", "Tether", "usdt", "$1.00", "$180.34B", "−0.02%"],
    ["BNB", "BNB", "bnb", "$701.17", "$92.17B", "−6.28%"],
    ["XRP", "XRP", "xrp", "$1.25", "$79.03B", "−4.21%"],
    ["USD", "USDC", "usdc", "$1.00", "$71.53B", "+0.01%"],
    ["SOL", "Solana", "sol", "$94.83", "$55.94B", "−6.82%"],
    ["TRX", "TRON", "trx", "$0.34", "$31.94B", "+1.48%"],
    ["FIG", "Figure Heloc", "figr_heloc", "$1.03", "$26.60B", "−0.44%"],
    ["HYP", "Hyperliquid", "hype", "$92.73", "$22.20B", "+1.29%"],
  ],
  Minerals: [
    ["XAU", "Gold", "XAUUSD", "$2,365.10", "—", "+0.85%"],
    ["XAG", "Silver", "XAGUSD", "$28.50", "—", "+1.25%"],
    ["XPT", "Platinum", "XPTUSD", "$945.20", "—", "−0.45%"],
    ["XPD", "Palladium", "XPDUSD", "$1,025.80", "—", "+2.15%"],
  ],
  "Government bonds": [
    ["US1", "US 10 Year Treas.", "US10Y", "4.320%", "—", "+1.25 bps"],
    ["US0", "US 2 Year Treas.", "US02Y", "4.750%", "—", "−0.40 bps"],
    ["DE1", "Germany 10 Year", "DE10Y", "2.450%", "—", "+0.85 bps"],
    ["JP1", "Japan 10 Year", "JP10Y", "0.750%", "—", "+4.10 bps"],
  ],
};

function getVaultState() {
  try {
    const saved = JSON.parse(localStorage.getItem(stateStorageKey()) || "{}");
    return {
      balance: Number(saved.balance) || 0,
      goals: Array.isArray(saved.goals) ? saved.goals : [],
      transactions: Array.isArray(saved.transactions) ? saved.transactions : [],
      streak: Number(saved.streak) || 0,
      sprintDate: saved.sprintDate || "",
      investments: Array.isArray(saved.investments) ? saved.investments : [],
      watchlist: Array.isArray(saved.watchlist) ? saved.watchlist : [],
      standingOrders: Array.isArray(saved.standingOrders) ? saved.standingOrders : [],
    };
  } catch {
    return { balance: 0, goals: [], transactions: [], streak: 0, sprintDate: "", investments: [], watchlist: [], standingOrders: [] };
  }
}

function saveVaultState(state) {
  try {
    localStorage.setItem(stateStorageKey(), JSON.stringify(state));
    return true;
  } catch {
    notify("Your browser couldn't save this change. Check local storage settings.");
    return false;
  }
}

function stateStorageKey(user = currentUser) {
  return user ? `${stateKey}:${user.uid}` : stateKey;
}

function money(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
}

function dashboardLayout(route, title, content) {
  const navItems = [
    ["dashboard", "Overview", icons.grid],
    ["dashboard/savings", "Hazina", icons.wallet],
    ["dashboard/investments", "Investments", icons.chart],
    ["dashboard/standing-orders", "Standing Orders", icons.clock],
    ["dashboard/transactions", "Transactions", icons.send],
    ["dashboard/settings", "Settings", icons.settings],
  ];
  const profile = getProfile();
  const plan = profile?.plan || "Basic";
  document.documentElement.dataset.plan = plan.toLowerCase();
  const planDescription = plan === "Premium"
    ? "Savings and standing orders"
    : plan === "Gold" ? "All features unlocked" : "Savings essentials";
  app.innerHTML = `
    <main class="dashboard">
      <header class="vault-header">
        <div class="vault-header-inner">${brand()}<div class="header-controls">${themeToggle()}<button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false">${icons.menu}</button></div></div>
        <nav class="vault-nav" aria-label="Dashboard navigation" hidden>
          ${navItems.map(([path, label, icon]) => `<a href="#/${path}" ${route === path ? 'aria-current="page"' : ""}>${icon}${label}</a>`).join("")}
          <a href="#/" data-action="logout">${icons.close}Logout</a>
        </nav>
      </header>
      <div class="dashboard-shell">
        <aside class="dashboard-sidebar">
          ${brand()}
          <p class="nav-label">Workspace</p>
          <nav class="side-nav" aria-label="Dashboard">
            ${navItems.map(([path, label, icon]) => {
              const locked = path === "dashboard/investments" && !hasPlanAccess("Gold")
                || path === "dashboard/standing-orders" && !hasPlanAccess("Premium");
              const badge = locked ? `<span class="nav-lock">${path === "dashboard/investments" ? "Gold" : "Premium"}</span>` : "";
              return `<a href="#/${path}" class="${route === path ? "active" : ""} ${locked ? "locked" : ""}" ${route === path ? 'aria-current="page"' : ""}>${icon}${label}${badge}</a>`;
            }).join("")}
          </nav>
          <p class="nav-label">Account</p>
          <div class="side-bottom"><strong>${escapeHtml(plan)} account</strong><p>${escapeHtml(planDescription)}.</p><a href="#/dashboard/settings">Manage account →</a></div>
          <button class="side-logout" type="button" data-action="logout">${icons.close}Logout</button>
        </aside>
        <section class="dashboard-main">
          <header class="dashboard-topbar"><span>Workspace <span aria-hidden="true">/</span> <strong>${escapeHtml(title)}</strong></span><span class="vault-badge">Secure account</span></header>
          <div class="dashboard-page">${content}</div>
        </section>
      </div>
    </main>`;
  const menuToggle = app.querySelector(".menu-toggle");
  const mobileNav = app.querySelector(".vault-nav");
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.setAttribute("aria-label", expanded ? "Open navigation menu" : "Close navigation menu");
    menuToggle.innerHTML = expanded ? icons.menu : icons.close;
    mobileNav.hidden = expanded;
  });
  app.querySelectorAll("[data-action='logout']").forEach((button) => {
    button.addEventListener("click", async (event) => {
      if (button.tagName === "A") event.preventDefault();
      try {
        await signOut(auth);
        currentUser = null;
        window.location.hash = "/login";
        notify("You have signed out of this account.");
      } catch (error) {
        console.error("Firebase sign-out failed", error);
        notify(firebaseAuthErrorMessage(error, "Sign out"));
      }
    });
  });
}

function renderDashboard() {
  const route = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  if (route === "dashboard/savings") return renderSavings();
  if (route === "dashboard/investments") return renderInvestments();
  if (route === "dashboard/standing-orders") return renderStandingOrders();
  if (route === "dashboard/transactions") return renderTransactions();
  if (route === "dashboard/settings") return renderSettings();
  renderOverview();
}

function renderOverview() {
  const state = getVaultState();
  const profile = getProfile();
  const name = profile?.name || "";
  const plan = profile?.plan || "Basic";
  const today = localDateKey();
  const completed = state.sprintDate === today;
  const firstName = name.split(/\s+/)[0];
  const goals = state.goals.slice(0, 3);
  const activeOrders = (state.standingOrders || []).filter((order) => order.active);
  const content = `
    <div class="workspace-heading">
      <div><p class="workspace-label">Workspace</p><h1>Welcome back,${firstName ? ` ${escapeHtml(firstName)}` : ""}</h1></div>
      <div class="account-tier"><span aria-hidden="true"></span>${escapeHtml(plan)} account</div>
    </div>
    <div class="account-overview">
      <section class="balance-card" aria-label="Live balance">
        <div class="balance-top"><div><p class="balance-label">Live Balance</p><h2 class="balance-value"><span>KSh</span> ${state.balance.toLocaleString("en-KE")}</h2></div><div class="balance-emblem">${icons.wallet}</div></div>
        <div class="balance-bottom"><div class="security-level"><p>Security Level</p><strong>${plan === "Premium" ? "Enhanced" : `Ultimate ${escapeHtml(plan)}`}</strong><span>${escapeHtml(plan.toLowerCase())}</span></div>
          <div class="balance-actions"><button class="button button-primary" data-action="deposit">${icons.download}Deposit Funds</button><button class="button button-secondary" data-action="withdraw">${icons.arrow}Withdraw</button></div>
        </div>
      </section>
      <section class="goal-summary"><p>Active Goals</p><h2>${state.goals.length} Profiles</h2><button type="button" class="create-goal" data-action="create-goal">${icons.plus}Create New</button></section>
    </div>
    <div class="overview-grid">
      <section class="marathon-card">
        <div class="section-title-row"><div class="section-icon">${icons.bolt}</div><div><h2>Savings Marathon</h2><p>Automated Growth Engine</p></div></div>
        <div class="sprint-panel"><div class="sprint-heading"><p>${icons.target}Daily Sprint</p><span>Streak: ${state.streak} Days</span></div>
          <div class="sprint-detail"><p>${completed ? "Great work. Your daily sprint is complete." : "Save KSh 1,000 today to maintain your streak."}</p><span class="countdown">${icons.clock}<span id="sprint-countdown"></span></span></div>
          <div class="sprint-progress-label"><span>Today’s progress</span><span>${completed ? "100%" : "0%"}</span></div><div class="sprint-track"><span style="width:${completed ? "100%" : "0%"}"></span></div>
          <button type="button" class="button complete-sprint" data-action="complete-sprint" ${completed ? "disabled" : ""}>${icons.check}${completed ? "Completed today" : "Complete Daily"}</button>
        </div>
      </section>
      <section class="overview-goals panel"><div class="panel-heading"><h2>Your Targets</h2><a href="#/dashboard/savings">View all →</a></div>
        ${goals.length ? goals.map((goal) => `<div class="goal-item"><div class="goal-head"><span>${escapeHtml(goal.name)}</span><span>${money(goal.saved)} / ${money(goal.target)}</span></div><div class="goal-track"><div class="goal-progress" style="width:${Math.min(100, goal.target ? (goal.saved / goal.target) * 100 : 0)}%"></div></div></div>`).join("") : '<p class="empty-inline">Create a savings goal and start making progress.</p>'}
      </section>
    </div>
    ${hasPlanAccess("Premium") ? `<section class="standing-preview">
      <div><span class="preview-icon">${icons.clock}</span><div><p>Premium feature</p><h2>Standing Orders</h2><span>${activeOrders.length} active schedule${activeOrders.length === 1 ? "" : "s"} · automate your saving routine</span></div></div>
      <a class="button button-secondary" href="#/dashboard/standing-orders">Manage schedules ${icons.arrow}</a>
    </section>` : ""}
    ${hasPlanAccess("Gold") ? `<section class="funds-section">
      <div class="section-title-row funds-title"><div class="section-icon">${icons.chart}</div><div><h2>Vault Prime Funds</h2><p>Institutional-Grade Yields</p></div><a class="section-link" href="#/dashboard/investments">Explore markets →</a></div>
      <div class="funds-layout"><article class="selected-fund"><div class="selected-fund-heading"><div><p class="active-selection">Active Selection</p><h3 id="selected-fund-name"></h3></div><span class="fund-shield">${icons.shield}</span></div><p class="fund-description" id="selected-fund-description"></p>
        <div class="fund-metrics"><div><p>Projected APY</p><strong id="selected-fund-apy"></strong></div><div><p>Risk Profile</p><strong id="selected-fund-risk"></strong></div></div>
        <button type="button" class="button invest-button" data-action="invest">${icons.chart}Invest Now ${icons.arrow}</button>
      </article><div class="market-list"><h3>Available Markets</h3><div id="fund-options"></div></div></div>
    </section>` : `<section class="tier-locked-card">
      <span class="locked-emblem">${icons.shield}</span><div><p>Gold Exclusive</p><h2>Investments are waiting in Gold</h2><span>Explore Vault Prime funds and global markets when you upgrade.</span></div>
      <button class="button button-primary" type="button" data-action="manage-plan" data-plan="Gold">Explore Gold ${icons.arrow}</button>
    </section>`}`;
  dashboardLayout("dashboard", "Overview", content);
  if (hasPlanAccess("Gold")) bindFundPicker();
  bindDashboardActions();
  startCountdown();
}

function renderSavings() {
  const state = getVaultState();
  const goalTotal = state.goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0);
  const savedTotal = state.goals.reduce((sum, goal) => sum + Number(goal.saved || 0), 0);
  const progress = goalTotal ? Math.min(100, Math.round((savedTotal / goalTotal) * 100)) : 0;
  const sprintComplete = state.sprintDate === localDateKey();
  const content = `
    <div class="workspace-heading"><div><p class="workspace-label">Finance / Savings</p><h1>Hazina</h1><p class="page-subtitle">A smarter way to build your savings.</p></div><div class="account-tier"><span></span>${state.goals.length} active goals</div></div>
    <div class="savings-summary-grid">
      <section class="balance-card savings-balance"><div class="balance-top"><div><p class="balance-label">Total Savings Balance</p><h2 class="balance-value"><span>KSh</span> ${state.balance.toLocaleString("en-KE")}</h2></div><div class="balance-emblem">${icons.wallet}</div></div>
        <div class="savings-card-footer"><span class="positive-change">${icons.up} +12.5% <small>vs last month</small></span><div class="balance-actions"><button class="button button-primary" data-action="deposit">${icons.download}Deposit</button><button class="button button-secondary" data-action="withdraw">Withdraw</button></div></div>
      </section>
      <section class="portfolio-card"><div><p>Portfolio Progress</p><strong>${progress}%</strong><span>Done</span></div><div class="portfolio-track"><span style="width:${progress}%"></span></div><div class="global-target"><span>Global Target</span><strong>${money(goalTotal)}</strong></div></section>
    </div>
    <button class="intelligence-card" type="button" data-action="intelligence">${icons.sparkle}<span><small>Vault Intelligence</small><strong>Maximize your growth</strong><span>System suggests moving ${money(5000)} to "Emergency Fund" for better yield.</span></span>${icons.chevron}</button>
    <div class="section-heading-row"><h2>Your Targets <span>${state.goals.length} ACTIVE</span></h2><button class="button button-primary" data-action="create-goal">${icons.plus}Create New</button></div>
    ${state.goals.length ? `<div class="goal-list">${state.goals.map((goal, index) => `<article class="goal-list-card"><div class="goal-list-heading"><div class="goal-art">${goal.photo ? `<img src="${escapeHtml(goal.photo)}" alt="" />` : icons.target}</div><div><h3>${escapeHtml(goal.name)}</h3><p>${money(goal.saved)} saved of ${money(goal.target)}</p></div><button class="icon-button" data-action="goal-options" data-goal="${index}" aria-label="Goal options">${icons.chevron}</button></div><div class="goal-track"><div class="goal-progress" style="width:${Math.min(100, goal.target ? (goal.saved / goal.target) * 100 : 0)}%"></div></div><button class="goal-contribute" data-action="contribute" data-goal="${index}">${icons.plus} Add savings</button></article>`).join("")}</div>` : `<div class="empty-state">${icons.target}<h3>Ready to start?</h3><p>Create your first highly intelligent saving goal today.</p><button class="button button-primary" data-action="create-goal">${icons.plus}Create a saving goal</button></div>`}
    <section class="marathon-card savings-marathon"><div class="section-title-row"><div class="section-icon">${icons.bolt}</div><div><h2>Savings Marathon</h2><p>Automated Growth Engine</p></div></div><div class="sprint-panel"><div class="sprint-heading"><p>${icons.target}Daily Sprint</p><span>Streak: ${state.streak} Days</span></div><div class="sprint-detail"><p>Save KSh 1,000 today to maintain your streak.</p><span class="countdown">${icons.clock}<span id="sprint-countdown"></span></span></div><div class="sprint-progress-label"><span>Today’s progress</span><span>${sprintComplete ? "100%" : "0%"}</span></div><div class="sprint-track"><span style="width:${sprintComplete ? "100%" : "0%"}"></span></div><button class="button complete-sprint" data-action="complete-sprint" ${sprintComplete ? "disabled" : ""}>${icons.check}${sprintComplete ? "Completed today" : "Complete Daily"}</button></div></section>`;
  dashboardLayout("dashboard/savings", "Savings", content);
  bindDashboardActions();
  startCountdown();
}

function renderStandingOrders() {
  const state = getVaultState();
  if (!hasPlanAccess("Premium")) {
    const content = `<div class="workspace-heading"><div><p class="workspace-label">Premium feature</p><h1>Standing Orders</h1><p class="page-subtitle">Put your savings on a schedule.</p></div></div>
      <section class="tier-locked-card"><span class="locked-emblem">${icons.clock}</span><div><p>Premium feature</p><h2>Make saving automatic</h2><span>Upgrade to Premium to create and manage standing orders.</span></div><button class="button button-primary" data-action="manage-plan" data-plan="Premium">Explore Premium ${icons.arrow}</button></section>`;
    dashboardLayout("dashboard/standing-orders", "Standing Orders", content);
    bindDashboardActions();
    return;
  }
  const orders = state.standingOrders || [];
  const activeOrders = orders.filter((order) => order.active);
  const monthlyTotal = activeOrders.reduce((total, order) => total + Number(order.amount || 0) * (order.frequency === "weekly" ? 52 / 12 : 1), 0);
  const content = `
    <div class="workspace-heading"><div><p class="workspace-label">Premium / Automation</p><h1>Standing Orders</h1><p class="page-subtitle">Build a consistent savings habit with recurring schedules.</p></div><button class="button button-primary" data-action="create-standing-order">${icons.plus}Create schedule</button></div>
    <div class="standing-stats">
      <article><span class="standing-stat-icon">${icons.clock}</span><p>Active schedules</p><strong>${activeOrders.length}</strong><small>of ${orders.length} total</small></article>
      <article><span class="standing-stat-icon">${icons.wallet}</span><p>Planned monthly saving</p><strong>${money(monthlyTotal)}</strong><small>estimated from active schedules</small></article>
      <article><span class="standing-stat-icon">${icons.target}</span><p>Destinations</p><strong>${new Set(activeOrders.map((order) => order.destination)).size}</strong><small>wallets and savings goals</small></article>
    </div>
    <div class="standing-list-heading"><div><h2>Your schedules</h2><p>Pause or remove a schedule whenever you need.</p></div>${orders.length ? `<span>${orders.length} schedule${orders.length === 1 ? "" : "s"}</span>` : ""}</div>
    ${orders.length ? `<div class="standing-order-list">${orders.map((order) => {
      const destination = order.destination === "wallet"
        ? "General wallet"
        : state.goals.find((goal, index) => standingOrderGoalKey(goal, index) === order.destination)?.name || "Removed savings goal";
      const nextDate = getNextStandingOrderDate(order);
      return `<article class="standing-order-card ${order.active ? "" : "paused"}">
        <div class="standing-order-mark">${icons.send}</div>
        <div class="standing-order-info"><div class="standing-order-title"><h3>${escapeHtml(order.name)}</h3><span class="order-status ${order.active ? "active" : "paused"}">${order.active ? "Active" : "Paused"}</span></div>
          <p>${order.frequency === "weekly" ? "Weekly" : "Monthly"} · ${escapeHtml(destination)}</p><small>${order.active ? `Next schedule ${nextDate ? nextDate.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "not set"}` : "Paused until you resume it"}</small></div>
        <strong class="standing-order-amount">${money(order.amount)}<small>per ${order.frequency === "weekly" ? "week" : "month"}</small></strong>
        <div class="standing-order-actions"><button class="button button-secondary" type="button" data-order-toggle="${escapeHtml(order.id)}">${order.active ? "Pause" : "Resume"}</button><button class="icon-button" type="button" aria-label="Delete ${escapeHtml(order.name)}" data-order-delete="${escapeHtml(order.id)}">${icons.close}</button></div>
      </article>`;
    }).join("")}</div>` : `<div class="empty-state standing-empty">${icons.clock}<h3>Start with a schedule</h3><p>Create a recurring savings reminder for your wallet or one of your goals.</p><button class="button button-primary" data-action="create-standing-order">${icons.plus}Create standing order</button></div>`}
    <p class="standing-disclaimer">${icons.shield}Schedules are stored in this browser for this demo. They do not move or charge real money automatically.</p>`;
  dashboardLayout("dashboard/standing-orders", "Standing Orders", content);
  bindDashboardActions();
}

function getNextStandingOrderDate(order) {
  const next = new Date(`${order.startDate}T00:00:00`);
  if (Number.isNaN(next.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  while (next < today) {
    if (order.frequency === "weekly") {
      next.setDate(next.getDate() + 7);
    } else {
      const day = next.getDate();
      next.setDate(1);
      next.setMonth(next.getMonth() + 1);
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(day, lastDay));
    }
  }
  return next;
}

function standingOrderGoalKey(goal, index) {
  return `goal-${goal.id || goal.createdAt || `legacy-${index}`}`;
}

function renderInvestments() {
  if (!hasPlanAccess("Gold")) {
    const content = `<div class="workspace-heading"><div><p class="workspace-label">Gold / Investments</p><h1>Explore markets</h1><p class="page-subtitle">Markets and Vault Prime funds are available with Gold.</p></div></div>
      <section class="tier-locked-card"><span class="locked-emblem">${icons.chart}</span><div><p>Gold Exclusive</p><h2>Unlock Vault Prime</h2><span>Upgrade to Gold to access money market funds and global market tools.</span></div><button class="button button-primary" data-action="manage-plan" data-plan="Gold">Explore Gold ${icons.arrow}</button></section>`;
    dashboardLayout("dashboard/investments", "Investments", content);
    bindDashboardActions();
    return;
  }
  const state = getVaultState();
  const popular = [
    ["AA", "Apple Inc.", "Stock", "$173.5", "+1.24%", "Stocks", "AAPL"],
    ["BT", "Bitcoin", "Crypto", "$112638.3", "+0.5%", "Crypto", "btc"],
    ["EU", "EUR/USD", "Forex", "$1.0945", "−0.12%", "Forex", "EURUSD"],
    ["XA", "Gold", "Metal", "$2345.6", "+0.85%", "Minerals", "XAUUSD"],
    ["US", "Crude Oil", "Oil", "$82.3", "−1.5%", "Minerals", "CL"],
  ];
  const content = `
    <div class="workspace-heading"><div><p class="workspace-label">Workspace</p><h1>Investments</h1><p class="page-subtitle">Explore markets and follow assets from one place.</p></div></div>
    <section class="popular-card"><div class="popular-heading"><h2>Popular <span>›</span></h2><div><button class="icon-button" aria-label="Market pulse" data-toast="Market data is a static snapshot.">${icons.chart}</button><button class="icon-button" data-action="toggle-watchlist" aria-label="Show watchlist" aria-pressed="false">${icons.target}</button></div></div>
      <div class="popular-list" id="popular-list"></div>
    </section>
    <div class="market-stats"><article class="market-stat"><strong>$457.94</strong><span class="negative">↘ 4.69%</span><p>Market sentiment</p></article><article class="market-stat"><strong>$2.74T</strong><span class="positive">↗ 2.1%</span><p>Total Market Cap (Crypto)</p></article><article class="market-stat"><strong>$142.8B</strong><span>24h</span><p>24h Volume</p></article><article class="market-stat"><strong>54.2%</strong><span>BTC</span><p>BTC Dominance</p></article></div>
    <section class="chart-card"><div class="chart-card-heading"><div><p>Market chart</p><h2 id="chart-symbol">OANDA:EURUSD</h2></div><label class="chart-currency">Currency<select id="market-currency"><option>USD</option><option>EUR</option></select></label></div><div class="chart-display"><div class="chart-y-labels"><span>1.12</span><span>1.10</span><span>1.08</span><span>1.06</span></div><svg class="market-chart" viewBox="0 0 900 240" preserveAspectRatio="none" role="img" aria-label="Illustrative market price chart"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f3c400" stop-opacity=".22"/><stop offset="1" stop-color="#f3c400" stop-opacity="0"/></linearGradient></defs><path class="chart-area" d="M0 180 L40 169 78 174 115 147 153 158 192 130 225 145 260 107 299 121 336 110 373 131 412 98 450 112 488 84 526 105 562 71 600 90 640 75 679 91 718 48 755 68 793 41 833 56 870 29 900 38 V240 H0Z"/><path class="chart-line" d="M0 180 L40 169 78 174 115 147 153 158 192 130 225 145 260 107 299 121 336 110 373 131 412 98 450 112 488 84 526 105 562 71 600 90 640 75 679 91 718 48 755 68 793 41 833 56 870 29 900 38"/></svg></div><div class="chart-intervals">${["1D","5D","1M","3M","6M","YTD","1Y","5Y","All"].map((interval, index) => `<button class="${index === 0 ? "active" : ""}" data-interval="${interval}">${interval}</button>`).join("")}</div></section>
    <section class="market-table-section"><div class="market-table-heading"><div><p class="workspace-label">Market overview</p><h2>Explore assets</h2></div><button class="filter-toggle" data-action="toggle-movers">${icons.settings}Filter movers</button></div>
      <div class="market-tabs">${Object.keys(markets).map((category, index) => `<button class="${index === 0 ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div>
      <div class="market-controls"><label class="market-search">${icons.search}<input type="search" id="market-search" placeholder="Search..." aria-label="Search markets"></label><label class="currency-select"><span>Currency</span><select id="table-currency"><option>USD</option><option>EUR</option></select></label></div>
      <div class="market-table-wrap"><table class="market-table"><thead><tr><th>No.</th><th>Asset</th><th>Price</th><th>Market cap</th><th>Change</th><th></th></tr></thead><tbody id="market-rows"></tbody></table></div>
      <p class="market-disclaimer">Market prices and yields are illustrative sample data, not live investment advice.</p>
    </section>`;
  dashboardLayout("dashboard/investments", "Investments", content);
  let category = "Forex";
  let moversOnly = false;
  let query = "";
  let selectedSymbol = "OANDA:EURUSD";
  let selectedCurrency = "USD";
  const renderRows = () => {
    const rows = markets[category].filter((row) => {
      const matches = row.join(" ").toLowerCase().includes(query.toLowerCase());
      const movers = !moversOnly || row[5].startsWith("+");
      return matches && movers;
    });
    app.querySelector("#market-rows").innerHTML = rows.length ? rows.map((row, index) => `<tr data-symbol="${escapeHtml(row[2])}" tabindex="0"><td>${index + 1}</td><td><span class="asset-code">${escapeHtml(row[0])}</span><span class="asset-name"><strong>${escapeHtml(row[1])}</strong><small>${escapeHtml(row[2])}</small></span></td><td>${escapeHtml(formatCurrency(row[3], selectedCurrency))}</td><td>${escapeHtml(row[4])}</td><td class="${row[5].startsWith("+") ? "positive" : "negative"}">${escapeHtml(row[5])}</td><td>${icons.chevron}</td></tr>`).join("") : '<tr><td class="no-results" colspan="6">No matching markets found.</td></tr>';
  };
  renderRows();
  app.querySelectorAll(".market-tabs button").forEach((button) => button.addEventListener("click", () => {
    category = button.dataset.category;
    app.querySelectorAll(".market-tabs button").forEach((tab) => tab.classList.toggle("active", tab === button));
    renderRows();
  }));
  app.querySelector("#market-search").addEventListener("input", (event) => {
    query = event.target.value;
    renderRows();
  });
  ["#table-currency", "#market-currency"].forEach((selector) => app.querySelector(selector).addEventListener("change", (event) => {
    selectedCurrency = event.target.value;
    app.querySelector("#table-currency").value = selectedCurrency;
    app.querySelector("#market-currency").value = selectedCurrency;
    renderRows();
  }));
  app.querySelector("#market-rows").addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-symbol]");
    if (!row) return;
    selectedSymbol = row.dataset.symbol;
    app.querySelector("#chart-symbol").textContent = selectedSymbol;
  });
  app.querySelector("#market-rows").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.matches("tr[data-symbol]")) {
      selectedSymbol = event.target.dataset.symbol;
      app.querySelector("#chart-symbol").textContent = selectedSymbol;
    }
  });
  app.querySelectorAll(".chart-intervals button").forEach((button) => button.addEventListener("click", () => {
    app.querySelectorAll(".chart-intervals button").forEach((interval) => interval.classList.toggle("active", interval === button));
    notify(`${button.dataset.interval} chart interval selected for ${selectedSymbol}.`);
  }));
  app.querySelector("[data-action='toggle-movers']").addEventListener("click", (event) => {
    moversOnly = !moversOnly;
    event.currentTarget.classList.toggle("active", moversOnly);
    renderRows();
  });
  let watchlist = state.watchlist || [];
  let showingWatchlist = false;
  const watchButton = app.querySelector("[data-action='toggle-watchlist']");
  const popularList = app.querySelector("#popular-list");
  function renderPopular() {
    const items = showingWatchlist ? popular.filter((item) => watchlist.includes(item[6])) : popular;
    popularList.innerHTML = items.length ? items.map(([ticker, name, categoryName, price, change, group, symbol]) => `<button class="popular-item" data-action="select-popular" data-ticker="${symbol}" data-category="${group}"><span class="popular-ticker">${ticker}</span><span class="popular-name"><strong>${name}</strong><small>${categoryName}</small></span><span class="popular-quote"><strong>${price}</strong><small class="${change.startsWith("−") ? "negative" : "positive"}">${change.startsWith("−") ? "▼" : "▲"} ${change.replace(/[+−]/, "")}</small></span></button>`).join("") : '<p class="empty-inline">No popular assets match your watchlist.</p>';
    popularList.querySelectorAll("[data-action='select-popular']").forEach((button) => button.addEventListener("click", () => {
      selectedSymbol = button.dataset.ticker;
      app.querySelector("#chart-symbol").textContent = selectedSymbol;
      category = button.dataset.category;
      app.querySelectorAll(".market-tabs button").forEach((tab) => tab.classList.toggle("active", tab.dataset.category === category));
      renderRows();
      app.querySelector(".market-table-section").scrollIntoView({ behavior: "smooth" });
    }));
  }
  renderPopular();
  watchButton.classList.toggle("active", showingWatchlist);
  watchButton.setAttribute("aria-pressed", "false");
  watchButton.addEventListener("click", () => {
    if (!watchlist.length) {
      const next = getVaultState();
      next.watchlist = ["AAPL", "btc", "EURUSD"];
      if (!saveVaultState(next)) return;
      watchlist = next.watchlist;
    }
    showingWatchlist = !showingWatchlist;
    watchButton.classList.toggle("active", showingWatchlist);
    watchButton.setAttribute("aria-pressed", String(showingWatchlist));
    watchButton.setAttribute("aria-label", showingWatchlist ? "Show popular assets" : "Show watchlist");
    renderPopular();
  });
  bindDashboardActions();
}

function formatCurrency(value, currency) {
  if (currency === "USD" || value.endsWith("%") || value.includes("bps")) return value;
  if (value.startsWith("$")) {
    const numeric = Number(value.slice(1).replace(/,/g, ""));
    return Number.isFinite(numeric) ? `€${(numeric * 0.92).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value;
  }
  return value;
}

function renderTransactions() {
  const state = getVaultState();
  const rows = [...state.transactions].reverse();
  const content = `
    <div class="workspace-heading"><div><p class="workspace-label">Workspace</p><h1>History</h1><p class="page-subtitle">Transactions</p></div></div>
    ${rows.length ? `<section class="history-card"><div class="history-head"><h2>Recent activity</h2><span>${rows.length} transactions</span></div><div class="history-list">${rows.map((entry) => `<article class="history-row"><span class="activity-icon ${entry.type === "withdraw" ? "out" : ""}">${entry.type === "withdraw" ? icons.down : icons.up}</span><span class="activity-copy"><strong>${escapeHtml(entry.label)}</strong><small>${escapeHtml(entry.date)}</small></span><strong class="activity-amount ${entry.type === "withdraw" ? "out" : "in"}">${entry.type === "withdraw" ? "−" : "+"}${money(entry.amount)}</strong></article>`).join("")}</div></section>` : `<div class="empty-state transaction-empty">${icons.wallet}<h3>No Transactions Yet</h3><p>You haven't made any deposits or withdrawals yet. Your transaction history will appear here.</p><button class="button button-primary" data-action="deposit">${icons.plus}Make a deposit</button></div>`}`;
  dashboardLayout("dashboard/transactions", "Transactions", content);
  bindDashboardActions();
}

function renderSettings() {
  const profile = getProfile() || { name: currentUser?.displayName || "Vault Member", email: currentUser?.email || "", phone: "", plan: "Basic" };
  const plan = profile.plan || "Basic";
  const content = `
    <div class="workspace-heading"><div><p class="workspace-label">Workspace</p><h1>Configuration</h1><p class="page-subtitle">Settings</p></div></div>
    <div class="settings-grid"><div class="settings-column">
      <section class="settings-card"><div class="settings-heading"><span class="section-icon">${icons.wallet}</span><h2>Personal Information</h2><button class="icon-button" type="button" aria-label="Edit profile" data-action="edit-profile">${icons.settings}</button></div>
        <dl class="profile-details"><div><dt>Full Name</dt><dd>${escapeHtml(profile.name || "Vault Member")}</dd></div><div><dt>Email Address</dt><dd>${escapeHtml(profile.email || "member@vault.com")}</dd></div><div><dt>Phone Number</dt><dd>${escapeHtml(profile.phone || "Not provided")}</dd></div></dl>
        <button class="button button-secondary settings-button" data-action="edit-profile">Edit Profile</button>
      </section>
      <section class="settings-card"><div class="settings-heading"><span class="section-icon">${icons.shield}</span><h2>Security</h2></div><div class="security-setting"><div><strong>Password</strong><p>Manage your secure entry key</p></div><button class="button button-secondary" data-action="update-password">Update Password</button></div></section>
    </div>
    <div class="settings-column"><section class="settings-card plan-card-settings"><div class="settings-heading"><span class="section-icon">${icons.chart}</span><h2>Your Plan</h2></div><span class="plan-pill">${escapeHtml(plan)} account</span><p>${plan === "Premium" ? "You have access to Savings and Standing Orders. Upgrade to Gold for Investments." : plan === "Gold" ? "You have access to Savings, Standing Orders, Investments, and Vault Prime funds." : "You have access to savings essentials. Upgrade to Premium for Standing Orders, or Gold for Investments."}</p><button class="button button-secondary settings-button" data-action="manage-plan">Manage Subscription</button></section><button class="logout-card" data-action="logout">${icons.close}Logout</button></div></div>`;
  dashboardLayout("dashboard/settings", "Settings", content);
  bindDashboardActions();
}

function bindFundPicker() {
  const options = app.querySelector("#fund-options");
  if (!options) return;
  let selectedFund = 0;
  options.innerHTML = funds.map((fund, index) => `<button type="button" class="fund-option" data-index="${index}" aria-pressed="${index === 0}"><span class="fund-option-icon ${fund.color}"><span></span></span><span class="fund-option-name"><strong>${escapeHtml(fund.name)}</strong><small>Min: KSh ${fund.minimum.toLocaleString("en-KE")}</small></span><strong class="fund-option-apy ${fund.color}">${fund.apy}</strong>${icons.chevron}</button>`).join("");
  function update() {
    const fund = funds[selectedFund];
    app.dataset.selectedFund = String(selectedFund);
    app.querySelector("#selected-fund-name").textContent = fund.name;
    app.querySelector("#selected-fund-description").textContent = fund.description;
    app.querySelector("#selected-fund-apy").textContent = fund.apy;
    app.querySelector("#selected-fund-risk").textContent = fund.risk;
    options.querySelectorAll(".fund-option").forEach((option, index) => option.setAttribute("aria-pressed", String(index === selectedFund)));
  }
  update();
  options.addEventListener("click", (event) => {
    const option = event.target.closest(".fund-option");
    if (!option) return;
    selectedFund = Number(option.dataset.index);
    update();
  });
}

function bindDashboardActions() {
  app.querySelectorAll("[data-action='deposit']").forEach((button) => button.addEventListener("click", () => openPaymentDialog("deposit")));
  app.querySelectorAll("[data-action='withdraw']").forEach((button) => button.addEventListener("click", () => openPaymentDialog("withdraw")));
  app.querySelectorAll("[data-action='create-goal']").forEach((button) => button.addEventListener("click", openGoalDialog));
  app.querySelectorAll("[data-action='complete-sprint']").forEach((button) => button.addEventListener("click", completeSprint));
  app.querySelectorAll("[data-action='contribute']").forEach((button) => button.addEventListener("click", () => openContributionDialog(Number(button.dataset.goal))));
  app.querySelectorAll("[data-action='goal-options']").forEach((button) => button.addEventListener("click", () => openGoalDetails(Number(button.dataset.goal))));
  app.querySelectorAll("[data-action='intelligence']").forEach((button) => button.addEventListener("click", () => notify("Vault Intelligence is a sample suggestion, not financial advice.")));
  app.querySelectorAll("[data-action='invest']").forEach((button) => button.addEventListener("click", () => openInvestDialog(funds[Number(app.dataset.selectedFund) || 0])));
  app.querySelectorAll("[data-action='edit-profile']").forEach((button) => button.addEventListener("click", openProfileDialog));
  app.querySelectorAll("[data-action='update-password']").forEach((button) => button.addEventListener("click", openPasswordDialog));
  app.querySelectorAll("[data-action='manage-plan']").forEach((button) => button.addEventListener("click", () => openPlanDialog(button.dataset.plan)));
  app.querySelectorAll("[data-action='create-standing-order']").forEach((button) => button.addEventListener("click", openStandingOrderDialog));
  app.querySelectorAll("[data-order-toggle]").forEach((button) => button.addEventListener("click", () => toggleStandingOrder(button.dataset.orderToggle)));
  app.querySelectorAll("[data-order-delete]").forEach((button) => button.addEventListener("click", () => confirmDeleteStandingOrder(button.dataset.orderDelete)));
  app.querySelectorAll("[data-toast]").forEach((button) => button.addEventListener("click", () => notify(button.dataset.toast)));
}

function openStandingOrderDialog() {
  if (!hasPlanAccess("Premium")) {
    notify("Standing Orders are available with Premium.");
    return;
  }
  const state = getVaultState();
  const destinations = state.goals.map((goal, index) => `<option value="${escapeHtml(standingOrderGoalKey(goal, index))}">Savings goal · ${escapeHtml(goal.name)}</option>`).join("");
  const { host } = openDialog("Create Standing Order", `<form class="dialog-form standing-order-form">
    <label>Schedule name<input name="name" placeholder="e.g. Monthly savings" required minlength="2" maxlength="48" /></label>
    <label>Amount (KSh)<input name="amount" type="number" min="1" step="1" inputmode="numeric" placeholder="e.g. 5,000" required /></label>
    <div class="standing-form-row">
      <label>Frequency<select name="frequency"><option value="monthly">Monthly</option><option value="weekly">Weekly</option></select></label>
      <label>First run<input name="startDate" type="date" min="${localDateKey()}" value="${localDateKey()}" required /></label>
    </div>
    <label>Destination<select name="destination"><option value="wallet">General wallet</option>${destinations}</select></label>
    <p class="dialog-note">This saves a schedule in this browser only. It will not move or charge money automatically.</p>
    <p class="form-message" role="alert"></p>
    <button class="button button-primary" type="submit">Save schedule</button>
  </form>`, (event, form, modal, close) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get("name")).trim();
    const amount = Number(data.get("amount"));
    const startDate = String(data.get("startDate"));
    const destination = String(data.get("destination"));
    if (name.length < 2) return showFormError(form.querySelector(".form-message"), "Give this schedule a name.");
    if (!Number.isSafeInteger(amount) || amount <= 0) return showFormError(form.querySelector(".form-message"), "Enter a whole amount greater than zero.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || new Date(`${startDate}T00:00:00`).getTime() < new Date(`${localDateKey()}T00:00:00`).getTime()) {
      return showFormError(form.querySelector(".form-message"), "Choose today or a future date for the first run.");
    }
    if (destination.startsWith("goal-") && !state.goals.some((goal, index) => standingOrderGoalKey(goal, index) === destination)) {
      return showFormError(form.querySelector(".form-message"), "Choose a savings goal that is still available.");
    }
    state.standingOrders.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      amount,
      frequency: String(data.get("frequency")),
      startDate,
      destination,
      active: true,
    });
    if (!saveVaultState(state)) return;
    close();
    render();
    notify("Standing order schedule saved.");
  });
}

function toggleStandingOrder(id) {
  const state = getVaultState();
  const order = state.standingOrders.find((item) => String(item.id) === id);
  if (!order) return notify("This standing order is no longer available.");
  order.active = !order.active;
  if (!saveVaultState(state)) return;
  render();
  notify(`Standing order ${order.active ? "resumed" : "paused"}.`);
}

function confirmDeleteStandingOrder(id) {
  const order = getVaultState().standingOrders.find((item) => String(item.id) === id);
  if (!order) return notify("This standing order is no longer available.");
  const { host, close } = openDialog("Delete standing order?", `<p class="dialog-note">“${escapeHtml(order.name)}” will be removed from this browser.</p><div class="dialog-actions"><button class="button button-secondary" type="button" data-cancel>Keep schedule</button><button class="button delete-confirm" type="button" data-confirm-delete>Delete schedule</button></div>`);
  host.querySelector("[data-cancel]").addEventListener("click", close);
  host.querySelector("[data-confirm-delete]").addEventListener("click", () => {
    const state = getVaultState();
    state.standingOrders = state.standingOrders.filter((item) => String(item.id) !== id);
    if (!saveVaultState(state)) return;
    close();
    render();
    notify("Standing order deleted.");
  });
}

function openDialog(title, body, onSubmit) {
  closeDialog();
  const host = document.createElement("div");
  host.className = "modal-backdrop";
  host.innerHTML = `<section class="app-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-heading"><h2 id="modal-title">${escapeHtml(title)}</h2><button class="modal-close" type="button" aria-label="Close dialog">${icons.close}</button></div><div class="modal-content">${body}</div></section>`;
  document.body.append(host);
  const close = () => {
    host.remove();
    document.removeEventListener("keydown", onKeyDown);
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") close();
  };
  host.querySelector(".modal-close").addEventListener("click", close);
  host.addEventListener("click", (event) => {
    if (event.target === host) close();
  });
  document.addEventListener("keydown", onKeyDown);
  const form = host.querySelector("form");
  if (form && onSubmit) form.addEventListener("submit", (event) => onSubmit(event, form, host, close));
  host.querySelector("input,select,button")?.focus();
  return { host, close };
}

function openGoalDialog() {
  let photoFileData = "";
  const { host } = openDialog("Create Saving Goal", `<form class="dialog-form"><label>Goal Name<input name="name" placeholder="e.g. New Home, Dream Car" required minlength="2" /></label><label>Target Amount (KSh)<input name="target" type="number" min="1" step="1" required /></label><div class="photo-picker"><button type="button" class="button button-secondary" data-photo-trigger>${icons.plus}Add Photo</button><input type="file" name="photoFile" accept="image/*" hidden /><span class="photo-filename">Optional photo</span></div><label>Photo Source (Optional)<input name="photo" type="url" placeholder="Or paste an image link here..." /></label><p class="dialog-note">Goals are saved only in this browser.</p><p class="form-message" role="alert"></p><button class="button button-primary" type="submit">Create Goal</button></form>`, (event, form, modal, close) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    let photo = photoFileData;
    const photoUrl = String(data.get("photo") || "").trim();
    if (photoUrl) {
      try {
        const url = new URL(photoUrl);
        if (url.protocol !== "https:") throw new Error("Unsupported image URL protocol.");
        photo = url.href;
      } catch {
        return showFormError(form.querySelector(".form-message"), "Use a valid HTTPS image link or choose a photo file.");
      }
    }
    const state = getVaultState();
    state.goals.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: String(data.get("name")).trim(), target: Number(data.get("target")), saved: 0, photo, createdAt: new Date().toISOString() });
    if (!saveVaultState(state)) return;
    close();
    render();
    notify("Your savings goal was created.");
  });
  const fileInput = host.querySelector("[name='photoFile']");
  host.querySelector("[data-photo-trigger]").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      fileInput.value = "";
      return notify("Choose an image file for your savings goal.");
    }

    if (file.size > 1_000_000) {
      fileInput.value = "";
      return notify("Choose an image smaller than 1 MB.");
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") return notify("The selected image couldn't be read.");
      photoFileData = reader.result;
      host.querySelector(".photo-filename").textContent = file.name;
    });
    reader.addEventListener("error", () => notify("The selected image couldn't be read."));
    reader.readAsDataURL(file);
  });
}

function openGoalDetails(index) {
  const goal = getVaultState().goals[index];
  if (!goal) return notify("This savings goal is no longer available.");
  const progress = goal.target ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
  const { host, close } = openDialog(goal.name, `<div class="goal-details"><p>${money(goal.saved)} saved of ${money(goal.target)}</p><div class="goal-track"><div class="goal-progress" style="width:${progress}%"></div></div><p>${progress}% of your target reached.</p><div class="dialog-actions"><button class="button button-secondary" type="button" data-cancel>Close</button><button class="button button-primary" type="button" data-contribute>Add savings</button></div><button class="delete-goal" type="button" data-delete>Delete goal</button></div>`);
  host.querySelector("[data-cancel]").addEventListener("click", () => host.querySelector(".modal-close").click());
  host.querySelector("[data-contribute]").addEventListener("click", () => {
    close();
    openContributionDialog(index);
  });
  host.querySelector("[data-delete]").addEventListener("click", () => {
    close();
    const confirmation = openDialog("Delete savings goal?", `<p class="dialog-note">This removes the goal and its saved progress from this browser.</p><div class="dialog-actions"><button class="button button-secondary" type="button" data-cancel>Keep goal</button><button class="button delete-confirm" type="button" data-confirm-delete>Delete goal</button></div>`);
    confirmation.host.querySelector("[data-cancel]").addEventListener("click", () => confirmation.host.querySelector(".modal-close").click());
    confirmation.host.querySelector("[data-confirm-delete]").addEventListener("click", () => {
      const state = getVaultState();
      state.goals.splice(index, 1);
      if (!saveVaultState(state)) return;
      confirmation.close();
      render();
      notify("Savings goal deleted.");
    });
  });
}

function openPaymentDialog(initialType) {
  let transactionType = initialType;
  const state = getVaultState();
  const goalOptions = state.goals.map((goal, index) => `<option value="${index}">${escapeHtml(goal.name)}</option>`).join("");
  const { host } = openDialog(initialType === "deposit" ? "Add Funds" : "Withdraw Funds", `<form class="dialog-form payment-form">
    <div class="dialog-tabs"><button type="button" data-type="deposit" class="${initialType === "deposit" ? "active" : ""}">Deposit</button><button type="button" data-type="withdraw" class="${initialType === "withdraw" ? "active" : ""}">Withdraw</button></div>
    <label class="destination-label">Destination<select name="destination"><option value="wallet">General Wallet</option>${goalOptions}</select></label>
    <label>Amount (KSh)<input name="amount" type="number" min="1" step="1" inputmode="numeric" placeholder="e.g. 1,000" required /></label>
    <p class="dialog-note payment-note">This simulates funding the selected destination in your browser. No payment is charged and no card or M-Pesa details are collected.</p><p class="form-message" role="alert"></p><button class="button button-primary" type="submit">Simulate ${initialType}</button></form>`, (event, form, modal, close) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const amount = Number(new FormData(form).get("amount"));
    const data = getVaultState();
    const destination = String(new FormData(form).get("destination"));
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      showFormError(form.querySelector(".form-message"), "Enter a whole amount greater than zero.");
      return;
    }
    if (transactionType === "withdraw" && destination !== "wallet") {
      showFormError(form.querySelector(".form-message"), "Choose General Wallet as the withdrawal source.");
      return;
    }
    if (transactionType === "withdraw" && amount > data.balance) {
      showFormError(form.querySelector(".form-message"), "The wallet doesn't have enough funds for this withdrawal.");
      return;
    }
    if (destination !== "wallet" && transactionType === "deposit") {
      const goal = data.goals[Number(destination)];
      if (!goal) return showFormError(form.querySelector(".form-message"), "That savings goal is no longer available.");
      goal.saved += amount;
    } else {
      data.balance += transactionType === "deposit" ? amount : -amount;
    }
    const goalName = destination === "wallet" ? "" : data.goals[Number(destination)]?.name;
    data.transactions.push({ type: transactionType, amount, label: transactionType === "deposit" ? `Deposit${goalName ? ` · ${goalName}` : ""}` : "Withdrawal", date: new Date().toLocaleString() });
    if (!saveVaultState(data)) return;
    close();
    render();
    notify(`${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} complete.`);
  });
  const form = host.querySelector("form");
  const destination = form.querySelector("[name='destination']");
  host.querySelectorAll("[data-type]").forEach((button) => button.addEventListener("click", () => {
    transactionType = button.dataset.type;
    host.querySelectorAll("[data-type]").forEach((tab) => tab.classList.toggle("active", tab === button));
    destination.value = "wallet";
    destination.querySelectorAll("option:not([value='wallet'])").forEach((option) => {
      option.hidden = transactionType === "withdraw";
      option.disabled = transactionType === "withdraw";
    });
    form.querySelector(".destination-label").firstChild.textContent = transactionType === "deposit" ? "Destination" : "Source";
    form.querySelector(".payment-note").textContent = transactionType === "deposit"
      ? "This simulates funding the selected destination in your browser. No payment is charged and no card or M-Pesa details are collected."
      : "Withdrawals reduce your local balance. No money is transferred.";
    form.querySelector("[type='submit']").textContent = `Simulate ${transactionType}`;
  }));
}

function openContributionDialog(index) {
  const state = getVaultState();
  const goal = state.goals[index];
  if (!goal) return;
  openDialog(`Add to ${goal.name}`, `<form class="dialog-form"><label>Amount (KSh)<input name="amount" type="number" min="1" step="1" required /></label><p class="dialog-note">This updates your local goal only.</p><p class="form-message" role="alert"></p><button class="button button-primary" type="submit">Add savings</button></form>`, (event, form, host, close) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const amount = Number(new FormData(form).get("amount"));
    const latest = getVaultState();
    if (amount > latest.balance) return showFormError(form.querySelector(".form-message"), "The wallet doesn't have enough funds.");
    latest.balance -= amount;
    latest.goals[index].saved += amount;
    latest.transactions.push({ type: "withdraw", amount, label: `Goal contribution · ${goal.name}`, date: new Date().toLocaleString() });
    if (!saveVaultState(latest)) return;
    close();
    render();
    notify("Savings added to your goal.");
  });
}

function openInvestDialog(fund) {
  openDialog(`Invest in ${fund.name}`, `<form class="dialog-form"><p class="investment-summary">Minimum investment <strong>${money(fund.minimum)}</strong><span>Projected APY ${fund.apy} · Risk ${fund.risk}</span></p><label>Investment amount (KSh)<input name="amount" type="number" min="${fund.minimum}" step="1" required /></label><p class="dialog-note">This will not place a real investment.</p><p class="form-message" role="alert"></p><button class="button button-primary" type="submit">Review investment</button></form>`, (event, form, host, close) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const amount = Number(new FormData(form).get("amount"));
    const state = getVaultState();
    if (amount < fund.minimum) return showFormError(form.querySelector(".form-message"), `The minimum investment is ${money(fund.minimum)}.`);
    if (amount > state.balance) return showFormError(form.querySelector(".form-message"), "The wallet doesn't have enough funds.");
    state.balance -= amount;
    state.investments.push({ fund: fund.name, amount, date: new Date().toISOString() });
    state.transactions.push({ type: "withdraw", amount, label: `Investment · ${fund.name}`, date: new Date().toLocaleString() });
    if (!saveVaultState(state)) return;
    close();
    render();
    notify("Investment recorded locally.");
  });
}

function openProfileDialog() {
  const profile = getProfile() || { name: currentUser?.displayName || "", phone: "", email: currentUser?.email || "" };
  const { host } = openDialog("Edit Profile", `<form class="dialog-form"><label>Full Name<input name="name" value="${escapeHtml(profile.name || "")}" placeholder="Enter your full name" required minlength="2" /></label><label>Phone Number<input name="phone" value="${escapeHtml(profile.phone || "")}" placeholder="Enter your phone number" /></label><p class="form-message" role="alert"></p><div class="dialog-actions"><button class="button button-secondary" type="button" data-cancel>Cancel</button><button class="button button-primary" type="submit">Save Changes</button></div></form>`, async (event, form, host, close) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get("name")).trim();
    try {
      await updateProfile(currentUser, { displayName: name });
      saveProfile({ ...profile, name, phone: String(data.get("phone")).trim() });
    } catch (error) {
      console.error("Could not update the account profile", error);
      return showFormError(form.querySelector(".form-message"), error instanceof DOMException && error.name === "QuotaExceededError"
        ? "Your browser storage is full. Clear some space and try again."
        : "Your profile couldn't be updated. Please try again.");
    }
    close();
    render();
    notify("Profile updated.");
  });
  host.querySelector("[data-cancel]").addEventListener("click", () => host.querySelector(".modal-close").click());
}

function openPasswordDialog() {
  const { host } = openDialog("Update Password", `<form class="dialog-form"><label>Current Password<input name="current" type="password" autocomplete="current-password" required /></label><label>New Password<input name="next" type="password" autocomplete="new-password" minlength="8" required /><small>Use at least 8 characters.</small></label><label>Confirm New Password<input name="confirm" type="password" autocomplete="new-password" minlength="8" required /></label><p class="form-message" role="alert"></p><div class="dialog-actions"><button class="button button-secondary" type="button" data-cancel>Cancel</button><button class="button button-primary" type="submit">Update Password</button></div></form>`, async (event, form, modal, close) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = form.querySelector(".form-message");
    if (data.get("next") !== data.get("confirm")) return showFormError(message, "New passwords do not match.");
    if (!currentUser?.email) return showFormError(message, "Password updates require an email/password account.");
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, String(data.get("current")));
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, String(data.get("next")));
      close();
      notify("Password updated.");
    } catch (error) {
      console.error("Firebase password update failed", error);
      showFormError(message, firebaseAuthErrorMessage(error, "Password update"));
    }
  });
  host.querySelector("[data-cancel]").addEventListener("click", () => host.querySelector(".modal-close").click());
}

function openPlanDialog(suggestedPlan) {
  const profile = getProfile() || { name: currentUser?.displayName || "Vault Member", email: currentUser?.email || "", plan: "Basic" };
  const selectedPlan = ["Basic", "Premium", "Gold"].includes(suggestedPlan) ? suggestedPlan : profile.plan;
  const { host } = openDialog("Manage Subscription", `<form class="dialog-form"><label>Select Plan<select name="plan">${["Basic", "Premium", "Gold"].map((plan) => `<option ${plan === selectedPlan ? "selected" : ""}>${plan}</option>`).join("")}</select></label><div class="plan-choices"><article><strong>Basic</strong><span>Secure deposits · Savings essentials</span></article><article><strong>Premium</strong><span>Custom goals · Standing orders</span></article><article><strong>Gold</strong><span>Everything in Premium · Investments</span></article></div><p class="dialog-note">Plan changes only update your local profile.</p><p class="form-message" role="alert"></p><div class="dialog-actions"><button class="button button-secondary" type="button" data-cancel>Cancel</button><button class="button button-primary" type="submit">Save Plan</button></div></form>`, (event, form, host, close) => {
    event.preventDefault();
    const data = new FormData(form);
    try {
      saveProfile({ ...profile, plan: String(data.get("plan")) });
    } catch (error) {
      console.error("Could not save the selected account plan", error);
      return showFormError(form.querySelector(".form-message"), "Your browser couldn't save this plan update.");
    }
    close();
    render();
    notify("Plan updated.");
  });
  host.querySelector("[data-cancel]").addEventListener("click", () => host.querySelector(".modal-close").click());
}

function closeDialog() {
  document.querySelector(".modal-backdrop")?.remove();
}

function completeSprint() {
  const state = getVaultState();
  if (state.sprintDate === localDateKey()) return notify("Your daily sprint is already complete.");
  state.balance += 1000;
  state.streak += 1;
  state.sprintDate = localDateKey();
  state.transactions.push({ type: "deposit", amount: 1000, label: "Daily sprint", date: new Date().toLocaleString() });
  if (saveVaultState(state)) {
    render();
    notify("Daily sprint complete. KSh 1,000 added to your wallet.");
  }
}

function localDateKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function startCountdown() {
  const output = app.querySelector("#sprint-countdown");
  if (!output) return;
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  const update = () => {
    const remaining = Math.max(0, next.getTime() - Date.now());
    output.textContent = `${Math.floor(remaining / 3_600_000)}h ${Math.floor((remaining % 3_600_000) / 60_000)}m ${Math.floor((remaining % 60_000) / 1000)}s`;
  };
  update();
  const timer = setInterval(update, 1000);
  window.addEventListener("hashchange", () => clearInterval(timer), { once: true });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

let toastTimer;
function notify(text) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = text;
  document.body.append(toast);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.remove(), 2800);
}

function render() {
  document.querySelector(".toast")?.remove();
  const route = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  app.classList.remove("is-visible");
  if (!route.startsWith("dashboard")) delete document.documentElement.dataset.plan;
  if (route === "login" || route === "register") renderAuth(route);
  else if (route.startsWith("dashboard")) {
    if (!authInitialized) return;
    if (!currentUser) {
      window.location.hash = "/login";
      return;
    }
    renderDashboard();
  }
  else renderLanding();
  requestAnimationFrame(() => {
    app.classList.add("is-visible");
  });
  applyTheme(document.documentElement.dataset.theme);
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  authInitialized = true;
  if (authActionInProgress) return;

  let profileError = null;
  if (user) {
    try {
      ensureUserProfile(user);
    } catch (error) {
      console.error("Could not initialize the signed-in account profile", error);
      profileError = error;
    }
    const route = window.location.hash.replace(/^#\/?/, "").split("?")[0];
    if (route === "login" || route === "register") {
      window.location.hash = "/dashboard";
      return;
    }
  }
  const route = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  if (!user && !route.startsWith("dashboard")) return;
  render();
  if (profileError) notify("You’re signed in, but your local profile could not be saved.");
}, (error) => {
  authInitialized = true;
  console.error("Firebase could not restore the signed-in session", error);
  notify("Firebase could not restore your sign-in. Please refresh and try again.");
  render();
});

window.addEventListener("hashchange", render);
app.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-action='theme-toggle']");
  if (!toggle) return;
  const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem("vault-theme", nextTheme);
  applyTheme(nextTheme);
});
applyTheme(localStorage.getItem("vault-theme") || "dark");
render();
