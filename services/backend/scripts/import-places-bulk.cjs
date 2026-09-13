const fs = require('fs');
const path = require('path');

function parseCsvLine(line) {
  const cols = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cols.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cols.push(cur);
  return cols;
}

function emptyToUndef(value) {
  if (value == null) return undefined;
  const v = String(value).trim();
  if (!v || v === '-' || v === '—') return undefined;
  return v;
}

function toNumber(value) {
  const v = emptyToUndef(value);
  if (v == null) return undefined;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function mapCategory(industry) {
  const v = (industry || '').trim().toLowerCase();
  if (!v) return 'all';
  if (v.includes('образован')) return 'education';
  if (v.includes('здравоохран') || v.includes('медицин')) return 'healthcare';
  if (v.includes('спорт') || v.includes('физическ')) return 'sport';
  if (
    v.includes('жкх') ||
    v.includes('коммуналь') ||
    v.includes('жилищн') ||
    v.includes('парк') ||
    v.includes('благоустрой')
  ) {
    return 'utilities_and_parks';
  }
  if (
    v.includes('строительств') ||
    v.includes('инфраструктур') ||
    v.includes('энергет') ||
    v.includes('связь') ||
    v.includes('транспорт') ||
    v.includes('дорог')
  ) {
    return 'infrastructure';
  }
  // культура, социальная политика и прочее без точного соответствия
  return 'all';
}

async function main() {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'places.csv'), 'utf8');
  // Header spans multiple lines due to quoted multiline "Мощность\n(кол-во мест)"
  // Data starts after the numeric column-index row ("1,2,3,...")
  const indexRowMatch = raw.match(/\n1,2,3,4,5,,6,7,8[\s\S]*?\n/);
  if (!indexRowMatch) {
    throw new Error('Could not find column index row in places.csv');
  }
  const dataStart = indexRowMatch.index + indexRowMatch[0].length;
  const dataText = raw.slice(dataStart);

  const rows = [];
  let buf = '';
  let inQuotes = false;
  for (let i = 0; i < dataText.length; i++) {
    const ch = dataText[i];
    if (ch === '"') inQuotes = !inQuotes;
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && dataText[i + 1] === '\n') i++;
      if (buf.trim()) rows.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) rows.push(buf);

  const industries = new Set();
  const payload = [];

  for (const line of rows) {
    const c = parseCsvLine(line);
    // skip leftover header fragments / empty
    if (!c[1] || c[1] === 'ГРБС') continue;
    if (!/^\d+$/.test(String(c[0]).trim()) && !c[2]) continue;

    const industry = emptyToUndef(c[8]);
    industries.add(industry || '(empty)');

    const lat = toNumber(c[6]);
    const lon = toNumber(c[7]);

    const item = {
      grbs: emptyToUndef(c[1]),
      oksName: emptyToUndef(c[2]),
      category: mapCategory(industry),
      constructionStage: emptyToUndef(c[3]),
      address: emptyToUndef(c[4]),
      industry,
      status: emptyToUndef(c[9]),
      ownership: emptyToUndef(c[10]),
      amo: emptyToUndef(c[11]),
      customer: emptyToUndef(c[12]),
      npGpName: emptyToUndef(c[13]),
      fpName: emptyToUndef(c[14]),
      projectCode: emptyToUndef(c[15]),
      totalArea: toNumber(c[16]),
      capacity: toNumber(c[17]),
      expertise: emptyToUndef(c[18]),
      startYear: toNumber(c[19]),
      endYear: toNumber(c[20]),
      constructionPeriod: emptyToUndef(c[21]),
      landTransferDate: emptyToUndef(c[22]),
      constructionPermitDate: emptyToUndef(c[23]),
      contractConclusionDate: emptyToUndef(c[24]),
      contractPeriod: emptyToUndef(c[25]),
      contractor: emptyToUndef(c[26]),
      constructionReadiness: toNumber(c[27]),
      equipmentInstallationDate: emptyToUndef(c[28]),
      hydraulicTestActDate: emptyToUndef(c[29]),
      zosDate: emptyToUndef(c[30]),
      zosNumber: emptyToUndef(c[31]),
      commissioningActDate: emptyToUndef(c[32]),
      commissioningActNumber: emptyToUndef(c[33]),
      commissioningYear: toNumber(c[34]),
      photo: emptyToUndef(c[35]),
    };

    if (lat != null && lon != null) {
      item.coordinates = {
        type: 'Point',
        coordinates: [lon, lat],
      };
    }

    if (!item.grbs || !item.oksName) {
      console.warn('Skipping row without required fields:', c[0], item);
      continue;
    }

    payload.push(item);
  }

  console.log('Unique industries:');
  for (const i of [...industries].sort()) console.log(' -', i);
  console.log('Objects to send:', payload.length);

  const categoryCounts = payload.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1;
    return acc;
  }, {});
  console.log('Category mapping:', categoryCounts);

  const baseUrl =
    process.env.API_URL ?? `http://127.0.0.1:${process.env.PORT || 4000}`;
  const adminJwt = process.env.ADMIN_JWT;
  if (!adminJwt) {
    console.error('Set ADMIN_JWT (Bearer token from POST /auth/login)');
    process.exit(1);
  }

  const url = `${baseUrl}/object/bulk`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminJwt}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log('Status:', res.status);
  try {
    const json = JSON.parse(text);
    console.log('Created:', Array.isArray(json) ? json.length : json);
    if (!Array.isArray(json)) console.log(JSON.stringify(json, null, 2).slice(0, 2000));
  } catch {
    console.log(text.slice(0, 2000));
  }

  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
