const COMMON_PASSWORDS_2024 = [
  '123456','123456789','12345678','password','qwerty123','qwerty','111111','12345','123123','abc123',
  'password1','admin','letmein','welcome','iloveyou','monkey','dragon','football','baseball','sunshine',
  'princess','trustno1','login','solo','starwars','master','hello','freedom','whatever','qazwsx'
];

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const registerBtn = document.getElementById('registerBtn');
const nicknameInput = document.getElementById('nickname');
const passwordInput = document.getElementById('password');
const repeatPasswordInput = document.getElementById('repeatPassword');
const generatedPasswordBox = document.getElementById('generatedPasswordBox');
const manualPasswordFields = document.getElementById('manualPasswordFields');
let nicknameAttempts = 0;
let generatedPassword = '';

function errorFor(name, text = '') {
  const box = document.querySelector(`[data-error-for="${name}"]`);
  if (box) box.textContent = text;
}

function isBelarusPhone(value) {
  return /^\+375(25|29|33|44)\d{7}$/.test(value.trim());
}

function isSixteenYearsOld(dateValue) {
  if (!dateValue) return false;
  const birth = new Date(dateValue);
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  return birth <= minDate;
}

function isStrongPassword(value) {
  return value.length >= 8 && value.length <= 20 &&
    /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value) &&
    !COMMON_PASSWORDS_2024.includes(value.toLowerCase());
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let result = 'Md1!';
  while (result.length < 12) result += chars[Math.floor(Math.random() * chars.length)];
  return result.split('').sort(() => Math.random() - 0.5).join('');
}

function translit(text) {
  const map = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ы:'y',э:'e',ю:'yu',я:'ya'};
  return text.toLowerCase().split('').map(ch => map[ch] || ch).join('').replace(/[^a-z]/g, '');
}

function makeNickname() {
  const first = translit(document.getElementById('firstName').value).slice(0, Math.floor(Math.random()*3)+1) || 'user';
  const last = translit(document.getElementById('lastName').value).slice(0, Math.floor(Math.random()*3)+1) || 'meal';
  return `${first}${last}${Math.floor(Math.random() * 990) + 10}`;
}

async function nicknameExists(nickname) {
  const response = await fetch(`${API_URL}/users?nickname=${encodeURIComponent(nickname)}`);
  const users = await response.json();
  return users.length > 0;
}

async function generateUniqueNickname() {
  nicknameAttempts++;
  if (nicknameAttempts > 5) {
    nicknameInput.readOnly = false;
    errorFor('nickname', '5 attempts used. You can enter a nickname yourself.');
    return;
  }
  let nickname = makeNickname();
  let guard = 0;
  while (await nicknameExists(nickname) && guard < 10) {
    nickname = makeNickname();
    guard++;
  }
  nicknameInput.value = nickname;
  errorFor('nickname');
  validateRegisterForm();
}

async function validateRegisterForm() {
  let valid = true;
  const lastName = document.getElementById('lastName').value.trim();
  const firstName = document.getElementById('firstName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email');
  const birthDate = document.getElementById('birthDate').value;
  const mode = document.querySelector('input[name="passwordMode"]:checked').value;
  const nickname = nicknameInput.value.trim();
  const agreement = document.getElementById('agreement').checked;

  errorFor('names'); errorFor('contacts'); errorFor('password'); errorFor('nickname'); errorFor('agreement');

  if (!lastName || !firstName) { errorFor('names', 'Last name and first name are required.'); valid = false; }
  if (!isBelarusPhone(phone)) { errorFor('contacts', 'Phone must be a Belarus number, for example +375291234567.'); valid = false; }
  if (!email.validity.valid) { errorFor('contacts', 'Enter a valid email.'); valid = false; }
  if (!isSixteenYearsOld(birthDate)) { errorFor('contacts', 'Registration is allowed only from 16 years old.'); valid = false; }

  if (mode === 'manual') {
    if (!isStrongPassword(passwordInput.value)) {
      errorFor('password', 'Password: 8-20 chars, uppercase, lowercase, digit, special char, not common.');
      valid = false;
    } else if (passwordInput.value !== repeatPasswordInput.value) {
      errorFor('password', 'Passwords do not match.');
      valid = false;
    }
  }

  if (!nickname) { errorFor('nickname', 'Generate or enter a nickname.'); valid = false; }
  if (!agreement) { errorFor('agreement', 'You must accept the User Agreement.'); valid = false; }

  if (nickname && await nicknameExists(nickname)) { errorFor('nickname', 'This nickname already exists.'); valid = false; }

  registerBtn.disabled = !valid;
  return valid;
}

document.getElementById('generateNickname').addEventListener('click', generateUniqueNickname);
document.getElementById('firstName').addEventListener('input', () => { nicknameAttempts = 0; nicknameInput.value = ''; validateRegisterForm(); });
document.getElementById('lastName').addEventListener('input', () => { nicknameAttempts = 0; nicknameInput.value = ''; validateRegisterForm(); });
repeatPasswordInput.addEventListener('paste', event => event.preventDefault());

registerForm.addEventListener('input', () => validateRegisterForm());
registerForm.addEventListener('change', () => validateRegisterForm());

document.querySelectorAll('input[name="passwordMode"]').forEach(input => {
  input.addEventListener('change', () => {
    const mode = document.querySelector('input[name="passwordMode"]:checked').value;
    if (mode === 'auto') {
      manualPasswordFields.hidden = true;
      generatedPassword = generatePassword();
      generatedPasswordBox.hidden = false;
      generatedPasswordBox.textContent = `Generated password: ${generatedPassword}`;
    } else {
      manualPasswordFields.hidden = false;
      generatedPasswordBox.hidden = true;
      generatedPassword = '';
    }
    validateRegisterForm();
  });
});

registerForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!(await validateRegisterForm())) return;

  const mode = document.querySelector('input[name="passwordMode"]:checked').value;
  const user = {
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    birthDate: document.getElementById('birthDate').value,
    lastName: document.getElementById('lastName').value.trim(),
    firstName: document.getElementById('firstName').value.trim(),
    middleName: document.getElementById('middleName').value.trim(),
    nickname: nicknameInput.value.trim(),
    password: mode === 'auto' ? generatedPassword : passwordInput.value,
    role: 'client',
    agreement: true,
    createdAt: new Date().toISOString()
  };

  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  const savedUser = await response.json();
  setCurrentUser(savedUser);
  showMessage('Registration successful');
  setTimeout(() => window.location.href = 'catalog.html', 700);
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  errorFor('loginEmail'); errorFor('loginPassword');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  const users = await response.json();
  if (!users.length) {
    errorFor('loginPassword', 'Wrong email or password.');
    return;
  }
  setCurrentUser(users[0]);
  showMessage('Login successful');
  setTimeout(() => window.location.href = 'catalog.html', 700);
});

window.addEventListener('load', () => {
  document.getElementById('loginEmail').focus();
  generateUniqueNickname();
});
