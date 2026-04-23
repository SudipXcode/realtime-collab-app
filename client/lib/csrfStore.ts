// lib/csrfStore.ts
let csrfToken: string | null = null;

export function setCsrf(token: string) {
  csrfToken = token;
}

export function getCsrfToken() {
  return csrfToken;
}

export function clearCsrf() {
  csrfToken = null;
}
