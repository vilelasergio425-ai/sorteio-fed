export function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);

  const utms: Record<string, string> = {};

  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  for (const key of keys) {
    const value = params.get(key);
    if (value) {
      utms[key] = value;
    }
  }

  return utms;
}
