// Set window.__FLO_API_BASE__ before boot for a deployed API. Same-origin
// deployments need no override.
const configuredBase = globalThis.__FLO_API_BASE__;
const host = globalThis.location?.hostname || '';
const localBase = host === '10.0.2.2'
	? 'http://10.0.2.2:4000/api'
	: host === 'localhost' || host === '127.0.0.1'
		? 'http://localhost:4000/api'
		: '/api';

export const API_BASE = String(configuredBase || localBase).replace(/\/$/, '');
