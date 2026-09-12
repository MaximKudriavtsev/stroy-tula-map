(() => {
  'use strict';

  const TAG = 'water-treatment-plant';
  if (customElements.get(TAG)) return;

  const DURATION = 3000;
  const EASING = 'cubic-bezier(.22,.75,.23,1)';
  const TAU = Math.PI * 2;
  const COLORS = {
    stone: ['#bdc1ae', '#d9ddca', '#eeeede'],
    concrete: ['#99a896', '#c3cbb7', '#e0e5d4'],
    steel: ['#7b9183', '#abbcad', '#e2eadb'],
    white: ['#b5c5bb', '#e2eade', '#f8f8e8'],
    green: ['#2c5b4b', '#477b5e', '#729678'],
    grass: ['#617e57', '#88a072', '#aebe8d'],
    deck: ['#277764', '#479f80', '#77b89a'],
    red: ['#945b55', '#b97d70', '#d3a08b'],
    blue: ['#336780', '#508fa3', '#8db5ba'],
    yellow: ['#b29c50', '#d5bd69', '#ead690'],
    dark: ['#43554b', '#647566', '#81907b'],
  };

  const p = (x, y, z = 0) => [
    640 + (x * .8 - y * .6) * 2.85,
    430 + (x * .3 + y * .4 - z * .8660254) * 2.85,
  ];
  const pts = vertices => vertices.map(v => p(...v).map(n => n.toFixed(2)).join(',')).join(' ');
  const depthAt = (x, y) => x * .6 + y * .8;

  function poly(vertices, fill, attrs = '') {
    return `<polygon points="${pts(vertices)}" fill="${fill}" ${attrs}/>`;
  }

  function line(vertices, color = '#809481', width = .8, opacity = 1) {
    return `<polyline points="${pts(vertices)}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  function circlePoints(x, y, z, radius, n = 80, a0 = 0, a1 = TAU) {
    return Array.from({ length: n + 1 }, (_, i) => {
      const a = a0 + (a1 - a0) * i / n;
      return [x + Math.cos(a) * radius, y + Math.sin(a) * radius, z];
    });
  }

  function disc(x, y, z, radius, fill, attrs = '') {
    return poly(circlePoints(x, y, z, radius), fill, attrs);
  }

  function tint(hex, factor) {
    return '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255,
      Math.round(parseInt(hex.slice(i, i + 2), 16) * factor),
    )).toString(16).padStart(2, '0')).join('');
  }

  function box(x, y, z, w, d, h, material = 'concrete') {
    const palette = Array.isArray(material) ? material : COLORS[material];
    const x0 = x - w / 2, x1 = x + w / 2;
    const y0 = y - d / 2, y1 = y + d / 2, z1 = z + h;
    return poly([[x1, y0, z], [x1, y1, z], [x1, y1, z1], [x1, y0, z1]], palette[0])
      + poly([[x0, y1, z], [x1, y1, z], [x1, y1, z1], [x0, y1, z1]], palette[1])
      + poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], palette[2]);
  }

  function cylinder(x, y, z, r, h, material = 'concrete', n = 40, upperRadius = r) {
    const palette = Array.isArray(material) ? material : COLORS[material];
    const faces = [];
    for (let i = 0; i < n; i++) {
      const a = TAU * i / n, b = TAU * (i + 1) / n, m = (a + b) / 2;
      const normal = .6 * Math.cos(m) + .8 * Math.sin(m);
      if (normal < 0) continue;
      const color = tint(palette[1], .84 + .16 * Math.sin(m) - .10 * Math.cos(m));
      faces.push([normal, poly([
        [x + r * Math.cos(a), y + r * Math.sin(a), z],
        [x + r * Math.cos(b), y + r * Math.sin(b), z],
        [x + upperRadius * Math.cos(b), y + upperRadius * Math.sin(b), z + h],
        [x + upperRadius * Math.cos(a), y + upperRadius * Math.sin(a), z + h],
      ], color, `stroke="${color}" stroke-width=".3" stroke-linejoin="round"`)]);
    }
    return faces.sort((a, b) => a[0] - b[0]).map(face => face[1]).join('')
      + disc(x, y, z + h, upperRadius, palette[2]);
  }

  function orientedBox(x, y, z, length, width, height, angle, material = 'steel') {
    const palette = COLORS[material];
    const c = Math.cos(angle), s = Math.sin(angle);
    const local = (u, v, zz) => [x + c * u - s * v, y + s * u + c * v, zz];
    const vertices = [
      [-length / 2, -width / 2], [length / 2, -width / 2],
      [length / 2, width / 2], [-length / 2, width / 2],
    ];
    const normals = [[s, -c], [c, s], [-s, c], [-c, -s]];
    const surfaces = [];
    for (let i = 0; i < 4; i++) {
      const a = vertices[i], b = vertices[(i + 1) % 4];
      const n = normals[i][0] * .6 + normals[i][1] * .8;
      if (n <= 0) continue;
      surfaces.push([n, poly([
        local(...a, z), local(...b, z), local(...b, z + height), local(...a, z + height),
      ], normals[i][1] > .45 ? palette[1] : palette[0])]);
    }
    return surfaces.sort((a, b) => a[0] - b[0]).map(surface => surface[1]).join('')
      + poly(vertices.map(([u, v]) => local(u, v, z + height)), palette[2]);
  }

  function shadow(x, y, w, d, height, opacity = .12) {
    const ox = height * .47, oy = height * .38;
    return poly([
      [x - w / 2, y - d / 2, .14], [x + w / 2, y - d / 2, .14],
      [x + w / 2 + ox, y - d / 2 + oy, .14],
      [x + w / 2 + ox, y + d / 2 + oy, .14],
      [x - w / 2 + ox, y + d / 2 + oy, .14], [x - w / 2, y + d / 2, .14],
    ], '#53624b', `opacity="${opacity}"`);
  }

  function railing(x1, y1, x2, y2, z, h = 4.1, color = '#b88073', spacing = 6) {
    let result = line([[x1, y1, z + h], [x2, y2, z + h]], color, 1.35);
    result += line([[x1, y1, z + h * .45], [x2, y2, z + h * .45]], color, 1);
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / spacing));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      result += line([[x, y, z], [x, y, z + h]], color, 1.15);
    }
    return result;
  }

  function handwheel(x, y, z, radius = 1.5) {
    let result = line(circlePoints(x, y, z, radius, 28), '#d9e1cf', .9);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU;
      result += line([[x, y, z], [x + Math.cos(a) * radius, y + Math.sin(a) * radius, z]], '#c4d0bd', .8);
    }
    result += cylinder(x, y, z - .7, .3, .85, 'steel', 10);
    return result;
  }

  function makeScene() {
    const timings = [];
    const layers = [];
    const piece = (markup, delay = 0, duration = 450, rise = 14) => {
      const id = timings.length;
      timings.push({ delay, duration, rise });
      return `<g class="piece" data-timing="${id}">${markup}</g>`;
    };
    const addLayer = (markup, depth) => layers.push({ markup, depth });

    const ground = [[-128, -136, 0], [127, -136, 0], [127, 146, 0], [-128, 146, 0]];
    const tanks = [
      { x: -62, y: -24, r: 43, h: 16.2, water: 7.2, angle: 100, shift: 0 },
      { x: 62, y: -27, r: 41, h: 16.2, water: 7.2, angle: 40, shift: 100 },
      { x: -18, y: 80, r: 58, h: 18, water: 8.2, angle: 110, shift: 160 },
    ];
    const defs = `<defs>
      <radialGradient id="wtp-water" cx=".3" cy=".2" r=".95">
        <stop stop-color="#77978a"/><stop offset=".5" stop-color="#526f63"/><stop offset="1" stop-color="#344f48"/>
      </radialGradient>
      <filter id="wtp-soft-shadow" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="15"/></filter>
      <clipPath id="wtp-ground-clip"><polygon points="${pts(ground)}"/></clipPath>
    </defs>`;

    addLayer(piece('<ellipse cx="646" cy="466" rx="374" ry="160" fill="#4b593f" opacity=".13" filter="url(#wtp-soft-shadow)"/>', 0, 650, 0), -10000);

    let terrain = box(-.5, 5, -4.2, 255, 282, 4.2, 'stone');
    terrain += poly(ground, '#b5c79d');
    terrain += poly([[-121, -129, .06], [120, -129, .06], [120, 139, .06], [-121, 139, .06]], '#acbf92');
    terrain += poly([[-126, -116, .09], [26, -116, .09], [26, -102, .09], [-114, -102, .09], [-114, 47, .09], [-126, 47, .09]], '#7a8879');
    addLayer(piece(terrain, 60, 570, 7), -9999);

    let paths = poly([[-18, -93, .16], [20, -93, .16], [20, -32, .16], [48, 9, .16], [104, 51, .16], [103, 93, .16], [83, 96, .16], [86, 57, .16], [20, 17, .16], [-13, 12, .16], [-18, -37, .16]], '#758476');
    for (const t of tanks) {
      paths += disc(t.x, t.y, .17, t.r + 6.4, '#758476');
      paths += line(circlePoints(t.x, t.y, .2, t.r + 6.4), '#c2cdb2', .9, .75);
    }
    paths += poly([[74, 64, .18], [113, 64, .18], [113, 83, .18], [74, 83, .18]], '#788778');
    addLayer(piece(paths, 200, 600, 0), -9998);

    let cast = shadow(0, -103, 48, 30, 26, .13)
      + shadow(1, -5, 18, 14, 9, .1)
      + shadow(83, 70, 24, 12, 8, .1);
    tanks.forEach(t => {
      cast += disc(t.x + t.h * .27, t.y + t.h * .2, .22, t.r + .6, '#465742', 'opacity=".17"');
    });
    addLayer(piece(`<g clip-path="url(#wtp-ground-clip)">${cast}</g>`, 330, 1050, 0), -9997);

    function fence() {
      let result = '';
      for (let i = 0; i < 22; i++) {
        const x = -120 + i * 10.6;
        let bay = box(x + 5.1, -132, .3, 10.2, .55, 8.8, 'white');
        bay += box(x, -132, .3, .75, .85, 10.0, 'steel');
        for (let j = 1; j < 8; j++) {
          bay += line([[x + j * 1.3, -131.69, .6], [x + j * 1.3, -131.69, 8.9]], '#a7bba6', .4, .47);
        }
        bay += line([[x, -131.64, 3.1], [x + 10.5, -131.64, 3.1]], '#b7c8b1', .8);
        result += piece(bay, 1610 + i * 14, 440, 8);
      }
      for (let i = 0; i < 12; i++) {
        const y = -131 + i * 10.4;
        let bay = box(-124, y + 5.1, .3, .55, 10.2, 8.8, 'white');
        bay += box(-124, y, .3, .85, .75, 10.0, 'steel');
        for (let j = 1; j < 8; j++) {
          bay += line([[-123.69, y + j * 1.3, .6], [-123.69, y + j * 1.3, 8.9]], '#9eb49e', .4, .5);
        }
        result += piece(bay, 1650 + i * 18, 440, 8);
      }
      return result;
    }
    addLayer(fence(), -9000);

    function serviceBuilding() {
      const x = 0, y = -103, w = 48, d = 30, h = 26;
      let result = piece(box(x, y, .3, w + 2, d + 2, 1.5, 'concrete'), 260, 470, 9);
      for (let row = 0; row < 3; row++) {
        const z = 1.8 + row * (h - 1.8) / 3, height = (h - 1.8) / 3;
        let wall = box(x, y, z, w, d, height, 'green');
        for (let xx = -23; xx < 24; xx += 1.3) {
          wall += line([[xx, -87.96, z], [xx, -87.96, z + height]], '#9bb79a', .5, .25);
        }
        for (let yy = -117; yy < -88; yy += 1.3) {
          wall += line([[24.04, yy, z], [24.04, yy, z + height]], '#9bb79a', .45, .21);
        }
        result += piece(wall, 570 + row * 300, 450, 17);
      }
      let door = poly([[-16, -87.91, 1.8], [-7.5, -87.91, 1.8], [-7.5, -87.91, 19.5], [-16, -87.91, 19.5]], '#294e40');
      door += line([[-8.9, -87.84, 9.6], [-8.9, -87.84, 11.0]], '#b9c7ad', 1.1);
      door += poly([[-17, -88.0, 20.8], [-6.3, -88.0, 20.8], [-6.3, -84.3, 19.0], [-17, -84.3, 19.0]], '#507e61');
      result += piece(door, 1550, 430, 10);
      const roof = poly([[-26, -120, 28.8], [26, -120, 28.8], [26, -85.8, 26.7], [-26, -85.8, 26.7]], '#eff1e5')
        + poly([[26, -120, 28.8], [26, -85.8, 26.7], [26, -85.8, 26.05], [26, -120, 28.15]], '#b5c4b7')
        + poly([[-26, -85.8, 26.7], [26, -85.8, 26.7], [26, -85.8, 26.05], [-26, -85.8, 26.05]], '#d1ddcd');
      let seams = '';
      for (let xx = -23; xx < 26; xx += 4.9) {
        seams += line([[xx, -119.5, 28.85], [xx, -86.2, 26.78]], '#acbeb0', .65, .4);
      }
      result += piece(roof + seams, 1840, 470, 24);
      return result;
    }
    addLayer(serviceBuilding(), depthAt(0, -103));

    function basin(t) {
      const { x, y, r, h, water, shift } = t;
      const inner = r - 2.7;
      const n = 80;
      let result = piece(cylinder(x, y, .3, r + .8, 1.5, 'concrete', 72), 210 + shift, 470, 9);
      const innerArcs = [], outerArcs = [], rims = [];
      for (let i = 0; i < n; i++) {
        const a = TAU * i / n, b = TAU * (i + 1) / n, m = (a + b) / 2;
        const normal = Math.cos(m) * .6 + Math.sin(m) * .8;
        const point = (radius, angle, z) => [x + radius * Math.cos(angle), y + radius * Math.sin(angle), z];
        if (normal < 0) {
          innerArcs.push({ a, b, m, point });
        } else {
          outerArcs.push({ a, b, m, point });
        }
        rims.push({ a, b, m, point });
      }

      for (let row = 0; row < 3; row++) {
        const z = 1.8 + row * (h - 1.8) / 3;
        const z1 = 1.8 + (row + 1) * (h - 1.8) / 3;
        for (let section = 0; section < 5; section++) {
          let wall = '';
          innerArcs.slice(section * 8, (section + 1) * 8).forEach(({ a, b, m, point }) => {
            const color = tint('#c1cab7', .82 - .12 * Math.sin(m) + .09 * Math.cos(m));
            wall += poly([point(inner, a, z), point(inner, b, z), point(inner, b, z1), point(inner, a, z1)], color, `stroke="${color}" stroke-width=".35"`);
          });
          result += piece(wall, 490 + shift + row * 265 + section * 28, 450, 12);
        }
      }

      let surface = disc(x, y, water, inner - .02, 'url(#wtp-water)');
      surface += line(circlePoints(x, y, water + .03, inner - .45, 80), '#c4d5b8', .65, .23);
      for (let i = 0; i < 3; i++) {
        surface += line(circlePoints(x, y, water + .05, inner * (.47 + i * .18), 28, .28 + i * .27, 1.92 + i * .2), '#bed1b8', .72, .14);
      }
      result += piece(surface, 1470 + shift, 650, 0);

      const well = r * .19;
      let hub = cylinder(x, y, water - .1, well, 1.55, ['#6f8372', '#a7b5a1', '#80927a'], 48);
      hub += line(circlePoints(x, y, water + 1.47, well, 56), '#d8e1ca', 1.05, .92);
      for (let yy = -well + 1.4; yy < well; yy += 2.1) {
        const half = Math.sqrt(Math.max(0, well * well - yy * yy)) - .5;
        hub += line([[x - half, y + yy, water + 1.48], [x + half, y + yy, water + 1.48]], '#aebfa1', .5, .38);
      }
      hub += box(x, y, water + 1.45, 3.9, 3.9, h - water - 1.0, 'concrete');
      hub += cylinder(x, y, h + .45, 2.55, 1.1, 'steel', 24);
      result += piece(hub, 1620 + shift, 450, 15);

      for (let row = 0; row < 3; row++) {
        const z = 1.8 + row * (h - 1.8) / 3;
        const z1 = 1.8 + (row + 1) * (h - 1.8) / 3;
        for (let section = 0; section < 5; section++) {
          let wall = '';
          outerArcs.slice(section * 8, (section + 1) * 8).forEach(({ a, b, m, point }) => {
            const color = tint('#c8cfbb', .86 + .14 * Math.sin(m) - .11 * Math.cos(m));
            wall += poly([point(r, a, z), point(r, b, z), point(r, b, z1), point(r, a, z1)], color, `stroke="${color}" stroke-width=".35"`);
            if (row === 1) {
              wall += line([point(r + .03, a, z + 1.5), point(r + .03, b, z + 1.5)], '#72816d', 1.1, .7);
            }
          });
          result += piece(wall, 540 + shift + row * 265 + section * 27, 450, 13);
        }
      }

      for (let section = 0; section < 10; section++) {
        let coping = '';
        rims.slice(section * 8, (section + 1) * 8).forEach(({ a, b, point }) => {
          coping += poly([point(r + .18, a, h), point(r + .18, b, h), point(inner - .1, b, h), point(inner - .1, a, h)], '#e0e8db', 'stroke="#e0e8db" stroke-width=".3"');
          coping += line([point(r + .18, a, h), point(r + .18, b, h)], '#eaf0e3', .65, .8);
        });
        result += piece(coping, 1480 + shift + section * 24, 420, 11);
      }

      const angle = t.angle * Math.PI / 180;
      const local = (u, v, z) => [x + Math.cos(angle) * u - Math.sin(angle) * v, y + Math.sin(angle) * u + Math.cos(angle) * v, z];
      let braces = '';
      for (const a of [.2, 2.3, 4.5]) {
        braces += line([[x, y, h + .45], [x + Math.cos(a) * well * .9, y + Math.sin(a) * well * .9, water + 1.6]], '#c1d0b8', .75, .95);
      }
      result += piece(braces, 2070 + shift, 360, 5);

      const start = -r * .10, end = r + 2.4, width = r > 50 ? 5.5 : 4.9;
      const deckZ = h + .6;
      const length = end - start;
      const center = local((start + end) / 2, 0, deckZ);
      const farSign = (-Math.sin(angle) * .6 + Math.cos(angle) * .8) > 0 ? -1 : 1;

      function bridgeRail(side) {
        const v = side * (width / 2 + .15);
        let rail = line([local(start, v, deckZ + 5.15), local(end, v, deckZ + 5.15)], '#d7e1cd', 1.8);
        rail += line([local(start, v, deckZ + 1.1), local(end, v, deckZ + 1.1)], '#9eb59f', 1.65);
        const count = r > 50 ? 7 : 6;
        for (let j = 0; j <= count; j++) {
          const u = start + length * j / count;
          rail += line([local(u, v, deckZ + .5), local(u, v, deckZ + 5.15)], '#c9d8c0', 1.6);
          if (j < count) {
            const next = start + length * (j + 1) / count;
            rail += line([local(u, v, deckZ + (j % 2 ? 5.0 : 1.2)), local(next, v, deckZ + (j % 2 ? 1.2 : 5.0))], '#adbfaa', 1.35);
          }
        }
        return rail;
      }

      result += piece(bridgeRail(farSign), 2180 + shift, 410, 17);
      let bridge = orientedBox(center[0], center[1], deckZ - .6, length, width + .65, 1.0, angle, 'steel');
      bridge += orientedBox(center[0], center[1], deckZ + .4, length - .4, width - .65, .32, angle, 'deck');
      for (let u = start + .6; u < end; u += 1.3) {
        bridge += line([local(u, -width / 2 + .4, deckZ + .74), local(u, width / 2 - .4, deckZ + .74)], '#b6d9b9', .5, .45);
      }
      bridge += line([local(start, -width / 2, deckZ + .79), local(end, -width / 2, deckZ + .79)], '#e0e9d4', 1.15);
      bridge += line([local(start, width / 2, deckZ + .79), local(end, width / 2, deckZ + .79)], '#c6d7bf', 1.15);
      result += piece(bridge, 1880 + shift, 490, 27);
      result += piece(bridgeRail(-farSign), 2220 + shift, 410, 18);

      const cabinet = local(.5, farSign * (width / 2 + .7), deckZ + .8);
      let electrical = box(cabinet[0], cabinet[1], cabinet[2], 2.8, 2.1, 6.1, 'white');
      electrical += line([[cabinet[0] + 1.05, cabinet[1] + 1.08, cabinet[2] + 2.5], [cabinet[0] + 1.05, cabinet[1] + 1.08, cabinet[2] + 3.5]], '#8eaa92', .8);
      const motor = local(end - 2.4, -farSign * (width / 2 + 1.0), deckZ - .2);
      electrical += box(motor[0], motor[1], motor[2], 2.8, 2.4, 1.8, 'blue');
      electrical += cylinder(motor[0], motor[1], motor[2] + 1.8, .85, 1.7, 'blue', 12);
      const brush = local(end - .4, -farSign * (width / 2 + .6), h - 1.0);
      electrical += cylinder(brush[0], brush[1], brush[2], 1.2, 1.15, 'yellow', 16, 1.4);
      result += piece(electrical, 2270 + shift, 360, 11);

      let ladder = '';
      const lower = r + 8.1, upper = r + 1.8, halfWidth = 1.7;
      for (const v of [-halfWidth, halfWidth]) {
        ladder += line([local(lower, v, .55), local(upper, v, deckZ + .55)], '#cbdac3', 1.7);
      }
      for (let i = 0; i < 12; i++) {
        const t1 = i / 11;
        const u = lower + (upper - lower) * t1;
        const zz = .7 + (deckZ - .1) * t1;
        const step = local(u, 0, zz);
        ladder += orientedBox(step[0], step[1], zz, .8, 3.6, .24, angle, 'steel');
        ladder += line([local(u + .3, -halfWidth, zz + .26), local(u + .3, halfWidth, zz + .26)], '#e2ead7', 1.0);
      }
      result += piece(ladder, 2350 + shift, 350, 13);
      return result;
    }

    tanks.forEach(t => addLayer(basin(t), depthAt(t.x, t.y)));

    function valvePlatform(x, y, w, d, height, shift = 0, valves = 2) {
      const x0 = x - w / 2, x1 = x + w / 2;
      const y0 = y - d / 2, y1 = y + d / 2;
      let result = piece(box(x, y, .3, w + .7, d + .7, height - .3, 'concrete'), 1250 + shift, 440, 12);

      let far = railing(x0, y0, x1, y0, height + .7)
        + railing(x0, y0, x0, y1, height + .7);
      result += piece(far, 2140 + shift, 380, 14);
      let deck = box(x, y, height, w + .3, d + .3, .7, 'red');
      for (let xx = x0 + .7; xx < x1; xx += 1.1) {
        deck += line([[xx, y0 + .4, height + .73], [xx, y1 - .4, height + .73]], '#715e50', .55, .68);
      }
      for (let yy = y0 + .9; yy < y1; yy += 1.8) {
        deck += line([[x0 + .4, yy, height + .75], [x1 - .4, yy, height + .75]], '#d5a68b', .45, .65);
      }
      result += piece(deck, 1900 + shift, 430, 17);

      let equipment = '';
      for (let i = 0; i < valves; i++) {
        const xx = x + (i - (valves - 1) / 2) * 5.4;
        equipment += cylinder(xx, y, height + .73, .55, 4.1, 'steel', 14);
        equipment += cylinder(xx, y, height + 4.45, 1.0, .6, 'white', 16);
        equipment += handwheel(xx, y, height + 5.5, 1.55);
      }
      result += piece(equipment, 2210 + shift, 360, 10);
      result += piece(railing(x0, y1, x1, y1, height + .7)
        + railing(x1, y0, x1, y - 2.9, height + .7)
        + railing(x1, y + 2.9, x1, y1, height + .7), 2180 + shift, 380, 14);

      let stairs = '';
      const count = 6, run = 9.4;
      for (let i = 0; i < count; i++) {
        const xx = x1 + run - i * run / count;
        const zz = .55 + i * height / count;
        stairs += box(xx, y, zz, 1.7, 5.2, .35, 'red');
      }
      for (const yy of [y - 2.75, y + 2.75]) {
        stairs += line([[x1, yy, height + 1.0], [x1 + run + .9, yy, .55]], '#ae7567', 1.6);
        stairs += line([[x1, yy, height + 4.8], [x1 + run + .9, yy, 4.4]], '#c68b79', 1.45);
        for (let i = 0; i <= 3; i++) {
          const t = i / 3;
          const xx = x1 + t * (run + .9), zz = height + 1 - t * (height + .45);
          stairs += line([[xx, yy, zz], [xx, yy, zz + 3.8]], '#bd8170', 1.2);
        }
      }
      result += piece(stairs, 2260 + shift, 390, 12);
      return result;
    }

    addLayer(valvePlatform(1, -5, 18, 14, 7, 0, 2), depthAt(1, -5));
    addLayer(valvePlatform(83, 70, 24, 12, 4.1, 120, 1), depthAt(83, 70));
    addLayer(valvePlatform(0, -63, 15, 10, 4.2, -90, 1), depthAt(0, -63));

    function pole(x, y, height) {
      let result = cylinder(x, y, .2, .72, .65, 'concrete', 10);
      result += line([[x, y, .8], [x, y, height]], '#a8bba3', 1.15);
      result += box(x + .9, y, height - 1.7, 2.0, .85, 2.9, 'white');
      result += line([[x, y, height - .2], [x + .8, y, height - .2]], '#8fa78d', .8);
      return result;
    }
    [[-99, -48, 35], [16, -40, 29], [-56, 133, 31]].forEach(([x, y, h], i) => {
      addLayer(piece(pole(x, y, h), 2300 + i * 65, 350, 9), depthAt(x + 1, y));
    });

    let pipes = box(88, 26, .2, 14, 9, .7, 'stone');
    for (const x of [85, 91]) {
      pipes += cylinder(x, 26, .9, .7, 3.9, 'steel', 12);
      pipes += box(x, 26, 4.0, 1.8, 3.8, 1.4, 'steel');
      pipes += handwheel(x, 26, 6.2, 1.1);
    }
    pipes += disc(98, 26, .3, 2.2, '#669a80');
    pipes += line(circlePoints(98, 26, .32, 2.2, 32), '#aac9a8', .7);
    addLayer(piece(pipes, 2400, 390, 9), depthAt(98, 30));

    [[-109, 51, 2.1], [111, -100, 2.4], [102, 111, 2.3], [-86, -117, 2.0], [49, 124, 2.3]].forEach(([x, y, r], i) => {
      const shrub = cylinder(x, y, .2, r * .8, 1.7, 'grass', 12, r)
        + cylinder(x, y, 1.9, r, 1.7, 'grass', 12, .45);
      addLayer(piece(shrub, 2440 + i * 28, 330, 5), depthAt(x + r, y + r));
    });

    layers.sort((a, b) => a.depth - b.depth);
    return { defs, markup: layers.map(layer => layer.markup).join(''), timings };
  }

  class WaterTreatmentPlant extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._initialized = false;
      this._animations = [];
      this._observer = null;
      this._timer = null;
      this._motion = matchMedia('(prefers-reduced-motion: reduce)');
      this._motionChange = () => {
        if (this._motion.matches) this.finish();
      };
    }

    connectedCallback() {
      if (!this._initialized) this._build();
      this._motion.addEventListener('change', this._motionChange);
      if (this._motion.matches) {
        this.finish();
        return;
      }
      if ('IntersectionObserver' in window) {
        this._observer = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) this.play();
        }, { threshold: .12 });
        this._observer.observe(this);
      } else {
        this.play();
      }
    }

    disconnectedCallback() {
      this._observer?.disconnect();
      this._observer = null;
      this._motion.removeEventListener('change', this._motionChange);
      this._stop();
    }

    _build() {
      const scene = makeScene();
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;width:100%;contain:content;isolation:isolate;line-height:0}
        svg{display:block;width:100%;height:auto;overflow:visible}
        .piece{opacity:0;transform-box:view-box}
        @media(prefers-reduced-motion:reduce){.piece{opacity:1!important;transform:none!important}}
      </style>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 820" width="1280" height="820" role="img" aria-labelledby="wtp-title wtp-description">
        <title id="wtp-title">Строительство очистных сооружений</title>
        <desc id="wtp-description">Трёхсекундная изометрическая анимация по фотографии комплекса: три открытых круглых резервуара с водой, металлические мостики с зелёным настилом, лестницы, площадки с красными ограждениями и зелёный служебный корпус. Архитектурные и инженерные детали стилизованы.</desc>
        ${scene.defs}${scene.markup}
      </svg>`;
      this._entries = [...this.shadowRoot.querySelectorAll('.piece')].map(node => ({
        node, ...scene.timings[Number(node.dataset.timing)],
      }));
      this._initialized = true;
    }

    _stop() {
      clearTimeout(this._timer);
      this._timer = null;
      this._animations.forEach(animation => animation.cancel());
      this._animations = [];
    }

    play() {
      if (!this._initialized) this._build();
      this._observer?.disconnect();
      this._observer = null;
      if (this._motion.matches) {
        this.finish();
        return;
      }
      this._stop();
      const origin = document.timeline.currentTime;
      this._entries.forEach(({ node, delay, duration, rise }) => {
        node.style.opacity = '0';
        const animation = node.animate([
          { opacity: 0, transform: `translateY(${-rise}px)` },
          { opacity: 1, transform: 'translateY(0)' },
        ], { delay, duration, easing: EASING, fill: 'both' });
        if (origin !== null) animation.startTime = origin;
        this._animations.push(animation);
      });
      this._timer = setTimeout(() => {
        this.finish();
        this.dispatchEvent(new CustomEvent('treatment-plant-built', { bubbles: true, composed: true }));
      }, DURATION);
    }

    finish() {
      if (!this._initialized) this._build();
      this._stop();
      this._entries.forEach(({ node }) => {
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
      });
    }
  }

  customElements.define(TAG, WaterTreatmentPlant);
})();
