(() => {
  'use strict';

  const TAG = 'tula-school-37';
  if (customElements.get(TAG)) return;

  const DURATION = 3000;
  const EASING = 'cubic-bezier(.22,.75,.23,1)';
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = {
    stone: ['#c7c4b5', '#e2decf', '#f0ebdc'],
    concrete: ['#9faaa7', '#c4cbc4', '#e0e1d6'],
    white: ['#c5c8be', '#eeeede', '#fffbed'],
    ochre: ['#b78855', '#dca970', '#edc58d'],
    charcoal: ['#424b4a', '#68716c', '#818a80'],
    roof: ['#868f87', '#a6afa5', '#bac2b7'],
    metal: ['#758a85', '#a4b4a6', '#d4dcd0'],
    green: ['#52715a', '#79956c', '#9eaf85'],
  };

  const project = (x, y, z = 0) => [
    640 + (x * .8 - y * .6) * 3,
    432 + (x * .3 + y * .4 - z * .8660254) * 3,
  ];

  const coordinates = vertices => vertices
    .map(vertex => project(...vertex).map(value => value.toFixed(2)).join(','))
    .join(' ');

  function polygon(vertices, fill, extra = '') {
    return `<polygon points="${coordinates(vertices)}" fill="${fill}" ${extra}/>`;
  }

  function line(vertices, color = '#73796b', width = .7, opacity = 1) {
    return `<polyline points="${coordinates(vertices)}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  function box(x, y, z, width, depth, height, material = 'white') {
    const [dark, light, top] = COLORS[material];
    const left = x - width / 2, right = x + width / 2;
    const back = y - depth / 2, front = y + depth / 2;
    const upper = z + height;
    return polygon([[right, back, z], [right, front, z], [right, front, upper], [right, back, upper]], dark)
      + polygon([[left, front, z], [right, front, z], [right, front, upper], [left, front, upper]], light)
      + polygon([[left, back, upper], [right, back, upper], [right, front, upper], [left, front, upper]], top);
  }

  function facePoint(x, y, z, u, v, axis) {
    return axis === 'x' ? [x + u, y, z + v] : [x, y + u, z + v];
  }

  function panel(x, y, z, width, height, axis, color) {
    return polygon([
      facePoint(x, y, z, -width / 2, 0, axis),
      facePoint(x, y, z, width / 2, 0, axis),
      facePoint(x, y, z, width / 2, height, axis),
      facePoint(x, y, z, -width / 2, height, axis),
    ], color);
  }

  function cylinder(x, y, z, radius, height, material = 'metal', count = 12, topRadius = radius) {
    const palette = COLORS[material];
    const faces = [];
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      const b = (i + 1) / count * Math.PI * 2;
      const angle = (a + b) / 2;
      const normal = Math.cos(angle) * .6 + Math.sin(angle) * .8;
      if (normal < -.01) continue;
      const color = Math.sin(angle) > .65 ? palette[1] : palette[0];
      faces.push([normal, polygon([
        [x + radius * Math.cos(a), y + radius * Math.sin(a), z],
        [x + radius * Math.cos(b), y + radius * Math.sin(b), z],
        [x + topRadius * Math.cos(b), y + topRadius * Math.sin(b), z + height],
        [x + topRadius * Math.cos(a), y + topRadius * Math.sin(a), z + height],
      ], color)]);
    }
    let result = faces.sort((a, b) => a[0] - b[0]).map(face => face[1]).join('');
    result += polygon(Array.from({ length: count }, (_, i) => [
      x + topRadius * Math.cos(i / count * Math.PI * 2),
      y + topRadius * Math.sin(i / count * Math.PI * 2),
      z + height,
    ]), palette[2]);
    return result;
  }

  function windowPane(x, y, z, width, height, axis = 'x', options = {}) {
    const { surround = false, columns = 2, transom = true, blank = false } = options;
    let result = '';
    if (surround) {
      result += panel(x, y, z - .7, width + 1.6, height + 1.4, axis, axis === 'x' ? '#f6f0dc' : '#dfe0ce');
    }
    result += panel(x, y, z, width, height, axis, '#374743');
    result += panel(x, y, z + .3, width - .6, height - .6, axis, `url(#glass-${axis})`);
    if (blank) {
      result += panel(...facePoint(x, y, z + .3, -width * .2, 0, axis), width * .53, height - .6, axis, '#e4e6d8');
    }
    for (let i = 1; i < columns; i++) {
      const offset = -width / 2 + width * i / columns;
      result += line([
        facePoint(x, y, z, offset, .3, axis),
        facePoint(x, y, z, offset, height - .2, axis),
      ], '#3b4c45', .95);
    }
    if (transom) {
      result += line([
        facePoint(x, y, z, -width / 2 + .25, height * .77, axis),
        facePoint(x, y, z, width / 2 - .25, height * .77, axis),
      ], '#374943', .85);
    }
    result += line([
      facePoint(x, y, z, -width * .31, .5, axis),
      facePoint(x, y, z, width * .34, height - .5, axis),
    ], '#e6ebdb', .7, .18);
    result += line([
      facePoint(x, y, z, -width / 2 - .25, -.2, axis),
      facePoint(x, y, z, width / 2 + .3, -.2, axis),
    ], surround ? '#fcf5df' : '#b0b6a8', 1.2, .9);
    return result;
  }

  const depthAt = (x, y, z = 0) => x * .6 + y * .8 + z * .012;

  function makeScene() {
    const pieces = [];
    const add = (markup, depth, delay = 0, duration = 450, rise = 15) => {
      pieces.push({ markup, depth, delay, duration, rise });
    };

    const ground = [[-149, -88, 0], [149, -88, 0], [149, 117, 0], [-149, 117, 0]];
    const defs = `<defs>
      <linearGradient id="glass-x" x1="0" y1="0" x2=".85" y2="1" gradientUnits="objectBoundingBox">
        <stop stop-color="#aebcaf"/><stop offset=".48" stop-color="#899c94"/><stop offset="1" stop-color="#5c7770"/>
      </linearGradient>
      <linearGradient id="glass-y" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
        <stop stop-color="#96aaa0"/><stop offset=".55" stop-color="#6b867e"/><stop offset="1" stop-color="#486760"/>
      </linearGradient>
      <filter id="soft-ground-shadow" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="15"/></filter>
      <clipPath id="ground-clip"><polygon points="${coordinates(ground)}"/></clipPath>
    </defs>`;

    add('<ellipse cx="650" cy="455" rx="387" ry="155" fill="#4b503d" opacity=".13" filter="url(#soft-ground-shadow)"/>', -10000, 20, 650, 0);

    let plaza = box(0, 14.5, -4.5, 298, 205, 4.5, 'stone');
    plaza += polygon(ground, '#dfdfd0');
    plaza += polygon([[-140, -79, .05], [140, -79, .05], [140, 107, .05], [-140, 107, .05]], '#bccbaa');
    plaza += polygon([[-134, -74, .12], [134, -74, .12], [134, 79, .12], [62, 105, .12], [-109, 105, .12], [-134, 77, .12]], '#e4e3d5');
    add(plaza, -9999, 60, 560, 7);

    let paving = '';
    for (let y = -22; y < 105; y += 7.5) {
      paving += line([[-89, y, .16], [87, y, .16]], '#b9c1b1', .48, .38);
    }
    for (let x = -87; x < 88; x += 10) {
      paving += line([[x, -23, .17], [x, 103, .17]], '#b9c1b1', .45, .28);
    }
    paving += polygon([[-62, 43, .21], [-23, 43, .21], [-23, 63, .21], [-62, 63, .21]], '#9eaf86');
    paving += polygon([[39, 69, .21], [78, 69, .21], [78, 87, .21], [39, 87, .21]], '#9bac81');
    paving += line([[-62, 63, .25], [-62, 43, .25], [-23, 43, .25], [-23, 63, .25], [-62, 63, .25]], '#c5cbbb', 1.6);
    paving += line([[39, 87, .25], [39, 69, .25], [78, 69, .25], [78, 87, .25]], '#c5cbbb', 1.6);
    add(paving, -9998, 260, 600, 0);

    function castShadow(x, y, width, depth, height, opacity = .11) {
      const ox = height * .37, oy = height * .44;
      return polygon([
        [x - width / 2, y - depth / 2, .24],
        [x + width / 2, y - depth / 2, .24],
        [x + width / 2 + ox, y - depth / 2 + oy, .24],
        [x + width / 2 + ox, y + depth / 2 + oy, .24],
        [x - width / 2 + ox, y + depth / 2 + oy, .24],
        [x - width / 2, y + depth / 2, .24],
      ], '#5d6651', `opacity="${opacity}"`);
    }

    let shadows = castShadow(0, -50, 250, 36, 45)
      + castShadow(-108, 16.5, 34, 97, 45)
      + castShadow(108, 16.5, 34, 97, 45)
      + castShadow(22, -19, 48, 26, 22, .09);
    add(`<g clip-path="url(#ground-clip)">${shadows}</g>`, -9997, 410, 1450, 0);

    function floorSegment(x, y, width, depth, facadeAxis, tone, index, entrance = false) {
      const order = depthAt(x + width / 2, y + depth / 2);
      const stagger = ((x + 125) / 250) * 115 + ((y + 68) / 133) * 55;

      add(box(x, y, .3, width + .25, depth + .25, 3.1, 'charcoal'), order, 180 + stagger, 410, 10);

      for (let floor = 0; floor < 3; floor++) {
        const z = 3.4 + floor * 13.5;
        const delay = 490 + floor * 335 + stagger;
        let structure = box(x, y, z, width, depth, .8, 'concrete');
        structure += box(x - width / 2 + 1.1, y + depth / 2 - 1.15, z + .8, 1.3, 1.3, 12.7, 'concrete');
        structure += box(x + width / 2 - 1.1, y + depth / 2 - 1.15, z + .8, 1.3, 1.3, 12.7, 'concrete');
        add(structure, order + floor * .012, delay - 110, 380, 18);

        let body = box(x, y, z + .8, width, depth, 12.7, tone);
        const isFront = facadeAxis === 'x';
        const fx = isFront ? x : x + width / 2 + .025;
        const fy = isFront ? y + depth / 2 + .025 : y;
        const faceWidth = isFront ? width : depth;

        if (tone === 'white' && !(entrance && floor < 2)) {
          const offset = -faceWidth / 2 + .8;
          const [px, py] = facePoint(fx, fy, 0, offset, 0, facadeAxis);
          body += panel(px, py, z + .3, 1.35, 13.2, facadeAxis, isFront ? '#8b938a' : '#727f75');
          const [qx, qy] = facePoint(fx, fy, 0, offset + 1.25, 0, facadeAxis);
          body += panel(qx, qy, z + .3, .55, 13.2, facadeAxis, '#b7bcb0');
        }
        add(body, order + .07 + floor * .012, delay, 450, 18);

        let facade = '';
        if (entrance && floor < 2) {
          facade += windowPane(fx, fy + .025, z + .85, faceWidth - .28, 12.45, 'x', { columns: 2, transom: false });
        } else {
          const narrow = tone === 'white' && index % 4 === 2;
          const windowWidth = narrow ? 2.2 : Math.min(faceWidth - 3.2, 7.6);
          const offset = narrow ? .4 : .5;
          const [wx, wy] = facePoint(fx, fy, 0, offset, 0, facadeAxis);
          facade += windowPane(wx, wy, z + 3.0, windowWidth, 7.9, facadeAxis, {
            surround: tone === 'ochre', columns: narrow ? 1 : 3,
          });
        }
        add(facade, order + .2 + floor * .012, delay + 245, 390, 10);
      }

      let roof = box(x, y, 43.9, width + .12, depth + .12, 1.25, 'white');
      roof += box(x, y, 45.15, width - .25, depth - .25, .5, 'roof');
      if (facadeAxis === 'x') {
        roof += box(x, y - depth / 2 + .45, 45.6, width + .1, .9, 1.35, 'white');
        roof += box(x, y + depth / 2 - .45, 45.6, width + .1, .9, 1.35, 'white');
      } else {
        roof += box(x - width / 2 + .45, y, 45.6, .9, depth + .1, 1.35, 'white');
        roof += box(x + width / 2 - .45, y, 45.6, .9, depth + .1, 1.35, 'white');
      }
      add(roof, order + .5, 1910 + stagger, 470, 20);
    }

    for (let i = 0; i < 25; i++) {
      const x = -120 + i * 10;
      floorSegment(x, -50, 10, 36, 'x', x >= 80 ? 'ochre' : 'white', i, x >= 0 && x <= 40);
    }

    for (let i = 0; i < 10; i++) {
      const y = -32 + (i + .5) * 9.7;
      floorSegment(-108, y, 34, 9.7, 'y', 'white', i);
      floorSegment(108, y, 34, 9.7, 'y', 'ochre', i);
    }

    function wingEnd(x, ochre) {
      const order = depthAt(x + 17, 65) + .35;
      for (let floor = 0; floor < 3; floor++) {
        const z = 3.4 + floor * 13.5;
        let face = '';
        if (ochre) {
          const patterns = [
            [[-9.2, 12.3, true], [3.1, 5.4, false], [12.1, 4.0, false]],
            [[-12.0, 4.1, false], [-1.4, 10.7, false], [11.0, 6.1, false]],
            [[-9.5, 12.2, true], [1.7, 2.1, false], [7.4, 2.1, false], [13.0, 4.0, false]],
          ];
          for (const [offset, width, blank] of patterns[floor]) {
            face += windowPane(x + offset, 65.055, z + 3.1, width, 7.8, 'x', {
              surround: width > 3, columns: width > 8 ? 3 : width > 3 ? 2 : 1, blank,
            });
          }
        } else {
          for (const offset of [-14.6, -4.7, 5.2, 14.9]) {
            face += panel(x + offset, 65.055, z + .3, 1.4, 13.2, 'x', '#889286');
          }
          for (const [offset, width] of [[-9.4, 7.0], [.5, 6.8], [10.6, 3.0]]) {
            face += windowPane(x + offset, 65.075, z + 3.0, width, 7.9, 'x', { columns: width > 5 ? 3 : 1 });
          }
        }
        add(face, order + floor * .02, 890 + floor * 345 + (ochre ? 95 : 0), 420, 12);
      }
      add(box(x, 64.65, 45.6, 34.3, .9, 1.35, 'white'), order + .3, 2100, 430, 18);
    }

    wingEnd(-108, false);
    wingEnd(108, true);

    for (const x of [-124.55, 124.55]) {
      add(box(x, -50, 45.6, .9, 36.1, 1.35, 'white'), depthAt(x, -32) + .65, 2050, 420, 17);
    }

    const roofEquipment = [
      [-102, -54, 7.4, 5.2, 3.0], [-67, -56, 9.2, 5.0, 3.1],
      [-24, -56, 6.2, 4.4, 2.5], [17, -53, 12.0, 6.0, 3.2],
      [65, -55, 8.0, 5.0, 2.8], [109, -49, 7.0, 5.3, 3.1],
      [-109, -3, 7.4, 8.0, 3.1], [-108, 32, 8.3, 6.0, 3.0],
      [106, -7, 9.5, 7.1, 3.6], [110, 31, 8.3, 7.0, 3.0],
    ];

    roofEquipment.forEach(([x, y, width, depth, height], i) => {
      let unit = box(x, y, 45.7, width, depth, .55, 'charcoal');
      unit += box(x, y, 46.25, width - .65, depth - .65, height, 'metal');
      for (let j = 0; j < 4; j++) {
        unit += line([[x - width * .34, y + depth / 2 - .28, 46.9 + j * .48], [x + width * .34, y + depth / 2 - .28, 46.9 + j * .48]], '#657a70', .6, .65);
      }
      unit += cylinder(x + width * .26, y + .2, 46.3 + height, 1.15, .55, 'metal', 12);
      add(unit, depthAt(x + width / 2, y + depth / 2) + .7, 2160 + (i % 4) * 50, 420, 12);
    });

    [[-87, -43], [-48, -49], [0, -44], [45, -50], [92, -49], [-111, 15], [112, 51]].forEach(([x, y], i) => {
      const vent = box(x, y, 45.7, 3, 3, .8, 'metal')
        + cylinder(x, y, 46.5, 1.05, 3.7, 'metal')
        + cylinder(x, y, 50.2, 1.65, .75, 'white');
      add(vent, depthAt(x + 2, y + 2) + .75, 2260 + (i % 3) * 40, 370, 10);
    });

    const entryX = 22;
    const entryDepth = depthAt(entryX + 25, -4);
    let steps = '';
    for (let i = 0; i < 5; i++) {
      steps += box(entryX, -7.5 - i * .9, .2, 49 - i * .3, 22 - i * 2.5, .55 * (i + 1), 'concrete');
    }
    add(steps, entryDepth - 3, 1510, 490, 9);

    let vestibule = box(entryX, -27.4, 3.0, 29, 9.2, 12.8, 'white');
    vestibule += windowPane(entryX, -22.775, 3.2, 24, 10.7, 'x', { columns: 4, transom: true });
    vestibule += box(entryX, -27.4, 15.8, 30, 10.2, .6, 'white');
    for (const x of [entryX - 3, entryX + 3]) {
      vestibule += line([[x, -22.70, 7.6], [x, -22.70, 9.5]], '#d2d8c9', 1.2);
    }
    for (const x of [entryX - 8.9, entryX + 8.9]) {
      for (const z of [7.3, 9.0]) {
        const [sx, sy] = project(x, -22.68, z);
        vestibule += `<ellipse cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" rx="1.8" ry="2.1" fill="#e2bb53"/>`;
      }
    }
    add(vestibule, depthAt(entryX + 15, -22.6) + .5, 1800, 460, 15);

    for (const x of [entryX - 22, entryX + 22]) {
      const support = box(x, -18.4, 3.0, 4.3, 24.6, 18.3, 'ochre')
        + line([[x - 2.15, -6.08, 12.9], [x + 2.15, -6.08, 12.9]], '#ad865d', .7, .7);
      add(support, depthAt(x + 2.3, -6) + .3, 2020, 470, 18);
    }

    let canopy = box(entryX, -18.8, 21.3, 49.4, 27.4, 2.5, 'ochre');
    canopy += box(entryX, -18.8, 23.8, 50.3, 28.2, .75, 'white');
    canopy += polygon([
      [entryX - 23.8, -31.9, 24.58], [entryX + 23.8, -31.9, 24.58],
      [entryX + 23.8, -5.7, 24.58], [entryX - 23.8, -5.7, 24.58],
    ], '#b7bbaa');
    const [tx, ty] = project(entryX - 18.5, -5.04, 21.96);
    canopy += `<text transform="matrix(2.4 .9 0 2.598 ${tx.toFixed(2)} ${ty.toFixed(2)})" fill="#4d574b" font-family="Arial,sans-serif" font-size="1.08" font-weight="600" textLength="37" lengthAdjust="spacingAndGlyphs">ЦЕНТР ОБРАЗОВАНИЯ № 37</text>`;
    add(canopy, entryDepth + .9, 2230, 470, 24);

    function railing(x1, y1, x2, y2, base, height = 3.0) {
      let rail = line([[x1, y1, base + height], [x2, y2, base + height]], '#9daea0', 1.1);
      rail += line([[x1, y1, base + height * .5], [x2, y2, base + height * .5]], '#a8b8aa', .75);
      const count = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4));
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
        rail += line([[x, y, base], [x, y, base + height]], '#899e8e', .9);
      }
      return rail;
    }

    let handrails = railing(entryX - 23.5, -12, entryX - 23.5, 1.8, 1.6);
    handrails += railing(entryX + 23.5, -12, entryX + 23.5, 1.8, 1.6);
    add(handrails, entryDepth + 3, 2420, 340, 6);

    let ramp = polygon([[49, -17, .3], [79, -17, .3], [79, -10, .3], [49, -10, .3]], '#abb3a4');
    ramp += polygon([[49, -17, 2.7], [79, -17, .3], [79, -10, .3], [49, -10, 2.7]], '#c4cabe');
    ramp += line([[49, -10, 5.9], [79, -10, 3.5]], '#8f9e8e', 1);
    ramp += line([[49, -17, 5.9], [79, -17, 3.5]], '#8f9e8e', 1);
    for (let i = 0; i <= 6; i++) {
      const x = 49 + i * 5, z = 2.7 - i * .4;
      ramp += line([[x, -10, z], [x, -10, z + 3.2]], '#91a08f', .8);
    }
    add(ramp, depthAt(80, -10), 2310, 430, 8);

    function bench(x, y) {
      let result = box(x - 4.5, y, .3, 1.2, 2.5, 2, 'charcoal')
        + box(x + 4.5, y, .3, 1.2, 2.5, 2, 'charcoal');
      for (let j = 0; j < 3; j++) result += box(x, y - 1.1 + j * 1.1, 2.3, 12, .9, .55, 'ochre');
      return result;
    }

    [[-74, 37], [-46, 72], [66, 61]].forEach(([x, y], i) => {
      add(bench(x, y), depthAt(x + 6, y + 2), 2400 + i * 60, 360, 10);
    });

    let bikeRacks = '';
    for (let i = 0; i < 7; i++) {
      const x = -83 + i * 2.7;
      const loop = [[x, -24, .3], [x, -24, 2.0]];
      for (let j = 0; j <= 12; j++) {
        const angle = Math.PI - j / 12 * Math.PI;
        loop.push([x, -22 + Math.cos(angle) * 2, 2 + Math.sin(angle) * 2]);
      }
      loop.push([x, -20, .3]);
      bikeRacks += line(loop, '#92a697', .85);
    }
    add(bikeRacks, depthAt(-63, -19), 2410, 380, 5);

    [[-138, 73, 4.4], [-125, 98, 3.9], [120, 91, 4.5], [135, 54, 3.8]].forEach(([x, y, r], i) => {
      let tree = castShadow(x, y, r * 2, r * 2, 12, .09);
      tree += cylinder(x, y, .3, .6, 6.5, 'ochre', 8);
      tree += cylinder(x, y, 5, r * .55, 3.5, 'green', 12, r);
      tree += cylinder(x, y, 8.5, r, 3.3, 'green', 12, r * .7);
      tree += cylinder(x, y, 11.8, r * .7, 2.3, 'green', 12, .35);
      add(tree, depthAt(x + r, y + r), 2360 + i * 45, 430, 13);
    });

    [[-84, -28], [-75, -28], [-66, -28], [-57, -28], [-48, -28], [82, 96], [91, 96]].forEach(([x, y], i) => {
      const shrub = cylinder(x, y, .2, 2.0, 1.7, 'green', 10, 2.15)
        + cylinder(x, y, 1.9, 2.15, 1.65, 'green', 10, .65);
      add(shrub, depthAt(x + 2, y + 2), 2450 + (i % 3) * 35, 350, 6);
    });

    pieces.sort((a, b) => a.depth - b.depth);
    return { defs, pieces };
  }

  class TulaSchool37 extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._animations = [];
      this._observer = null;
      this._timer = null;
      this._initialized = false;
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
          if (entries.some(entry => entry.isIntersecting)) {
            this._observer?.disconnect();
            this._observer = null;
            this.play();
          }
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
      const { defs, pieces } = makeScene();
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;width:100%;contain:content;line-height:0;isolation:isolate}
        svg{display:block;width:100%;height:auto;overflow:visible}
        .piece{opacity:0;transform-box:view-box}
        @media(prefers-reduced-motion:reduce){.piece{opacity:1!important;transform:none!important}}
      </style>
      <svg xmlns="${NS}" viewBox="0 0 1280 820" width="1280" height="820" role="img" aria-labelledby="school-title school-description">
        <title id="school-title">Строительство МБОУ ЦО № 37 им. В. П. Храмченко, Тула</title>
        <desc id="school-description">Трёхсекундная изометрическая анимация по фотографиям школы: три этажа, белые фасады с серыми вертикальными полосами, охристое крыло, плоская кровля и стеклянный вход под широким порталом. Архитектура и пропорции стилизованы.</desc>
        ${defs}
        ${pieces.map(piece => `<g class="piece">${piece.markup}</g>`).join('')}
      </svg>`;
      this._pieces = pieces;
      this._nodes = [...this.shadowRoot.querySelectorAll('.piece')];
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
      this._nodes.forEach((node, index) => {
        const piece = this._pieces[index];
        node.style.opacity = '0';
        this._animations.push(node.animate([
          { opacity: 0, transform: `translateY(${-piece.rise}px)` },
          { opacity: 1, transform: 'translateY(0)' },
        ], {
          delay: piece.delay,
          duration: piece.duration,
          easing: EASING,
          fill: 'both',
        }));
      });
      this._timer = setTimeout(() => {
        this.finish();
        this.dispatchEvent(new CustomEvent('school-built', { bubbles: true, composed: true }));
      }, DURATION);
    }

    finish() {
      if (!this._initialized) this._build();
      this._stop();
      this._nodes.forEach(node => {
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
      });
    }
  }

  customElements.define(TAG, TulaSchool37);
})();
