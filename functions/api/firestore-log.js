import { SignJWT } from 'jose'; // npm install jose

async function generateFirebaseJWT(env) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60; // 1 час
  const payload = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    sub: env.FIREBASE_CLIENT_EMAIL,
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    iat,
    exp,
    scope: "https://www.googleapis.com/auth/datastore"
  };
  const alg = 'RS256';
  const privateKey = await importPKCS8(env.FIREBASE_PRIVATE_KEY, alg);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg, typ: 'JWT' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setIssuer(env.FIREBASE_CLIENT_EMAIL)
    .setSubject(env.FIREBASE_CLIENT_EMAIL)
    .setAudience("https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit")
    .sign(privateKey);
}

async function getFirestoreDoc(docPath, jwt) {
  const resp = await fetch(`https://firestore.googleapis.com/v1/${docPath}`, {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  if (resp.status === 200) return await resp.json();
  return null;
}

function prepareFirestoreData(data, existingDoc) {
  // Преобразуй data в формат Firestore (fields, types)
  // Пример для простого случая:
  return {
    fields: {
      userId: { stringValue: String(data.userId) },
      username: { stringValue: data.username || '' },
      event: { stringValue: data.event },
      timestamp: { stringValue: data.timestamp },
      subid: { stringValue: data.subid || '' }
    }
  };
}

export default {
  async fetch(request, env, ctx) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method === 'POST' && request.url.endsWith('/api/firestore-log')) {
      try {
        const data = await request.json();
        if (!data.userId) {
          return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers });
        }
        const jwt = await generateFirebaseJWT(env);
        const docPath = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${data.userId}`;
        const existingDoc = await getFirestoreDoc(docPath, jwt);
        const documentData = prepareFirestoreData(data, existingDoc);

        const resp = await fetch(
          `https://firestore.googleapis.com/v1/${docPath}?updateMask.fieldPaths=event&updateMask.fieldPaths=timestamp&updateMask.fieldPaths=subid&updateMask.fieldPaths=username`,
          {
            method: existingDoc ? 'PATCH' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(documentData)
          }
        );

        return new Response(JSON.stringify({ success: resp.ok, id: data.userId }), { status: 200, headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers });
      }
    }

    return new Response('Not found', { status: 404, headers });
  }
};