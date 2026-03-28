exports.handler = async (event) => {
  const folder = event.queryStringParameters?.folder;
  if (!folder) return { statusCode: 400, body: JSON.stringify({ error: 'folder required' }) };
  const key = process.env.CLOUDINARY_KEY;
  const secret = process.env.CLOUDINARY_SECRET;
  const cloud = process.env.CLOUDINARY_CLOUD || 'deb88gq1x';
  const creds = Buffer.from(key + ':' + secret).toString('base64');
  const url = 'https://api.cloudinary.com/v1_1/' + cloud + '/resources/image?prefix=' + encodeURIComponent(folder) + '&type=upload&max_results=200';
  try {
    const res = await fetch(url, { headers: { 'Authorization': 'Basic ' + creds } });
    const data = await res.json();
    const urls = (data.resources || []).map(r => 'https://res.cloudinary.com/' + cloud + '/image/upload/q_auto,f_auto/' + r.public_id);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ urls }) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
