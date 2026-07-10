// GET /m/<key> — sert le fichier depuis R2 avec le bon Content-Type.
// C'est CETTE URL que l'on colle dans un Cadre / Projecteur WATERFrAMES.
// Cache immuable 1 an : les liens sont permanents.

export async function onRequestGet(context) {
  const { params, env } = context;
  if (!env.MEDIA) return new Response('Stockage non configuré', { status: 500 });

  const key = Array.isArray(params.key) ? params.key.join('/') : String(params.key || '');
  if (!key) return new Response('Introuvable', { status: 404 });

  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response('Introuvable', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('access-control-allow-origin', '*');
  if (!headers.has('content-type')) headers.set('content-type', 'application/octet-stream');

  return new Response(obj.body, { headers });
}
