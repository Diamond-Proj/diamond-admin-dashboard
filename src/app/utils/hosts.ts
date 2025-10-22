export const isPerlmutterHost = (host?: string) =>
  typeof host === 'string' && host.toLowerCase().includes('perlmutter');
