// Where the login session lives in the browser.
//
// Customers stay signed in across tabs and browser restarts (localStorage).
// Staff/admin sessions live in sessionStorage instead: they belong to the one
// tab that signed in, so opening /admin in a new tab (or after closing the
// browser) asks for the password again.
const TOKEN_KEY = 'mn_auth_token';
const USER_KEY = 'mn_user';

export const isStaffRole = (role) => ['staff', 'admin'].includes(String(role || '').toLowerCase());

const read = (key) => {
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getStoredToken = () => read(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    return JSON.parse(read(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const clearSession = () => {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
      storage.removeItem('mn_current_role'); // old key, no longer used
    } catch {
      // storage blocked -- nothing to clear
    }
  }
};

export const saveSession = (user, token) => {
  clearSession();
  const storage = isStaffRole(user?.role) ? sessionStorage : localStorage;
  try {
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage blocked -- the session still works until the page is reloaded
  }
};

// Updates the saved user (e.g. after a profile edit) without moving the session.
export const saveUser = (user) => {
  try {
    const storage = sessionStorage.getItem(TOKEN_KEY) ? sessionStorage : localStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage blocked
  }
};
