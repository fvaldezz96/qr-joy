export function ok<T>(data: T) { return { ok: true, data }; }
export function fail(message: string, code = 'BAD_REQUEST') { return { ok: false, error: { code, message } }; }