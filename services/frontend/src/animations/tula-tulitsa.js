(() => {
  'use strict';

  const TAG = 'tula-tulitsa';
  if (customElements.get(TAG)) return;

  const DURATION = 3000;
  const EASING = 'cubic-bezier(.22,.75,.23,1)';
  const COLORS = {
    stone: ['#c3c2b4', '#dddcce', '#ede9dd'],
    concrete: ['#9aa6a1', '#bfc8bd', '#d9ddd1'],
    white: ['#bcc8c5', '#e8ede5', '#fbfbef'],
    steel: ['#71867e', '#a1b2a4', '#d0dacc'],
    roof: ['#afb7ac', '#c7cfc1', '#e0e4d7'],
    dark: ['#303f3e', '#485653', '#65716a'],
    blue: ['#267e97', '#43acc3', '#7bc7d1'],
    green: ['#55735a', '#78956b', '#a0b18a'],
    wood: ['#9c8866', '#b9a17a', '#d3bf94'],
  };

  const p = (x, y, z = 0) => [
    640 + (x * .8 - y * .6) * 2.5,
    450 + (x * .3 + y * .4 - z * .8660254) * 2.5,
  ];
  const pts = vertices => vertices.map(v => p(...v).map(n => n.toFixed(2)).join(',')).join(' ');
  const depthAt = (x, y) => x * .6 + y * .8;

  function poly(vertices, fill, attrs = '') {
    return `<polygon points="${pts(vertices)}" fill="${fill}" ${attrs}/>`;
  }

  function line(vertices, color = '#7c8b7b', width = .7, opacity = 1) {
    return `<polyline points="${pts(vertices)}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  function box(x, y, z, w, d, h, material = 'white') {
    const [dark, light, top] = Array.isArray(material) ? material : COLORS[material];
    const x0 = x - w / 2, x1 = x + w / 2;
    const y0 = y - d / 2, y1 = y + d / 2, z1 = z + h;
    return poly([[x1, y0, z], [x1, y1, z], [x1, y1, z1], [x1, y0, z1]], dark)
      + poly([[x0, y1, z], [x1, y1, z], [x1, y1, z1], [x0, y1, z1]], light)
      + poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], top);
  }

  const onFace = (x, y, z, u, v, axis) => axis === 'x'
    ? [x + u, y, z + v] : [x, y + u, z + v];

  function face(x, y, z, w, h, axis, fill) {
    return poly([
      onFace(x, y, z, -w / 2, 0, axis), onFace(x, y, z, w / 2, 0, axis),
      onFace(x, y, z, w / 2, h, axis), onFace(x, y, z, -w / 2, h, axis),
    ], fill);
  }

  function glass(x, y, z, w, h, axis = 'x', columns = 2, rows = 1) {
    let result = face(x, y, z, w, h, axis, '#273a39');
    result += face(x, y, z + .26, w - .52, h - .52, axis, `url(#tulitsa-glass-${axis})`);
    for (let i = 1; i < columns; i++) {
      const u = -w / 2 + w * i / columns;
      result += line([onFace(x, y, z, u, .2, axis), onFace(x, y, z, u, h - .2, axis)], '#304541', .8);
    }
    for (let i = 1; i < rows; i++) {
      result += line([
        onFace(x, y, z, -w / 2 + .2, h * i / rows, axis),
        onFace(x, y, z, w / 2 - .2, h * i / rows, axis),
      ], '#354a44', .75);
    }
    result += line([
      onFace(x, y, z, -w * .36, .4, axis), onFace(x, y, z, w * .22, h - .4, axis),
    ], '#e3e9d8', .7, .17);
    result += line([
      onFace(x, y, z, -w / 2, -.18, axis), onFace(x, y, z, w / 2, -.18, axis),
    ], '#869b8c', .8, .8);
    return result;
  }

  function cylinder(x, y, z, radius, height, material = 'steel', n = 12, upperRadius = radius) {
    const palette = COLORS[material];
    const visible = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2;
      const normal = Math.cos((a + b) / 2) * .6 + Math.sin((a + b) / 2) * .8;
      if (normal < 0) continue;
      visible.push([normal, poly([
        [x + radius * Math.cos(a), y + radius * Math.sin(a), z],
        [x + radius * Math.cos(b), y + radius * Math.sin(b), z],
        [x + upperRadius * Math.cos(b), y + upperRadius * Math.sin(b), z + height],
        [x + upperRadius * Math.cos(a), y + upperRadius * Math.sin(a), z + height],
      ], Math.sin((a + b) / 2) > .65 ? palette[1] : palette[0])]);
    }
    return visible.sort((a, b) => a[0] - b[0]).map(item => item[1]).join('')
      + poly(Array.from({ length: n }, (_, i) => [
        x + upperRadius * Math.cos(i / n * Math.PI * 2),
        y + upperRadius * Math.sin(i / n * Math.PI * 2), z + height,
      ]), palette[2]);
  }

  function castShadow(x, y, w, d, h, opacity = .12) {
    const ox = h * .43, oy = h * .4;
    return poly([
      [x - w / 2, y - d / 2, .25], [x + w / 2, y - d / 2, .25],
      [x + w / 2 + ox, y - d / 2 + oy, .25],
      [x + w / 2 + ox, y + d / 2 + oy, .25],
      [x - w / 2 + ox, y + d / 2 + oy, .25], [x - w / 2, y + d / 2, .25],
    ], '#53604c', `opacity="${opacity}"`);
  }

  function textOnFront(text, x, y, z, width, fontSize, fill) {
    const [tx, ty] = p(x, y, z);
    return `<text transform="matrix(2 .75 0 2.165 ${tx.toFixed(2)} ${ty.toFixed(2)})" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="600" fill="${fill}" textLength="${width}" lengthAdjust="spacingAndGlyphs">${text}</text>`;
  }

  function wheel(x, y, z, radius = .85) {
    let result = poly(Array.from({ length: 16 }, (_, i) => [
      x + Math.cos(i / 16 * Math.PI * 2) * radius, y,
      z + Math.sin(i / 16 * Math.PI * 2) * radius,
    ]), '#35413c');
    result += poly(Array.from({ length: 12 }, (_, i) => [
      x + Math.cos(i / 12 * Math.PI * 2) * radius * .47, y + .03,
      z + Math.sin(i / 12 * Math.PI * 2) * radius * .47,
    ]), '#abb9a7');
    return result;
  }

  function car(x, y, palette) {
    let result = castShadow(x, y, 8.7, 4.4, 3.5, .13);
    for (const offset of [-2.55, 2.55]) result += wheel(x + offset, y - 2.05, 1.0);
    result += box(x, y, .95, 8.6, 4.15, 1.35, palette);
    result += poly([[x - 2.9, y + 1.9, 2.3], [x + 2.5, y + 1.9, 2.3], [x + 1.7, y + 1.45, 3.8], [x - 2.0, y + 1.45, 3.8]], '#536f68');
    result += poly([[x + 2.5, y - 1.9, 2.3], [x + 2.5, y + 1.9, 2.3], [x + 1.7, y + 1.45, 3.8], [x + 1.7, y - 1.45, 3.8]], '#748d81');
    result += poly([[x - 2.0, y - 1.45, 3.8], [x + 1.7, y - 1.45, 3.8], [x + 1.7, y + 1.45, 3.8], [x - 2.0, y + 1.45, 3.8]], palette[2]);
    result += line([[x - .2, y + 1.9, 2.35], [x - .2, y + 1.45, 3.75]], palette[1], 1.3);
    for (const offset of [-2.55, 2.55]) result += wheel(x + offset, y + 2.10, 1.0);
    result += line([[x + 4.32, y + 1.15, 1.9], [x + 4.32, y + 1.75, 1.9]], '#fff2cd', 1.8);
    result += line([[x + 4.32, y - 1.15, 1.9], [x + 4.32, y - 1.75, 1.9]], '#fff2cd', 1.8);
    return result;
  }

  function bus(x, y) {
    let result = castShadow(x, y, 25, 7.2, 7, .13);
    result += box(x, y, 1.05, 25, 7, 5.8, 'blue');
    result += glass(x - .8, y + 3.53, 3.65, 21.8, 2.75, 'x', 8);
    result += glass(x + 12.53, y, 2.55, 6.3, 3.9, 'y', 2);
    result += box(x, y, 6.85, 24.5, 6.6, .45, 'blue');
    result += box(x - 1, y, 7.3, 8, 4, .5, 'steel');
    for (const offset of [-8.0, 8.0]) result += wheel(x + offset, y + 3.56, 1.45, 1.4);
    result += face(x + 8.6, y + 3.55, 1.3, 2.1, 5.2, 'x', '#314945');
    result += line([[x + 12.55, y - 2.4, 1.8], [x + 12.55, y + 2.4, 1.8]], '#e3e7d4', 1.4);
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

    const ground = [[-165, -122, 0], [166, -122, 0], [166, 155, 0], [-165, 155, 0]];
    const defs = `<defs>
      <linearGradient id="tulitsa-glass-x" x1="0" y1="0" x2=".8" y2="1">
        <stop stop-color="#7f9991"/><stop offset=".5" stop-color="#506d65"/><stop offset="1" stop-color="#304943"/>
      </linearGradient>
      <linearGradient id="tulitsa-glass-y" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#607f76"/><stop offset="1" stop-color="#273e3b"/>
      </linearGradient>
      <filter id="tulitsa-soft-shadow" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="15"/></filter>
      <clipPath id="tulitsa-ground-clip"><polygon points="${pts(ground)}"/></clipPath>
    </defs>`;

    addLayer(piece('<ellipse cx="651" cy="465" rx="387" ry="169" fill="#46533d" opacity=".13" filter="url(#tulitsa-soft-shadow)"/>', 0, 650, 0), -10000);

    let base = box(.5, 16.5, -4.2, 331, 277, 4.2, 'stone');
    base += poly(ground, '#b9c6a5');
    base += poly([[-154, -114, .08], [153, -114, .08], [153, 141, .08], [-154, 141, .08]], '#c2c9b9');
    base += poly([[-154, -9, .12], [153, -9, .12], [153, 141, .12], [-154, 141, .12]], '#9fa99b');
    base += poly([[-159, 141, .16], [158, 141, .16], [158, 147, .16], [-159, 147, .16]], '#e0dfcb');
    base += poly([[-154, 119, .18], [-144, 119, .18], [-144, 136, .18], [-154, 136, .18]], '#a6b88d');
    addLayer(piece(base, 60, 560, 7), -9999);

    let pavement = poly([[-85, 69, .22], [7, 69, .22], [7, 77, .22], [-85, 77, .22]], '#d8d7c3');
    pavement += poly([[4, 41, .22], [128, 41, .22], [128, 48, .22], [4, 48, .22]], '#dbdbc7');
    pavement += poly([[132, -97, .22], [136, -97, .22], [136, 138, .22], [132, 138, .22]], '#dedfcb');
    pavement += poly([[-8, 82, .23], [4, 82, .23], [4, 128, .23], [-8, 128, .23]], '#a8b88c');
    pavement += poly([[22, 135, .23], [119, 135, .23], [119, 141, .23], [22, 141, .23]], '#a5b68b');
    for (let y = 84; y < 129; y += 3.8) {
      pavement += line([[-8, y, .27], [4, y, .27]], '#d0d6bf', .8, .5);
    }
    addLayer(piece(pavement, 230, 520, 0), -9998);

    let markings = '';
    for (const x of [23, 77]) {
      markings += line([[x, 75, .28], [x, 130, .28]], '#e9e8d5', .85);
      for (let y = 75; y <= 130; y += 7.85) {
        markings += line([[x, y, .28], [x + 14, y, .28]], '#e9e8d5', .85);
      }
    }
    markings += line([[137, 4, .28], [137, 133, .28]], '#e9e8d5', .8);
    for (let y = 4; y <= 133; y += 8.6) {
      markings += line([[137, y, .28], [150, y, .28]], '#e9e8d5', .8);
    }
    for (let x = -140; x <= -93; x += 8) {
      markings += line([[x, 89, .28], [x, 103, .28]], '#e9e8d5', .85);
    }
    for (let y = 83; y <= 128; y += 9) {
      markings += line([[57, y, .28], [57, y + 3.6, .28]], '#dfe1ca', .8, .85);
    }
    for (let i = 0; i < 11; i++) {
      markings += poly([[-58 + i * 2.8, 78, .29], [-56.4 + i * 2.8, 78, .29], [-56.4 + i * 2.8, 89, .29], [-58 + i * 2.8, 89, .29]], i % 2 ? '#ded09b' : '#f0ebd3');
    }
    for (let i = 0; i < 7; i++) {
      markings += poly([[43 + i * 2.9, 135, .29], [44.8 + i * 2.9, 135, .29], [44.8 + i * 2.9, 141, .29], [43 + i * 2.9, 141, .29]], '#ede8d1');
    }
    addLayer(piece(markings, 1850, 620, 0), -9997);

    const buildings = [
      { x: -69.5, y: -52.5, w: 157, d: 113, h: 46, shift: 0, type: 'arena' },
      { x: 82, y: -61, w: 104, d: 94, h: 43, shift: 90, type: 'arena-side' },
      { x: -40, y: 43, w: 86, d: 54, h: 12.5, shift: 160, type: 'annex' },
      { x: 65, y: 13, w: 124, d: 56, h: 24, shift: 130, type: 'lobby' },
    ];

    let shadows = buildings.map(b => castShadow(b.x, b.y, b.w, b.d, b.h, b.h > 30 ? .12 : .10)).join('');
    addLayer(piece(`<g clip-path="url(#tulitsa-ground-clip)">${shadows}</g>`, 360, 1430, 0), -9996);

    function rooftop(b) {
      const { x, y, w, d, h, shift, type } = b;
      const x0 = x - w / 2, x1 = x + w / 2;
      const y0 = y - d / 2, y1 = y + d / 2;
      const count = Math.ceil(w / 14);
      let result = '';
      for (let i = 0; i < count; i++) {
        const xx = x0 + (i + .5) * w / count;
        let sheet = box(xx, y, h, w / count + .05, d, 1.0, 'roof');
        sheet += line([[xx - w / count / 2, y0 + .5, h + 1.02], [xx - w / count / 2, y1 - .5, h + 1.02]], '#afbbaa', .5, .58);
        result += piece(sheet, 1670 + shift + i * 29, 420, 20);
      }
      const parapetMaterial = type.startsWith('arena') ? 'white' : 'dark';
      const backEdges = box(x, y0 + .4, h + 1, w + .15, .8, 1.15, parapetMaterial)
        + box(x0 + .4, y, h + 1, .8, d, 1.15, parapetMaterial);
      result += piece(backEdges, 2040 + shift, 350, 10);

      const units = type.startsWith('arena')
        ? [[-.32, -.22, 3.0], [-.08, -.2, 2.0], [.19, -.15, 2.5], [.34, .2, 2.0], [-.3, .27, 1.8]]
        : [[-.31, -.1, 2.4], [-.08, -.2, 1.8], [.21, -.04, 3.3], [.33, .2, 2.4]];
      units.sort((a, c) => depthAt(a[0] * w, a[1] * d) - depthAt(c[0] * w, c[1] * d));
      units.forEach(([u, v, size], i) => {
        const xx = x + u * w, yy = y + v * d;
        let unit = box(xx, yy, h + 1.02, size * 1.7, size * 1.5, .4, 'steel');
        if (i % 2) {
          unit += cylinder(xx, yy, h + 1.42, size * .39, 2.3, 'steel');
          unit += cylinder(xx, yy, h + 3.72, size * .69, .5, 'white');
        } else {
          unit += box(xx, yy, h + 1.42, size * 1.4, size * 1.25, 2.5, 'steel');
          for (let j = 0; j < 3; j++) {
            unit += line([[xx - size * .55, yy + size * .63, h + 2 + j * .54], [xx + size * .55, yy + size * .63, h + 2 + j * .54]], '#7c9280', .55, .8);
          }
        }
        result += piece(unit, 2160 + shift + i * 35, 330, 11);
      });
      const frontEdges = box(x1 - .4, y, h + 1, .8, d, 1.15, parapetMaterial)
        + box(x, y1 - .4, h + 1, w + .15, .8, 1.15, parapetMaterial);
      result += piece(frontEdges, 2070 + shift, 350, 10);
      return result;
    }

    function hall(b) {
      const { x, y, w, d, h, shift, type } = b;
      const x0 = x - w / 2, x1 = x + w / 2;
      const y0 = y - d / 2, y1 = y + d / 2;
      let result = piece(box(x, y, .3, w + 1.5, d + 1.5, 2.1, 'concrete'), 180 + shift, 460, 9);
      const portals = Math.ceil(w / 21);
      for (let i = 0; i <= portals; i++) {
        const xx = x0 + 1.3 + (w - 2.6) * i / portals;
        const columns = box(xx, y0 + 1.4, 2.4, 1.5, 1.5, h - 2.4, 'steel')
          + box(xx, y1 - 1.4, 2.4, 1.5, 1.5, h - 2.4, 'steel');
        result += piece(columns, 400 + shift + i * 25, 460, 18);
        let truss = box(xx, y, h - 1.4, 1.4, d - 2.0, 1.4, 'steel');
        truss += line([[xx, y0 + 1.5, h - 4.3], [xx, y1 - 1.5, h - 4.3]], '#8fa38f', 1.2);
        for (let j = 0; j < 9; j++) {
          const ya = y0 + 1.5 + (d - 3) * j / 9;
          const yb = y0 + 1.5 + (d - 3) * (j + 1) / 9;
          truss += line([[xx, ya, h - (j % 2 ? 1.0 : 4.3)], [xx, yb, h - (j % 2 ? 4.3 : 1.0)]], '#819985', .9);
        }
        result += piece(truss, 750 + shift + i * 34, 430, 23);
      }

      for (const axis of ['y', 'x']) {
        const length = axis === 'x' ? w : d;
        const count = Math.ceil(length / 13);
        const span = length / count;
        for (let row = 0; row < 4; row++) {
          const z = 2.4 + (h - 2.4) * row / 4;
          const height = (h - 2.4) / 4;
          for (let i = 0; i < count; i++) {
            const along = (axis === 'x' ? x0 : y0) + (i + .5) * span;
            const xx = axis === 'x' ? along : x1 - .5;
            const yy = axis === 'x' ? y1 - .5 : along;
            let panel = box(xx, yy, z, axis === 'x' ? span + .03 : 1, axis === 'x' ? 1 : span + .03, height, 'white');
            for (let j = 1; j < 8; j++) {
              const offset = -span / 2 + span * j / 8;
              const fx = axis === 'x' ? xx : x1 + .025;
              const fy = axis === 'x' ? y1 + .025 : yy;
              panel += line([onFace(fx, fy, z, offset, .05, axis), onFace(fx, fy, z, offset, height - .05, axis)], '#9eaFA3', .45, .25);
            }
            result += piece(panel, 820 + shift + row * 185 + i * 12, 410, 14);
          }
        }
      }
      if (type === 'arena') {
        result += piece(glass(x + 13, y1 + .06, 8.8, w * .76, 6.4, 'x', 15), 1610 + shift, 430, 9);
        for (const xx of [x0 + 2.2, x1 - 2.2]) {
          let ladder = line([[xx - .5, y1 + .26, 1.2], [xx - .5, y1 + .26, h + 2.7]], '#829889', .65);
          ladder += line([[xx + .5, y1 + .26, 1.2], [xx + .5, y1 + .26, h + 2.7]], '#829889', .65);
          for (let zz = 2; zz < h + 2; zz += 1.65) {
            ladder += line([[xx - .5, y1 + .28, zz], [xx + .5, y1 + .28, zz]], '#91a290', .6);
          }
          result += piece(ladder, 2220, 360, 6);
        }
      } else {
        result += piece(glass(x1 + .06, y + 6, 16.5, d * .79, 12.4, 'y', 13, 2), 1630 + shift, 430, 9);
      }
      result += rooftop(b);
      return result;
    }

    function lowBuilding(b) {
      const { x, y, w, d, h, shift, type } = b;
      const x1 = x + w / 2, y1 = y + d / 2;
      let result = piece(box(x, y, .3, w + 1.2, d + 1.2, 1.3, 'concrete'), 330 + shift, 420, 9);
      for (let row = 0; row < 3; row++) {
        const height = (h - 1.6) / 3;
        result += piece(box(x, y, 1.6 + row * height, w, d, height, 'dark'), 730 + shift + row * 235, 450, 16);
      }
      if (type === 'lobby') {
        let facade = glass(x, y1 + .045, 1.9, w - 4, 13.6, 'x', 20, 2);
        facade += glass(x1 + .045, y, 1.9, d - 3, 13.6, 'y', 9, 2);
        facade += face(x, y1 + .07, 8.2, w - 3, .46, 'x', '#46564d');
        for (let i = 1; i < 20; i++) {
          const xx = x - w / 2 + w * i / 20;
          facade += line([[xx, y1 + .07, 15.8], [xx, y1 + .07, h - .2]], '#a9b2a0', .55, .18);
        }
        result += piece(facade, 1540 + shift, 430, 10);

        const entrance = 72;
        let doors = glass(entrance, y1 + .14, 1.35, 16.5, 9.2, 'x', 4, 1);
        for (const xx of [entrance - 1.1, entrance + 1.1]) {
          doors += line([[xx, y1 + .19, 4.7], [xx, y1 + .19, 6.4]], '#cbd5bc', .85);
        }
        result += piece(doors, 2110, 390, 7);
        let canopy = box(entrance, y1 + 1.55, 11.5, 35, 3.8, 1.6, 'blue');
        canopy += box(entrance, y1 + 1.5, 13.1, 35.5, 4.1, .28, 'white');
        canopy += textOnFront('ТУЛИЦА', entrance - 7.5, y1 + 3.48, 11.89, 15, 1.08, '#f5f1d9');
        result += piece(canopy, 2280, 460, 16);
        let steps = box(entrance, y1 + 5.3, .25, 38, 5.0, .45, 'concrete');
        steps += box(entrance, y1 + 4.7, .7, 37, 3.6, .4, 'concrete');
        result += piece(steps, 2030, 410, 7);
      } else {
        let facade = '';
        for (let i = 0; i < 9; i++) {
          const xx = x - w / 2 + 5.7 + i * 9.25;
          if (i === 6) {
            facade += glass(xx, y1 + .07, 1.3, 4.6, 8.0, 'x', 2);
          } else {
            facade += glass(xx, y1 + .07, 5.2, i % 3 === 1 ? 2.2 : 4.2, 4.0, 'x', i % 3 === 1 ? 1 : 2);
          }
        }
        for (let i = 0; i < 5; i++) facade += glass(x1 + .06, y - d / 2 + 5.5 + i * 10, 4.7, 4.1, 4.1, 'y', 2);
        result += piece(facade, 1490 + shift, 420, 9);
      }
      result += rooftop(b);
      return result;
    }

    buildings.forEach(b => addLayer(b.type.startsWith('arena') ? hall(b) : lowBuilding(b), depthAt(b.x, b.y)));

    const carColors = {
      ivory: ['#b7c0b2', '#e2e5d7', '#f5f3e3'],
      grey: ['#52665f', '#7c8e81', '#aab8a2'],
      yellow: ['#b79b43', '#dec360', '#f0d787'],
      blue: ['#426a79', '#6c94a0', '#a2b8b5'],
    };
    [
      [30, 80, 'ivory'], [30, 96, 'grey'], [30, 119, 'ivory'],
      [84, 88, 'grey'], [84, 104, 'ivory'], [84, 120, 'blue'],
      [144, 60, 'ivory'], [144, 103, 'yellow'], [143, 25, 'ivory'],
      [-126, 96, 'grey'], [-109, 96, 'ivory'],
    ].forEach(([x, y, color], i) => {
      addLayer(piece(car(x, y, carColors[color]), 2410 + (i % 5) * 42, 320, 12), depthAt(x + 5, y + 3));
    });
    addLayer(piece(bus(-118, 51), 2360, 440, 16), depthAt(-105, 55));

    function lamp(x, y, height = 17) {
      let result = cylinder(x, y, .2, .65, .6, 'concrete', 8);
      result += line([[x, y, .8], [x, y, height]], '#718875', 1.0);
      result += line([[x, y, height], [x + 2.3, y, height + .8]], '#718875', .9);
      result += box(x + 2.4, y, height + .55, 2.1, .85, .45, 'steel');
      return result;
    }
    [[-18, 86], [9, 128], [119, 133], [159, 55], [-143, 116]].forEach(([x, y], i) => {
      addLayer(piece(lamp(x, y), 2430 + i * 28, 350, 8), depthAt(x + 2.5, y));
    });

    [[-159, 28, 4.3], [-158, 74, 4.1], [-149, 129, 3.6], [160, -26, 3.9], [157, 117, 3.5]].forEach(([x, y, r], i) => {
      let tree = castShadow(x, y, r * 2, r * 2, 11, .1);
      tree += cylinder(x, y, .2, .55, 5.6, 'wood', 8);
      tree += cylinder(x, y, 4.4, r * .5, 3.0, 'green', 12, r);
      tree += cylinder(x, y, 7.4, r, 3.0, 'green', 12, r * .7);
      tree += cylinder(x, y, 10.4, r * .7, 2.6, 'green', 12, .35);
      addLayer(piece(tree, 2400 + i * 37, 350, 11), depthAt(x + r, y + r));
    });

    let curb = '';
    for (let i = 0; i < 18; i++) {
      curb += box(26 + i * 5.2, 135.05, .25, 5.15, .9, .6, i % 2 ? 'stone' : 'concrete');
    }
    addLayer(piece(curb, 2360, 390, 4), depthAt(118, 135));

    layers.sort((a, b) => a.depth - b.depth);
    return { defs, markup: layers.map(layer => layer.markup).join(''), timings };
  }

  class TulaTulitsa extends HTMLElement {
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 820" width="1280" height="820" role="img" aria-labelledby="tulitsa-title tulitsa-description">
        <title id="tulitsa-title">Строительство спортивного комплекса «Тулица», Тула</title>
        <desc id="tulitsa-description">Трёхсекундная изометрическая анимация по фотографии: два больших светлых корпуса, тёмная входная часть с остеклением, низкая пристройка, плоские кровли и парковка. Пропорции и архитектурные детали стилизованы.</desc>
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
        this.dispatchEvent(new CustomEvent('tulitsa-built', { bubbles: true, composed: true }));
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

  customElements.define(TAG, TulaTulitsa);
})();
