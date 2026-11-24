export const MathEx = {
  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  },
  lerp(a, b, t) {
    return a + (b - a) * t;
  },
  damp(a, b, lambda, dt) {
    return MathEx.lerp(a, b, 1 - Math.exp(-lambda * dt));
  },
  invLerp(a, b, v) {
    return a === b ? 0 : (v - a) / (b - a);
  },
  remap(inMin, inMax, outMin, outMax, v) {
    return MathEx.lerp(outMin, outMax, MathEx.invLerp(inMin, inMax, v));
  },
  degToRad(deg) {
    return (deg * Math.PI) / 180;
  },
  radToDeg(rad) {
    return (rad * 180) / Math.PI;
  },
  randRange(min, max) {
    return min + Math.random() * (max - min);
  },
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
  chance(prob) {
    return Math.random() < prob;
  },
  wrapAngle(rad) {
    while (rad > Math.PI) rad -= Math.PI * 2;
    while (rad < -Math.PI) rad += Math.PI * 2;
    return rad;
  },
  lerpAngle(a, b, t) {
    return a + MathEx.wrapAngle(b - a) * t;
  },
  hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  },
  lerpColor(hexA, hexB, t) {
    const c1 = MathEx.hexToRgb(hexA);
    const c2 = MathEx.hexToRgb(hexB);
    return `rgb(${Math.round(MathEx.lerp(c1.r, c2.r, t))}, ${Math.round(MathEx.lerp(c1.g, c2.g, t))}, ${Math.round(MathEx.lerp(c1.b, c2.b, t))})`;
  },
};

export const Ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => t * (2 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  inCubic: (t) => t * t * t,
  outCubic: (t) => --t * t * t + 1,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  outBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

export class Point0D {
  constructor(value = 0, label = 'point0d') {
    this.value = value;
    this.label = label;
    this.active = true;
  }
  set(v) { this.value = v; return this; }
  project(w = 800, h = 600) { return { x: w / 2, y: h / 2, scale: 1, depth: 0 }; }
}

export class Vec1D {
  constructor(x = 0) { this.x = x; }
  clone() { return new Vec1D(this.x); }
  add(v) { return new Vec1D(this.x + v.x); }
  sub(v) { return new Vec1D(this.x - v.x); }
  scale(s) { return new Vec1D(this.x * s); }
  dist(v) { return Math.abs(this.x - v.x); }
  lerp(v, t) { return new Vec1D(MathEx.lerp(this.x, v.x, t)); }
}

export class Line1DNode {
  constructor({ x = 0, min = -200, max = 200, originX = 400, originY = 300, color = '#38bdf8', radius = 8 } = {}) {
    this.pos = new Vec1D(x);
    this.vel = new Vec1D(0);
    this.min = min;
    this.max = max;
    this.originX = originX;
    this.originY = originY;
    this.color = color;
    this.radius = radius;
  }
  update(dt) { this.pos.x = MathEx.clamp(this.pos.x + this.vel.x * dt, this.min, this.max); }
  project() { return { x: this.originX + this.pos.x, y: this.originY, scale: 1, depth: 0 }; }
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.originX + this.min, this.originY);
    ctx.lineTo(this.originX + this.max, this.originY);
    ctx.stroke();
    const p = this.project();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Vector2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  clone() { return new Vector2(this.x, this.y); }
  set(x, y) { this.x = x; this.y = y; return this; }
  add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
  mul(v) { return new Vector2(this.x * v.x, this.y * v.y); }
  div(v) { return new Vector2(v.x === 0 ? 0 : this.x / v.x, v.y === 0 ? 0 : this.y / v.y); }
  scale(s) { return new Vector2(this.x * s, this.y * s); }
  dot(v) { return this.x * v.x + this.y * v.y; }
  cross(v) { return this.x * v.y - this.y * v.x; }
  magSq() { return this.x * this.x + this.y * this.y; }
  mag() { return Math.hypot(this.x, this.y); }
  normalize() { const m = this.mag(); return m === 0 ? new Vector2(0, 0) : new Vector2(this.x / m, this.y / m); }
  limit(maxMag) { const m = this.mag(); return m > maxMag && m > 0 ? this.scale(maxMag / m) : this.clone(); }
  dist(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
  distSq(v) { const dx = this.x - v.x, dy = this.y - v.y; return dx * dx + dy * dy; }
  angle() { return Math.atan2(this.y, this.x); }
  rotate(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Vector2(this.x * c - this.y * s, this.x * s + this.y * c);
  }
  perp() { return new Vector2(-this.y, this.x); }
  lerp(v, t) { return new Vector2(MathEx.lerp(this.x, v.x, t), MathEx.lerp(this.y, v.y, t)); }
  static fromAngle(rad, length = 1) { return new Vector2(Math.cos(rad) * length, Math.sin(rad) * length); }
}

export const Geometry2D = {
  circlesOverlap(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const r = a.radius + b.radius;
    return dx * dx + dy * dy <= r * r;
  },
  pointInPolygon(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
        (pt.x < ((xj - xi) * (pt.y - yi)) / ((yj - yi) || 1e-9) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  },
  raycastBox(origin, dir, maxDist, box) {
    const nDir = dir.normalize();
    if (nDir.magSq() === 0) return null;
    const invX = nDir.x !== 0 ? 1 / nDir.x : 1e9;
    const invY = nDir.y !== 0 ? 1 / nDir.y : 1e9;

    const t1 = (box.x - origin.x) * invX;
    const t2 = (box.x + box.w - origin.x) * invX;
    const t3 = (box.y - origin.y) * invY;
    const t4 = (box.y + box.h - origin.y) * invY;

    const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

    if (tmax < 0 || tmin > tmax || tmin > maxDist || tmin < 0) return null;
    return {
      hit: true,
      t: tmin,
      x: origin.x + nDir.x * tmin,
      y: origin.y + nDir.y * tmin,
    };
  },
};

export class Vec25D {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  clone() { return new Vec25D(this.x, this.y, this.z); }
}

export class Projector25D {
  constructor({ mode = 'oblique', originX = 400, originY = 250, elevScale = 0.7, isoAngle = Math.PI / 6 } = {}) {
    this.mode = mode;
    this.originX = originX;
    this.originY = originY;
    this.elevScale = elevScale;
    this.isoAngle = isoAngle;
  }
  project(v25) {
    if (this.mode === 'isometric') {
      const c = Math.cos(this.isoAngle), s = Math.sin(this.isoAngle);
      return {
        x: this.originX + (v25.x - v25.y) * c,
        y: this.originY + (v25.x + v25.y) * s - v25.z * this.elevScale,
        depth: v25.x + v25.y,
      };
    }
    return {
      x: this.originX + v25.x,
      y: this.originY + v25.y - v25.z * this.elevScale,
      depth: v25.y,
    };
  }
}

export class Entity25D {
  constructor({ x = 0, y = 0, z = 0, w = 24, d = 24, h = 24, color = '#f59e0b' } = {}) {
    this.pos = new Vec25D(x, y, z);
    this.vel = new Vec25D(0, 0, 0);
    this.w = w; this.d = d; this.h = h;
    this.color = color;
    this.gravity = -600;
  }
  update(dt) {
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.vel.z += this.gravity * dt;
    this.pos.z += this.vel.z * dt;
    if (this.pos.z < 0) { this.pos.z = 0; this.vel.z = 0; }
  }
  draw(ctx, projector) {
    const base = projector.project(this.pos);
    const top = projector.project(new Vec25D(this.pos.x, this.pos.y, this.pos.z + this.h));
    const shadow = projector.project(new Vec25D(this.pos.x, this.pos.y, 0));
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(shadow.x, shadow.y, this.w * 0.5, this.d * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.fillRect(top.x - this.w / 2, top.y - this.w / 2, this.w, this.w);
    ctx.restore();
  }
}

export class Vec3D {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  clone() { return new Vec3D(this.x, this.y, this.z); }
  add(v) { return new Vec3D(this.x + v.x, this.y + v.y, this.z + v.z); }
  sub(v) { return new Vec3D(this.x - v.x, this.y - v.y, this.z - v.z); }
  scale(s) { return new Vec3D(this.x * s, this.y * s, this.z * s); }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
  cross(v) {
    return new Vec3D(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
  rotateX(a) { const c = Math.cos(a), s = Math.sin(a); return new Vec3D(this.x, this.y * c - this.z * s, this.y * s + this.z * c); }
  rotateY(a) { const c = Math.cos(a), s = Math.sin(a); return new Vec3D(this.x * c + this.z * s, this.y, -this.x * s + this.z * c); }
  rotateZ(a) { const c = Math.cos(a), s = Math.sin(a); return new Vec3D(this.x * c - this.y * s, this.x * s + this.y * c, this.z); }
}

export class Camera3D {
  constructor({ fov = 500, viewerDist = 4, originX = 400, originY = 300 } = {}) {
    this.fov = fov; this.viewerDist = viewerDist; this.originX = originX; this.originY = originY;
  }
  project(v3) {
    const denom = Math.max(0.1, this.viewerDist + v3.z);
    const scale = this.fov / (this.fov + denom * 80);
    return { x: this.originX + v3.x * scale, y: this.originY + v3.y * scale, scale, depth: v3.z };
  }
}

export class Cube3D {
  constructor({ size = 80, color = '#a855f7', rotSpeed = { x: 0.7, y: 1.1, z: 0.3 } } = {}) {
    this.size = size; this.color = color; this.rot = new Vec3D(0, 0, 0); this.rotSpeed = rotSpeed;
    const h = size / 2;
    this.vertices = [
      new Vec3D(-h, -h, -h), new Vec3D(h, -h, -h), new Vec3D(h, h, -h), new Vec3D(-h, h, -h),
      new Vec3D(-h, -h,  h), new Vec3D(h, -h,  h), new Vec3D(h, h,  h), new Vec3D(-h, h,  h),
    ];
    this.edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];
  }
  update(dt) {
    this.rot.x += this.rotSpeed.x * dt;
    this.rot.y += this.rotSpeed.y * dt;
    this.rot.z += this.rotSpeed.z * dt;
  }
  draw(ctx, cam3d) {
    const pts = this.vertices.map((v) => cam3d.project(v.rotateX(this.rot.x).rotateY(this.rot.y).rotateZ(this.rot.z)));
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    for (const [a, b] of this.edges) {
      ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke();
    }
    ctx.restore();
  }
}

export class Vec4D {
  constructor(x = 0, y = 0, z = 0, w = 0) { this.x = x; this.y = y; this.z = z; this.w = w; }
  clone() { return new Vec4D(this.x, this.y, this.z, this.w); }
  add(v) { return new Vec4D(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w); }
  sub(v) { return new Vec4D(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w); }
  scale(s) { return new Vec4D(this.x * s, this.y * s, this.z * s, this.w * s); }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w; }
  lerp(v, t) {
    return new Vec4D(
      MathEx.lerp(this.x, v.x, t),
      MathEx.lerp(this.y, v.y, t),
      MathEx.lerp(this.z, v.z, t),
      MathEx.lerp(this.w, v.w, t)
    );
  }
  rotateXW(a) { const c = Math.cos(a), s = Math.sin(a); return new Vec4D(this.x * c - this.w * s, this.y, this.z, this.x * s + this.w * c); }
  rotateYW(a) { const c = Math.cos(a), s = Math.sin(a); return new Vec4D(this.x, this.y * c - this.w * s, this.z, this.y * s + this.w * c); }
  rotateZW(a) { const c = Math.cos(a), s = Math.sin(a); return new Vec4D(this.x, this.y, this.z * c - this.w * s, this.z * s + this.w * c); }
  toVec3D(wDistance = 2.5) {
    const factor = 1 / Math.max(0.2, wDistance - this.w);
    return new Vec3D(this.x * factor, this.y * factor, this.z * factor);
  }
}

export class Tesseract4D {
  constructor({ scale = 90, color = '#ec4899', wDistance = 2.5 } = {}) {
    this.scale = scale; this.color = color; this.wDistance = wDistance;
    this.angleXW = 0; this.angleZW = 0;
    this.vertices = [];
    for (let i = 0; i < 16; i++) {
      this.vertices.push(new Vec4D((i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1, (i & 8) ? 1 : -1));
    }
    this.edges = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        if ((diff & (diff - 1)) === 0) this.edges.push([i, j]);
      }
    }
  }
  update(dt) { this.angleXW += 0.9 * dt; this.angleZW += 0.6 * dt; }
  draw(ctx, cam3d) {
    const pts2d = this.vertices.map((v) => {
      const r = v.rotateXW(this.angleXW).rotateZW(this.angleZW).toVec3D(this.wDistance);
      return cam3d.project(new Vec3D(r.x * this.scale, r.y * this.scale, r.z * this.scale));
    });
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    for (const [a, b] of this.edges) {
      ctx.beginPath(); ctx.moveTo(pts2d[a].x, pts2d[a].y); ctx.lineTo(pts2d[b].x, pts2d[b].y); ctx.stroke();
    }
    ctx.restore();
  }
}

export class Vec5D {
  constructor(x = 0, y = 0, z = 0, w = 0, v = 0) { this.x = x; this.y = y; this.z = z; this.w = w; this.v = v; }
  clone() { return new Vec5D(this.x, this.y, this.z, this.w, this.v); }
  add(o) { return new Vec5D(this.x + o.x, this.y + o.y, this.z + o.z, this.w + o.w, this.v + o.v); }
  sub(o) { return new Vec5D(this.x - o.x, this.y - o.y, this.z - o.z, this.w - o.w, this.v - o.v); }
  scale(s) { return new Vec5D(this.x * s, this.y * s, this.z * s, this.w * s, this.v * s); }
  dot(o) { return this.x * o.x + this.y * o.y + this.z * o.z + this.w * o.w + this.v * o.v; }
  lerp(o, t) {
    return new Vec5D(
      MathEx.lerp(this.x, o.x, t),
      MathEx.lerp(this.y, o.y, t),
      MathEx.lerp(this.z, o.z, t),
      MathEx.lerp(this.w, o.w, t),
      MathEx.lerp(this.v, o.v, t)
    );
  }
  rotateXV(a) { const c = Math.cos(a), s = Math.sin(a); return new Vec5D(this.x * c - this.v * s, this.y, this.z, this.w, this.x * s + this.v * c); }
  rotateWV(a) { const c = Math.cos(a), s = Math.sin(a); return new Vec5D(this.x, this.y, this.z, this.w * c - this.v * s, this.w * s + this.v * c); }
  toVec4D(vDistance = 2.8) {
    const factor = 1 / Math.max(0.2, vDistance - this.v);
    return new Vec4D(this.x * factor, this.y * factor, this.z * factor, this.w * factor);
  }
}

export class Penteract5D {
  constructor({ scale = 85, color = '#06b6d4', vDistance = 2.8, wDistance = 2.5 } = {}) {
    this.scale = scale; this.color = color; this.vDistance = vDistance; this.wDistance = wDistance;
    this.angleXV = 0; this.angleWV = 0;
    this.vertices = [];
    for (let i = 0; i < 32; i++) {
      this.vertices.push(new Vec5D((i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1, (i & 8) ? 1 : -1, (i & 16) ? 1 : -1));
    }
    this.edges = [];
    for (let i = 0; i < 32; i++) {
      for (let j = i + 1; j < 32; j++) {
        const diff = i ^ j;
        if ((diff & (diff - 1)) === 0) this.edges.push([i, j]);
      }
    }
  }
  update(dt) { this.angleXV += 0.8 * dt; this.angleWV += 0.55 * dt; }
  draw(ctx, cam3d) {
    const pts2d = this.vertices.map((pt) => {
      const v3 = pt.rotateXV(this.angleXV).rotateWV(this.angleWV).toVec4D(this.vDistance).toVec3D(this.wDistance);
      return cam3d.project(new Vec3D(v3.x * this.scale, v3.y * this.scale, v3.z * this.scale));
    });
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.25;
    for (const [a, b] of this.edges) {
      ctx.beginPath(); ctx.moveTo(pts2d[a].x, pts2d[a].y); ctx.lineTo(pts2d[b].x, pts2d[b].y); ctx.stroke();
    }
    ctx.restore();
  }
}

export class ValueNoise2D {
  constructor(seed = 1337) {
    this.seed = seed >>> 0;
  }
  _hash(x, y) {
    let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(this.seed, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  sample(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = this._hash(xi, yi);
    const b = this._hash(xi + 1, yi);
    const c = this._hash(xi, yi + 1);
    const d = this._hash(xi + 1, yi + 1);
    return MathEx.lerp(MathEx.lerp(a, b, u), MathEx.lerp(c, d, u), v);
  }
}

export function generateDungeonGrid({ cols = 24, rows = 18, roomCount = 6, minSize = 3, maxSize = 6 } = {}) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  const rooms = [];

  for (let attempt = 0; attempt < roomCount * 6 && rooms.length < roomCount; attempt++) {
    const w = MathEx.randInt(minSize, Math.min(maxSize, cols - 4));
    const h = MathEx.randInt(minSize, Math.min(maxSize, rows - 4));
    const x = MathEx.randInt(1, cols - w - 2);
    const y = MathEx.randInt(1, rows - h - 2);

    const overlaps = rooms.some((r) =>
      x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y
    );
    if (overlaps) continue;

    rooms.push({ x, y, w, h, cx: Math.floor(x + w / 2), cy: Math.floor(y + h / 2) });
    for (let ry = y; ry < y + h; ry++) {
      for (let rx = x; rx < x + w; rx++) grid[ry][rx] = 0;
    }
  }

  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i - 1];
    const curr = rooms[i];
    for (let x = Math.min(prev.cx, curr.cx); x <= Math.max(prev.cx, curr.cx); x++) grid[prev.cy][x] = 0;
    for (let y = Math.min(prev.cy, curr.cy); y <= Math.max(prev.cy, curr.cy); y++) grid[y][curr.cx] = 0;
  }

  return { grid, rooms };
}

export class Tween {
  constructor({ target, prop, to, duration = 0.5, ease = Ease.outQuad, onComplete = null }) {
    this.target = target;
    this.prop = prop;
    this.from = target[prop];
    this.to = to;
    this.duration = Math.max(0.001, duration);
    this.ease = ease;
    this.onComplete = onComplete;
    this.elapsed = 0;
    this.finished = false;
  }
  update(dt) {
    if (this.finished) return;
    this.elapsed += dt;
    const rawT = MathEx.clamp(this.elapsed / this.duration, 0, 1);
    this.target[this.prop] = MathEx.lerp(this.from, this.to, this.ease(rawT));
    if (rawT >= 1) {
      this.finished = true;
      if (this.onComplete) this.onComplete();
    }
  }
}

export class Spring1D {
  constructor({ value = 0, target = value, stiffness = 180, damping = 14 } = {}) {
    this.value = value;
    this.target = target;
    this.vel = 0;
    this.stiffness = stiffness;
    this.damping = damping;
  }
  update(dt) {
    const force = (this.target - this.value) * this.stiffness - this.vel * this.damping;
    this.vel += force * dt;
    this.value += this.vel * dt;
  }
}

export class EventBus {
  constructor() { this.listeners = new Map(); }
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) { const s = this.listeners.get(event); if (s) s.delete(fn); }
  emit(event, payload) { const s = this.listeners.get(event); if (s) for (const fn of [...s]) fn(payload); }
}

export class StateMachine {
  constructor(owner) {
    this.owner = owner; this.states = new Map(); this.current = null; this.currentName = null; this.timeInState = 0;
  }
  addState(name, config) { this.states.set(name, config); return this; }
  setState(name, params = {}) {
    if (this.currentName === name) return;
    const next = this.states.get(name);
    if (!next) throw new Error(`State "${name}" does not exist.`);
    if (this.current && this.current.onExit) this.current.onExit.call(this.owner, this.owner, params);
    this.current = next; this.currentName = name; this.timeInState = 0;
    if (this.current.onEnter) this.current.onEnter.call(this.owner, this.owner, params);
  }
  update(dt) {
    this.timeInState += dt;
    if (this.current && this.current.onUpdate) this.current.onUpdate.call(this.owner, this.owner, dt, this.timeInState);
  }
}

export class Timer {
  constructor(duration, { repeat = false, onComplete = null } = {}) {
    this.duration = duration; this.elapsed = 0; this.repeat = repeat; this.onComplete = onComplete; this.finished = false;
  }
  update(dt) {
    if (this.finished) return;
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      if (this.onComplete) this.onComplete();
      if (this.repeat) this.elapsed %= this.duration;
      else { this.elapsed = this.duration; this.finished = true; }
    }
  }
}

export class Input {
  constructor(canvas) {
    this.keys = new Set(); this.keysPressed = new Set();
    this.mouse = { pos: new Vector2(), worldPos: new Vector2(), down: false, clicked: false };
    this.bindings = new Map();
    this.bufferedAction = null;
    this.bufferTimer = 0;

    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) this.keysPressed.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.pos.x = (e.clientX - rect.left) * (canvas.width / Math.max(1, rect.width));
      this.mouse.pos.y = (e.clientY - rect.top) * (canvas.height / Math.max(1, rect.height));
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { if (!this.mouse.down) this.mouse.clicked = true; this.mouse.down = true; }
    });
    window.addEventListener('mouseup', (e) => { if (e.button === 0) this.mouse.down = false; });
  }
  bindAction(action, codes) { this.bindings.set(action, Array.isArray(codes) ? codes : [codes]); }
  actionDown(action) { return (this.bindings.get(action) || []).some((c) => this.isDown(c)); }
  actionPressed(action) { return (this.bindings.get(action) || []).some((c) => this.isPressed(c)); }
  buffer(action, windowSec = 0.15) { this.bufferedAction = action; this.bufferTimer = windowSec; }
  consumeBuffer(action) {
    if (this.bufferedAction === action && this.bufferTimer > 0) {
      this.bufferedAction = null;
      this.bufferTimer = 0;
      return true;
    }
    return false;
  }
  getGamepad(index = 0) {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    return pads ? pads[index] || null : null;
  }
  isDown(code) { return this.keys.has(code); }
  isPressed(code) { return this.keysPressed.has(code); }
  update(dt, cam) {
    if (this.bufferTimer > 0) {
      this.bufferTimer -= dt;
      if (this.bufferTimer <= 0) this.bufferedAction = null;
    }
    this.mouse.worldPos.x = this.mouse.pos.x + cam.pos.x;
    this.mouse.worldPos.y = this.mouse.pos.y + cam.pos.y;
  }
  endFrame() { this.keysPressed.clear(); this.mouse.clicked = false; }
}

export class Sound {
  constructor() { this.ctx = null; this.muted = false; }
  _init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }
  beep({ freq = 440, type = 'square', duration = 0.1, slideTo = null, volume = 0.2 } = {}) {
    if (this.muted) return;
    this._init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + duration);
  }
}

export class Particle {
  constructor() {
    this.active = false; this.pos = new Vector2(); this.vel = new Vector2();
    this.size = 4; this.endSize = 0; this.color = '#fff'; this.life = 0; this.maxLife = 1; this.gravity = 0;
  }
  spawn({ x, y, vx = 0, vy = 0, size = 4, endSize = 0, color = '#fff', life = 0.5, gravity = 0 }) {
    this.active = true; this.pos.set(x, y); this.vel.set(vx, vy);
    this.size = size; this.endSize = endSize; this.color = color; this.life = 0; this.maxLife = Math.max(0.01, life); this.gravity = gravity;
  }
  update(dt) {
    if (!this.active) return;
    this.life += dt;
    if (this.life >= this.maxLife) { this.active = false; return; }
    this.vel.y += this.gravity * dt;
    this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt;
  }
  draw(ctx) {
    if (!this.active) return;
    const t = this.life / this.maxLife;
    const s = MathEx.lerp(this.size, this.endSize, t);
    if (s <= 0.1) return;
    ctx.save(); ctx.globalAlpha = Math.max(0, 1 - t); ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x - s / 2, this.pos.y - s / 2, s, s); ctx.restore();
  }
}

export class ParticleEmitter {
  constructor(poolSize = 400) { this.pool = Array.from({ length: poolSize }, () => new Particle()); }
  emitBurst(count, configFn) {
    let n = 0;
    for (const p of this.pool) { if (!p.active) { p.spawn(configFn(n, count)); if (++n >= count) break; } }
  }
  update(dt) { for (const p of this.pool) p.update(dt); }
  draw(ctx) { for (const p of this.pool) p.draw(ctx); }
}

export class SpriteAnimation {
  constructor({ frames, frameDuration = 0.1, loop = true }) {
    this.frames = frames; this.frameDuration = frameDuration; this.loop = loop;
    this.timer = 0; this.index = 0; this.finished = false;
  }
  reset() { this.timer = 0; this.index = 0; this.finished = false; }
  update(dt) {
    if (this.finished || this.frames.length <= 1) return;
    this.timer += dt;
    while (this.timer >= this.frameDuration) {
      this.timer -= this.frameDuration;
      if (++this.index >= this.frames.length) {
        if (this.loop) this.index = 0;
        else { this.index = this.frames.length - 1; this.finished = true; break; }
      }
    }
  }
  get currentFrame() { return this.frames[this.index]; }
}

export class Animator {
  constructor() { this.animations = new Map(); this.currentKey = null; this.currentAnim = null; }
  add(name, anim) { this.animations.set(name, anim); if (!this.currentAnim) this.play(name); return this; }
  play(name, resetIfSame = false) {
    if (this.currentKey === name && !resetIfSame) return;
    const anim = this.animations.get(name);
    if (!anim) return;
    this.currentKey = name; this.currentAnim = anim; this.currentAnim.reset();
  }
  update(dt) { if (this.currentAnim) this.currentAnim.update(dt); }
  get frame() { return this.currentAnim ? this.currentAnim.currentFrame : null; }
}

export class Entity {
  constructor(x = 0, y = 0, w = 32, h = 32) {
    this.pos = new Vector2(x, y); this.vel = new Vector2(0, 0); this.size = new Vector2(w, h);
    this.color = '#ffffff'; this.tag = 'default'; this.dead = false; this.zIndex = 0;
    this.rotation = 0; this.flipX = false; this.solid = false;
  }
  get center() { return new Vector2(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2); }
  update(dt) { this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt; }
  draw(ctx) {
    ctx.save(); ctx.translate(this.center.x, this.center.y); ctx.rotate(this.rotation);
    ctx.scale(this.flipX ? -1 : 1, 1); ctx.fillStyle = this.color;
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y); ctx.restore();
  }
  collidesWith(other) {
    return (
      this.pos.x < other.pos.x + other.size.x && this.pos.x + this.size.x > other.pos.x &&
      this.pos.y < other.pos.y + other.size.y && this.pos.y + this.size.y > other.pos.y
    );
  }
  overlapsCircle(cx, cy, radius) {
    const dx = cx - MathEx.clamp(cx, this.pos.x, this.pos.x + this.size.x);
    const dy = cy - MathEx.clamp(cy, this.pos.y, this.pos.y + this.size.y);
    return dx * dx + dy * dy <= radius * radius;
  }
  resolveAABB(other) {
    if (!this.collidesWith(other)) return null;
    const oL = this.pos.x + this.size.x - other.pos.x;
    const oR = other.pos.x + other.size.x - this.pos.x;
    const oT = this.pos.y + this.size.y - other.pos.y;
    const oB = other.pos.y + other.size.y - this.pos.y;
    if (Math.min(oL, oR) < Math.min(oT, oB)) {
      if (oL < oR) { this.pos.x -= oL; this.vel.x = 0; return 'left'; }
      this.pos.x += oR; this.vel.x = 0; return 'right';
    }
    if (oT < oB) { this.pos.y -= oT; this.vel.y = 0; return 'top'; }
    this.pos.y += oB; this.vel.y = 0; return 'bottom';
  }
}

export class Sprite extends Entity {
  constructor(x, y, w, h, imageSrc, frameRect = null) {
    super(x, y, w, h);
    this.image = new Image(); this.image.src = imageSrc; this.loaded = false;
    this.frameRect = frameRect; this.animator = null;
    this.image.onload = () => (this.loaded = true);
  }
  update(dt, game) { super.update(dt, game); if (this.animator) this.animator.update(dt); }
  draw(ctx) {
    if (!this.loaded) { super.draw(ctx); return; }
    const rect = (this.animator && this.animator.frame) || this.frameRect;
    ctx.save(); ctx.translate(this.center.x, this.center.y); ctx.rotate(this.rotation); ctx.scale(this.flipX ? -1 : 1, 1);
    if (rect) ctx.drawImage(this.image, rect.x, rect.y, rect.w, rect.h, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
    else ctx.drawImage(this.image, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
    ctx.restore();
  }
}

export class SpatialHash {
  constructor(cellSize = 64) { this.cellSize = cellSize; this.cells = new Map(); }
  clear() { this.cells.clear(); }
  insert(entity) {
    const sx = Math.floor(entity.pos.x / this.cellSize), ex = Math.floor((entity.pos.x + entity.size.x) / this.cellSize);
    const sy = Math.floor(entity.pos.y / this.cellSize), ey = Math.floor((entity.pos.y + entity.size.y) / this.cellSize);
    for (let x = sx; x <= ex; x++) {
      for (let y = sy; y <= ey; y++) {
        const k = `${x},${y}`;
        if (!this.cells.has(k)) this.cells.set(k, []);
        this.cells.get(k).push(entity);
      }
    }
  }
  query(entity) {
    const out = new Set();
    const sx = Math.floor(entity.pos.x / this.cellSize), ex = Math.floor((entity.pos.x + entity.size.x) / this.cellSize);
    const sy = Math.floor(entity.pos.y / this.cellSize), ey = Math.floor((entity.pos.y + entity.size.y) / this.cellSize);
    for (let x = sx; x <= ex; x++) {
      for (let y = sy; y <= ey; y++) {
        for (const o of (this.cells.get(`${x},${y}`) || [])) { if (o !== entity && !o.dead) out.add(o); }
      }
    }
    return [...out];
  }
}

export class Tilemap {
  constructor({ cols, rows, tileSize = 32, grid = null, solidValues = [1], palette = null }) {
    this.cols = cols; this.rows = rows; this.tileSize = tileSize;
    this.solidValues = new Set(solidValues);
    this.palette = palette || { 0: null, 1: '#334155', 2: '#0f766e', 3: '#b45309' };
    this.grid = grid || Array.from({ length: rows }, () => Array(cols).fill(0));
  }
  getTile(col, row) { return (col < 0 || row < 0 || col >= this.cols || row >= this.rows) ? 1 : this.grid[row][col]; }
  isSolidTile(col, row) { return this.solidValues.has(this.getTile(col, row)); }
  worldToGrid(wx, wy) { return { col: Math.floor(wx / this.tileSize), row: Math.floor(wy / this.tileSize) }; }
  gridToWorldCenter(col, row) { return new Vector2(col * this.tileSize + this.tileSize / 2, row * this.tileSize + this.tileSize / 2); }
  resolveEntity(entity) {
    const sc = Math.floor(entity.pos.x / this.tileSize), ec = Math.floor((entity.pos.x + entity.size.x) / this.tileSize);
    const sr = Math.floor(entity.pos.y / this.tileSize), er = Math.floor((entity.pos.y + entity.size.y) / this.tileSize);
    for (let r = sr; r <= er; r++) {
      for (let c = sc; c <= ec; c++) {
        if (this.isSolidTile(c, r)) entity.resolveAABB(new Entity(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize));
      }
    }
  }
  findPath(startWorld, goalWorld) {
    const start = this.worldToGrid(startWorld.x, startWorld.y);
    const goal = this.worldToGrid(goalWorld.x, goalWorld.y);
    if (this.isSolidTile(goal.col, goal.row)) return [];
    const key = (c, r) => `${c},${r}`;
    const open = [{ col: start.col, row: start.row, g: 0, f: 0, parent: null }];
    const closed = new Set();
    const gScore = new Map([[key(start.col, start.row), 0]]);
    const dirs = [{ dc: 1, dr: 0 }, { dc: -1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: -1 }];
    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const cur = open.shift();
      if (cur.col === goal.col && cur.row === goal.row) {
        const path = [];
        for (let n = cur; n; n = n.parent) path.push(this.gridToWorldCenter(n.col, n.row));
        return path.reverse();
      }
      closed.add(key(cur.col, cur.row));
      for (const d of dirs) {
        const nc = cur.col + d.dc, nr = cur.row + d.dr, nk = key(nc, nr);
        if (closed.has(nk) || this.isSolidTile(nc, nr)) continue;
        const tg = cur.g + 1;
        if (!gScore.has(nk) || tg < gScore.get(nk)) {
          gScore.set(nk, tg);
          open.push({ col: nc, row: nr, g: tg, f: tg + Math.abs(nc - goal.col) + Math.abs(nr - goal.row), parent: cur });
        }
      }
    }
    return [];
  }
  draw(ctx) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const color = this.palette[this.grid[r][c]];
        if (color) { ctx.fillStyle = color; ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize); }
      }
    }
  }
}

export class UIButton {
  constructor({ x, y, w, h, label, onClick, bg = '#1e293b', hoverBg = '#334155', fg = '#f8fafc', font = '16px monospace' }) {
    Object.assign(this, { x, y, w, h, label, onClick, bg, hoverBg, fg, font, hovered: false });
  }
  update(input) {
    const { x: mx, y: my } = input.mouse.pos;
    this.hovered = mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
    if (this.hovered && input.mouse.clicked && this.onClick) this.onClick();
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.hovered ? this.hoverBg : this.bg;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#64748b'; ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = this.fg; ctx.font = this.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x + this.w / 2, this.y + this.h / 2);
    ctx.restore();
  }
}

export class UIBar {
  constructor({ x, y, w, h, value = 100, max = 100, fill = '#22c55e', bg = '#1e293b' }) {
    Object.assign(this, { x, y, w, h, value, max, fill, bg });
  }
  draw(ctx) {
    const ratio = MathEx.clamp(this.max <= 0 ? 0 : this.value / this.max, 0, 1);
    ctx.save();
    ctx.fillStyle = this.bg; ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = this.fill; ctx.fillRect(this.x, this.y, this.w * ratio, this.h);
    ctx.strokeStyle = '#475569'; ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.restore();
  }
}

export const Storage = {
  save(slotKey, data) { try { localStorage.setItem(`veloce_slot_${slotKey}`, JSON.stringify(data)); return true; } catch { return false; } },
  load(slotKey, fallback = null) { try { const raw = localStorage.getItem(`veloce_slot_${slotKey}`); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } },
  remove(slotKey) { try { localStorage.removeItem(`veloce_slot_${slotKey}`); return true; } catch { return false; } },
};

export class Camera {
  constructor(width, height) {
    this.pos = new Vector2(0, 0); this.width = width; this.height = height;
    this.shakeTimer = 0; this.shakeIntensity = 0;
  }
  follow(entity, lerp = 0.1) {
    this.pos.x += (entity.center.x - this.width / 2 - this.pos.x) * lerp;
    this.pos.y += (entity.center.y - this.height / 2 - this.pos.y) * lerp;
  }
  shake(intensity = 5, duration = 0.2) { this.shakeIntensity = intensity; this.shakeTimer = duration; }
  apply(ctx, dt) {
    let ox = -this.pos.x, oy = -this.pos.y;
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      ox += (Math.random() - 0.5) * 2 * this.shakeIntensity;
      oy += (Math.random() - 0.5) * 2 * this.shakeIntensity;
    }
    ctx.translate(ox, oy);
  }
}

export class Scene {
  constructor() {
    this.entities = []; this.timers = []; this.tweens = []; this.particles = new ParticleEmitter(400);
    this.spatialHash = new SpatialHash(64); this.tilemap = null; this.game = null;
  }
  init() {}
  add(entity) { this.entities.push(entity); return entity; }
  addTimer(timer) { this.timers.push(timer); return timer; }
  addTween(tween) { this.tweens.push(tween); return tween; }
  findByTag(tag) { return this.entities.filter((e) => e.tag === tag && !e.dead); }
  update(dt) {
    for (const t of this.timers) t.update(dt);
    this.timers = this.timers.filter((t) => !t.finished);
    for (const tw of this.tweens) tw.update(dt);
    this.tweens = this.tweens.filter((tw) => !tw.finished);
    for (const e of this.entities) {
      if (!e.dead) { e.update(dt, this.game); if (this.tilemap && e.solid) this.tilemap.resolveEntity(e); }
    }
    this.particles.update(dt);
    this.entities = this.entities.filter((e) => !e.dead);
  }
  draw(ctx) {
    if (this.tilemap) this.tilemap.draw(ctx);
    for (const e of [...this.entities].sort((a, b) => a.zIndex - b.zIndex)) { if (!e.dead) e.draw(ctx); }
    this.particles.draw(ctx);
  }
}

export class Game {
  constructor({ width = 800, height = 600, background = '#111118', container = document.body } = {}) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width; this.canvas.height = height;
    this.canvas.style.display = 'block'; this.canvas.style.margin = '0 auto';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.background = background;
    this.input = new Input(this.canvas);
    this.sound = new Sound();
    this.camera = new Camera(width, height);
    this.events = new EventBus();
    this.scenes = new Map();
    this.currentScene = null;
    this.lastTime = 0;
    this.running = false;
  }
  registerScene(name, scene) { scene.game = this; this.scenes.set(name, scene); }
  switchScene(name) {
    const scene = this.scenes.get(name);
    if (!scene) throw new Error(`Scene "${name}" not found.`);
    this.currentScene = scene; this.currentScene.entities = []; this.currentScene.timers = []; this.currentScene.tweens = [];
    this.currentScene.init();
    this.events.emit('scene:changed', name);
  }
  start() { this.running = true; this.lastTime = performance.now(); requestAnimationFrame((t) => this._loop(t)); }
  _loop(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.input.update(dt, this.camera);
    if (this.currentScene) {
      this.currentScene.update(dt);
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.save(); this.camera.apply(this.ctx, dt); this.currentScene.draw(this.ctx); this.ctx.restore();
      if (this.currentScene.drawUI) this.currentScene.drawUI(this.ctx);
    }
    this.input.endFrame();
    requestAnimationFrame((t) => this._loop(t));
  }
}
