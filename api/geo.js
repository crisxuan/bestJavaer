var CHINESE_REGION_COUNTRIES = {
  CN: true,
  HK: true,
  MO: true,
  TW: true
};

module.exports = function geo(request, response) {
  var country = getHeader(request, 'x-vercel-ip-country') ||
    getHeader(request, 'cf-ipcountry') ||
    '';
  var ip = getClientIp(request);
  var language = inferLanguage(country, getHeader(request, 'accept-language'));

  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.statusCode = 200;
  response.end(JSON.stringify({
    country: country.toUpperCase(),
    ip: ip,
    language: language
  }));
};

function getHeader(request, name) {
  var value = request.headers[name] || request.headers[name.toLowerCase()];

  return Array.isArray(value) ? value[0] : (value || '');
}

function getClientIp(request) {
  var forwarded = getHeader(request, 'x-forwarded-for');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return getHeader(request, 'x-real-ip') ||
    request.socket && request.socket.remoteAddress ||
    '';
}

function inferLanguage(country, acceptLanguage) {
  var countryCode = (country || '').toUpperCase();

  if (countryCode) {
    return CHINESE_REGION_COUNTRIES[countryCode] ? 'zh' : 'en';
  }

  return /^zh\b/i.test(acceptLanguage || '') ? 'zh' : 'en';
}
