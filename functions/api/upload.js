// POST /api/upload — reçoit un fichier (champ "file") et l'écrit dans R2.
// Renvoie { url, key }. L'URL pointe vers /m/<key> servi par functions/m/[[key]].js.
//
// Binding R2 attendu : MEDIA  (Cloudflare Pages → Settings → Functions → R2 bindings,
// ou voir wrangler.toml). Adapte MAX_BYTES à ta limite (aligne-la sur MAX_MB dans
// src/pages/MediaRelay.tsx).

const MAX_BYTES = 50 * 1024 * 1024; // 50 Mo
const ALLOWED = [/^image\//, /^video\//];

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS },
  });
}

function makeId(n = 8) {
  const c = 'abcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  let s = '';
  for (let i = 0; i < n; i++) s += c[bytes[i] % c.length];
  return s;
}

function extOf(name, type) {
  const m = String(name || '').toLowerCase().match(/\.[a-z0-9]+$/);
  if (m) return m[0];
  if (/gif/.test(type)) return '.gif';
  if (/png/.test(type)) return '.png';
  if (/jpe?g/.test(type)) return '.jpg';
  if (/webp/.test(type)) return '.webp';
  if (/mp4/.test(type)) return '.mp4';
  if (/webm/.test(type)) return '.webm';
  return '';
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.MEDIA) return json({ error: 'Stockage R2 non configuré (binding MEDIA manquant).' }, 500);
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return json({ error: 'Aucun fichier reçu.' }, 400);

    const type = file.type || '';
    if (!ALLOWED.some((r) => r.test(type))) return json({ error: 'Format non autorisé — images ou vidéos uniquement.' }, 415);
    if (file.size > MAX_BYTES) return json({ error: 'Fichier trop lourd.' }, 413);

    const key = makeId() + extOf(file.name, type);
    await env.MEDIA.put(key, file.stream(), {
      httpMetadata: { contentType: type || 'application/octet-stream' },
    });

    const origin = new URL(request.url).origin;
    return json({ url: origin + '/m/' + key, key });
  } catch (e) {
    return json({ error: 'Erreur serveur : ' + (e && e.message ? e.message : e) }, 500);
  }
}
