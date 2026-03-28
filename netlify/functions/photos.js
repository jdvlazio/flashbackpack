exports.handler = async (event) => {
  const folder = event.queryStringParameters?.folder;
  const key = process.env.CLOUDINARY_KEY;
  const secret = process.env.CLOUDINARY_SECRET;
  const cloud = process.env.CLOUDINARY_CLOUD || 'deb88gq1x';
  // Debug: devolver las vars para verificar
  if (event.queryStringParameters?.debug === '1') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ hasKey: !!key, keyLen: key?.length, cloud }) };
  }
  if (!folder) return { statusCode: 400, body: JSON.stringify({ error: 'folder required' }) };
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: 'missing CLOUDINARY_KEY env var' }) };
  const creds = Buffer.from(key + ':' + secret).toString('base64');
  try {
    const url = 'https://api.cloudinary.com/v1_1/' + cloud + '/resources/by_asset_folder?asset_folder=' + encodeURIComponent(folder) + '&max_results=200';
    const res = await fetch(url, { headers: { 'Authorization': 'Basic ' + creds } });
    const data = await res.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    const urls = (data.resources || []).map(r => 'https://res.cloudinary.com/' + cloud + '/image/upload/q_auto,f_auto/' + r.public_id);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ urls, total: urls.length }) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
