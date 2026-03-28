exports.handler = async (event) => {
  const folder = event.queryStringParameters?.folder;
  if (!folder) return { statusCode: 400, body: JSON.stringify({ error: 'folder required' }) };
  const key = process.env.CLOUDINARY_KEY;
  const secret = process.env.CLOUDINARY_SECRET;
  const cloud = process.env.CLOUDINARY_CLOUD || 'deb88gq1x';
  const creds = Buffer.from(key + ':' + secret).toString('base64');
  // Buscar por asset_folder (carpetas nuevas de Cloudinary)
  const url = 'https://api.cloudinary.com/v1_1/' + cloud + '/resources/search';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + creds, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: 'asset_folder="' + folder + '"', max_results: 200, sort_by: [{ uploaded_at: 'asc' }] })
    });
    const data = await res.json();
    const urls = (data.resources || []).map(r => 'https://res.cloudinary.com/' + cloud + '/image/upload/q_auto,f_auto/' + r.public_id);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ urls, total: urls.length }) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
