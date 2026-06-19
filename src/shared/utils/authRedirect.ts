export const AUTH_CALLBACK_KEY = "auth_callback";

export const saveAuthCallback = (callback: string) => {
  sessionStorage.setItem(AUTH_CALLBACK_KEY, callback);
};

export const getAuthCallback = () => {
  return sessionStorage.getItem(AUTH_CALLBACK_KEY);
};

export const clearAuthCallback = () => {
  sessionStorage.removeItem(AUTH_CALLBACK_KEY);
};
