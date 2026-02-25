/**
 * Wrapper autour de fetch qui intercepte les réponses 401.
 * Si le token est expiré/invalide, vide le localStorage et redirige vers /login.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    window.location.href = '/login';
  }

  return res;
}
