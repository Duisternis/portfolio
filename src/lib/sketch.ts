const CELL_W = 7;
const CELL_H = 18;
const BASELINE = 13;
const PAD = 1;
const LABEL_WIDTH = 24;
const ARROW = 5;
const DOT = 2;

type Point = { x: number; y: number };

type Shape = 'rect' | 'person' | 'db' | 'hex';

type Tone = 'default' | 'muted' | 'focus';

type Line = { text: string; meta: boolean };

type Box = {
  name: string;
  body: Line[];
  col: number;
  row: number;
  cols: number;
  rows: number;
  shape: Shape;
  center: boolean;
  tone: Tone;
};

type Placement = 'above' | 'below';
type Side = 'left' | 'right' | 'top' | 'bottom';
type Heads = 'end' | 'start' | 'both' | 'none';

type End = { name: string; side?: Side };

type Link = {
  from: End;
  to: End;
  label: string[];
  dashed: boolean;
  dotted: boolean;
  heads: Heads;
  placement?: Placement;
};

type Art =
  | {
      kind: 'path';
      points: Point[];
      dashed: boolean;
      dotted: boolean;
      accent: boolean;
      curved: boolean;
      closed: boolean;
      filled: boolean;
      mask: boolean;
      arrow: boolean;
    }
  | { kind: 'dot'; at: Point; accent: boolean }
  | { kind: 'circle'; at: Point; r: number; dashed: boolean; accent: boolean }
  | { kind: 'text'; at: Point; value: string; tier?: 'meta' | 'body' };

type Group = { name: string; members: string[] };

type Rect = { x: number; y: number; w: number; h: number };

const BOX = /^box\s+(.+?)\s+at\s+([\d.]+),([\d.]+)\s+size\s+([\d.]+)x([\d.]+)(.*)$/;
const ATTR = /([a-z]+)=(\S+)/g;
const SHAPES = ['rect', 'person', 'db', 'hex'] as const;
const TONES = ['default', 'muted', 'focus'] as const;
const KEYS = [...TONES, 'solid', 'dashed', 'dotted'] as const;
const LEGEND = /^legend\s+([a-z]+)\s*:\s*(.+)$/;
const GROUP = /^group\s+(.+?)\s*:\s*(.+)$/;
const ALIGN = /^align\s+center$/;
const TEXT = /^text\s+([\d.]+),([\d.]+)(?:\s+(meta|body))?\s*:\s*(.+)$/;
const DOT_AT = /^dot\s+([\d.]+),([\d.]+)$/;
const CIRCLE = /^circle\s+([\d.]+),([\d.]+)\s+r\s+([\d.]+)$/;
const PATH = /^(path|line|curve)\s+(.+)$/;
const LINK = /^(.+?)\s*(<-->|<->|<--|<-|-->|->|--)\s*([^:]+?)\s*(?::\s*(.+))?$/;
const END = /^(.+?)(?:@(left|right|top|bottom))?$/;
const POINT = /^([\d.]+),([\d.]+)$/;

const MODIFIERS = ['dashed', 'dotted', 'accent', 'closed', 'filled', 'mask', 'arrow'] as const;
const PLACEMENTS = ['above', 'below'] as const;

const ARROWS: Record<string, { dashed: boolean; heads: Heads }> = {
  '->': { dashed: false, heads: 'end' },
  '-->': { dashed: true, heads: 'end' },
  '<-': { dashed: false, heads: 'start' },
  '<--': { dashed: true, heads: 'start' },
  '<->': { dashed: false, heads: 'both' },
  '<-->': { dashed: true, heads: 'both' },
  '--': { dashed: false, heads: 'none' },
};

class SketchError extends Error {
  constructor(message: string, line?: number) {
    super(line ? `sketch line ${line}: ${message}` : `sketch: ${message}`);
    this.name = 'SketchError';
  }
}

const cell = (col: string, row: string): Point => ({
  x: Number(col) * CELL_W,
  y: Number(row) * CELL_H,
});

function splitModifiers(line: string) {
  const words = line.split(/\s+/);
  const found = new Set<string>();
  while (MODIFIERS.includes(words.at(-1) as (typeof MODIFIERS)[number])) found.add(words.pop()!);
  return {
    rest: words.join(' '),
    dashed: found.has('dashed'),
    dotted: found.has('dotted'),
    accent: found.has('accent'),
    closed: found.has('closed'),
    filled: found.has('filled'),
    mask: found.has('mask'),
    arrow: found.has('arrow'),
  };
}

function parsePoints(source: string, line: number): Point[] {
  const points = source.split('>').map((part) => {
    const point = POINT.exec(part.trim());
    if (!point) throw new SketchError(`bad point "${part.trim()}"`, line);
    return cell(point[1], point[2]);
  });
  if (points.length < 2) throw new SketchError('a path needs two points', line);
  return points;
}

function parseArt(line: string, index: number): Art | undefined {
  const text = TEXT.exec(line);
  if (text) {
    return {
      kind: 'text',
      at: cell(text[1], text[2]),
      value: text[4],
      tier: text[3] as 'meta' | 'body' | undefined,
    };
  }

  const { rest, dashed, dotted, accent, closed, filled, mask, arrow } = splitModifiers(line);

  const dot = DOT_AT.exec(rest);
  if (dot) return { kind: 'dot', at: cell(dot[1], dot[2]), accent };

  const circle = CIRCLE.exec(rest);
  if (circle) {
    return {
      kind: 'circle',
      at: cell(circle[1], circle[2]),
      r: Number(circle[3]) * CELL_W,
      dashed,
      accent,
    };
  }

  const path = PATH.exec(rest);
  if (path) {
    return {
      kind: 'path',
      points: parsePoints(path[2], index),
      curved: path[1] === 'curve',
      closed: closed || filled || mask,
      filled,
      mask,
      dashed,
      dotted,
      accent,
      arrow,
    };
  }

  return undefined;
}

function fold(source: string, width: number): string[] {
  const words = source.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];

  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(line);
      line = '';
    }
    line = line ? `${line} ${word}` : word;
    while (line.length > width) {
      lines.push(line.slice(0, width));
      line = line.slice(width);
    }
  }
  if (line) lines.push(line);
  return lines;
}

function wrap(source: string, width: number): Line[] {
  return source
    .split('|')
    .flatMap((part, paragraph) =>
      fold(part, width).map((text) => ({ text, meta: paragraph === 0 })),
    );
}

function parseAttrs(source: string, line: number) {
  let shape: Shape = 'rect';
  let center = false;
  let tone: Tone = 'default';

  for (const [, key, value] of source.matchAll(ATTR)) {
    if (key === 'shape') {
      if (!SHAPES.includes(value as Shape)) throw new SketchError(`unknown shape "${value}"`, line);
      shape = value as Shape;
    } else if (key === 'align') {
      center = value === 'center';
    } else if (key === 'tone') {
      if (!TONES.includes(value as Tone)) throw new SketchError(`unknown tone "${value}"`, line);
      tone = value as Tone;
    } else {
      throw new SketchError(`unknown attribute "${key}"`, line);
    }
  }

  const leftover = source.replace(ATTR, '').trim();
  if (leftover) throw new SketchError(`cannot parse "${leftover}"`, line);

  return { shape, center, tone };
}

function parseEnd(source: string, line: number): End {
  const end = END.exec(source);
  if (!end) throw new SketchError(`cannot parse "${source}"`, line);
  return { name: end[1].trim(), side: end[2] as Side | undefined };
}

function parse(source: string) {
  const boxes: Box[] = [];
  const links: Link[] = [];
  const art: Art[] = [];
  const groups: Group[] = [];
  const legend: { key: string; text: string }[] = [];
  let centred = false;

  source.split('\n').forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;

    const box = BOX.exec(line);
    if (box) {
      const name = box[1];
      const cols = Number(box[4]);
      const rows = Number(box[5]);
      const tail = box[6] ?? '';
      const split = tail.indexOf(':');
      const attrs = parseAttrs(split === -1 ? tail : tail.slice(0, split), index + 1);
      const body = split === -1 ? [] : wrap(tail.slice(split + 1), cols - 4);
      const lines = [name, ...body.map((line) => line.text)];

      if (boxes.some((other) => other.name === name)) {
        throw new SketchError(`duplicate box "${name}"`, index + 1);
      }

      const widest = Math.max(...lines.map((line) => line.length));
      if (widest + 3 > cols) {
        throw new SketchError(
          `box "${name}" needs ${widest + 3} cells of width, it is ${cols}`,
          index + 1,
        );
      }
      if (lines.length > rows) {
        throw new SketchError(
          `box "${name}" needs ${lines.length} rows for its text, it is ${rows}`,
          index + 1,
        );
      }

      boxes.push({
        name,
        body,
        col: Number(box[2]),
        row: Number(box[3]),
        cols,
        rows,
        shape: attrs.shape,
        center: attrs.center,
        tone: attrs.tone,
      });
      return;
    }

    if (ALIGN.test(line)) {
      centred = true;
      return;
    }

    const entry = LEGEND.exec(line);
    if (entry) {
      if (!KEYS.includes(entry[1] as (typeof KEYS)[number])) {
        throw new SketchError(`unknown legend key "${entry[1]}"`, index + 1);
      }
      legend.push({ key: entry[1], text: entry[2] });
      return;
    }

    const group = GROUP.exec(line);
    if (group) {
      groups.push({
        name: group[1],
        members: group[2].split(',').map((member) => member.trim()),
      });
      return;
    }

    const shape = parseArt(line, index + 1);
    if (shape) {
      art.push(shape);
      return;
    }

    const link = LINK.exec(line);
    if (!link) throw new SketchError(`cannot parse "${line}"`, index + 1);

    const target = link[3].trim().split(/\s+/);
    let placement: Placement | undefined;
    let dotted = false;

    while (target.length > 1) {
      const last = target.at(-1)!;
      if (PLACEMENTS.includes(last as Placement)) placement = target.pop() as Placement;
      else if (last === 'dotted') { dotted = target.pop() ? true : true; }
      else break;
    }

    const from = parseEnd(link[1].trim(), index + 1);
    const to = parseEnd(target.join(' '), index + 1);
    if (from.name === to.name) {
      throw new SketchError(`"${from.name}" links to itself`, index + 1);
    }

    links.push({
      from,
      to,
      label: link[4] ? link[4].split('|').map((part) => part.trim()) : [],
      dotted,
      placement,
      ...ARROWS[link[2]],
    });
  });

  const names = new Set(boxes.map((box) => box.name));
  for (const link of links) {
    for (const end of [link.from, link.to]) {
      if (!names.has(end.name)) throw new SketchError(`unknown box "${end.name}"`);
    }
  }

  for (const group of groups) {
    for (const member of group.members) {
      if (!names.has(member)) throw new SketchError(`group "${group.name}" has no box "${member}"`);
    }
  }

  if (boxes.length === 0 && art.length === 0) throw new SketchError('nothing to draw');

  return { boxes, links, art, groups, legend, centred };
}

const rect = (box: Box): Rect => ({
  x: box.col * CELL_W,
  y: box.row * CELL_H,
  w: box.cols * CELL_W,
  h: box.rows * CELL_H,
});

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const classes = (...names: (string | false)[]) => names.filter(Boolean).join(' ');

function bounds(group: Group, frames: Map<string, Rect>): Rect {
  const members = group.members.map((member) => frames.get(member)!);
  const x = Math.min(...members.map((frame) => frame.x)) - CELL_W;
  const y = Math.min(...members.map((frame) => frame.y)) - CELL_H * 2;
  return {
    x,
    y,
    w: Math.max(...members.map((frame) => frame.x + frame.w)) + CELL_W - x,
    h: Math.max(...members.map((frame) => frame.y + frame.h)) + CELL_H / 2 - y,
  };
}

function drawGroup(group: Group, frame: Rect) {
  return (
    `<rect class="sketch-group" x="${frame.x + 0.5}" y="${frame.y + 0.5}" ` +
    `width="${frame.w - 1}" height="${frame.h - 1}" rx="2" />` +
    `<text class="sketch-note" x="${frame.x + CELL_W}" y="${frame.y + BASELINE}">${escape(group.name)}</text>`
  );
}

function extent(boxes: Box[], art: Art[], placed: Placed[], regions: Rect[]) {
  const corners: Point[] = [];

  for (const frame of regions) {
    corners.push({ x: frame.x, y: frame.y }, { x: frame.x + frame.w, y: frame.y + frame.h });
  }

  for (const box of boxes) {
    const frame = rect(box);
    const head = box.shape === 'person' ? CELL_H : 0;
    corners.push(
      { x: frame.x, y: frame.y - head },
      { x: frame.x + frame.w, y: frame.y + frame.h },
    );
  }

  for (const shape of art) {
    if (shape.kind === 'path') corners.push(...shape.points);
    if (shape.kind === 'dot') {
      corners.push({ x: shape.at.x - DOT, y: shape.at.y - DOT }, { x: shape.at.x + DOT, y: shape.at.y + DOT });
    }
    if (shape.kind === 'circle') {
      corners.push(
        { x: shape.at.x - shape.r, y: shape.at.y - shape.r },
        { x: shape.at.x + shape.r, y: shape.at.y + shape.r },
      );
    }
    if (shape.kind === 'text') {
      corners.push(
        { x: shape.at.x, y: shape.at.y },
        { x: shape.at.x + shape.value.length * CELL_W, y: shape.at.y + CELL_H },
      );
    }
  }

  for (const { wire, label } of placed) {
    corners.push(...wire.points);
    if (!label) continue;
    const left = wire.anchor === 'middle' ? label.x - label.width / 2 : label.x;
    const bottom = label.y + (label.lines.length - 1) * CELL_H;
    corners.push({ x: left, y: label.y - CELL_H }, { x: left + label.width, y: bottom });
  }

  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);
  const left = Math.min(...xs) - CELL_W * PAD;
  const top = Math.min(...ys) - CELL_H * PAD;

  return {
    left,
    top,
    width: Math.max(...xs) + CELL_W * PAD - left,
    height: Math.max(...ys) + CELL_H * PAD - top,
  };
}

const OUTWARD: Record<Side, number> = { left: 180, right: 0, top: 270, bottom: 90 };

function anchor(frame: Rect, side: Side): Point {
  if (side === 'left') return { x: frame.x, y: frame.y + frame.h / 2 };
  if (side === 'right') return { x: frame.x + frame.w, y: frame.y + frame.h / 2 };
  if (side === 'top') return { x: frame.x + frame.w / 2, y: frame.y };
  return { x: frame.x + frame.w / 2, y: frame.y + frame.h };
}

function pickSides(from: Rect, to: Rect): [Side, Side] {
  const right = to.x - (from.x + from.w);
  const left = from.x - (to.x + to.w);
  const down = to.y - (from.y + from.h);
  const up = from.y - (to.y + to.h);
  const across = Math.max(right, left);
  const along = Math.max(down, up);

  if (across >= along && across >= 0) {
    return right >= left ? ['right', 'left'] : ['left', 'right'];
  }
  return down >= up ? ['bottom', 'top'] : ['top', 'bottom'];
}

const horizontal = (side: Side) => side === 'left' || side === 'right';

function elbow(start: Point, from: Side, end: Point, to: Side): Point[] {
  if (horizontal(from) && horizontal(to)) {
    const mid = Math.round((start.x + end.x) / 2);
    return [start, { x: mid, y: start.y }, { x: mid, y: end.y }, end];
  }
  if (!horizontal(from) && !horizontal(to)) {
    const mid = Math.round((start.y + end.y) / 2);
    return [start, { x: start.x, y: mid }, { x: end.x, y: mid }, end];
  }
  if (horizontal(from)) return [start, { x: end.x, y: start.y }, end];
  return [start, { x: start.x, y: end.y }, end];
}

function route(from: Rect, to: Rect, sides: [Side | undefined, Side | undefined]) {
  const auto = pickSides(from, to);
  const fromSide = sides[0] ?? auto[0];
  const toSide = sides[1] ?? auto[1];
  const start = anchor(from, fromSide);
  const end = anchor(to, toSide);
  const inline = horizontal(fromSide) && horizontal(toSide);
  const mixed = horizontal(fromSide) !== horizontal(toSide);
  const corner = horizontal(fromSide) ? { x: end.x, y: start.y } : { x: start.x, y: end.y };

  const points = elbow(start, fromSide, end, toSide);

  return {
    points,
    d: straight(points, false),
    start,
    end,
    enter: (OUTWARD[toSide] + 180) % 360,
    exit: (OUTWARD[fromSide] + 180) % 360,
    gap: inline ? Math.abs(end.x - start.x) : Infinity,
    anchor: inline || (!mixed && start.x !== end.x) ? 'middle' : 'start',
    x: inline
      ? Math.round((start.x + end.x) / 2)
      : mixed
        ? corner.x + CELL_W
        : start.x === end.x
          ? start.x + CELL_W
          : Math.round((start.x + end.x) / 2),
    inGap: inline
      ? Math.min(start.y, end.y) - CELL_H + BASELINE
      : mixed
        ? corner.y - CELL_H + BASELINE
        : start.x === end.x
          ? Math.round((start.y + end.y) / 2) + BASELINE
          : Math.round((start.y + end.y) / 2) - CELL_H + BASELINE,
    above: Math.min(from.y, to.y) - CELL_H + BASELINE,
    below: Math.max(from.y + from.h, to.y + to.h) + BASELINE,
  };
}

type Wire = ReturnType<typeof route>;

type Placed = {
  wire: Wire;
  link: Link;
  label?: { x: number; y: number; width: number; lines: string[] };
};

function place(link: Link, frames: Map<string, Rect>): Placed {
  const wire = route(frames.get(link.from.name)!, frames.get(link.to.name)!, [
    link.from.side,
    link.to.side,
  ]);
  if (link.label.length === 0) return { wire, link };

  const room =
    wire.gap === Infinity ? LABEL_WIDTH : Math.min(LABEL_WIDTH, Math.floor(wire.gap / CELL_W) - 2);

  if (!link.placement && room < 8) {
    throw new SketchError(
      `no room for the label between ${link.from.name} and ${link.to.name}; ` +
        `widen the gap or place the link above or below`,
    );
  }

  const lines = link.label.flatMap((part) => fold(part, Math.max(room, 8)));
  const width = Math.max(...lines.map((line) => line.length)) * CELL_W;
  const anchored = link.placement ? wire[link.placement] : wire.inGap;

  const shift =
    link.placement === 'below'
      ? 0
      : link.placement === 'above' || wire.gap !== Infinity
        ? lines.length - 1
        : Math.floor(lines.length / 2);

  return { wire, link, label: { x: wire.x, y: anchored - shift * CELL_H, width, lines } };
}

const round = (value: number) => Math.round(value * 10) / 10;

function straight(points: Point[], closed: boolean) {
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join('');
  return closed ? `${d}Z` : d;
}

function curved(points: Point[], closed: boolean) {
  const at = (i: number) =>
    closed
      ? points[(i + points.length) % points.length]
      : points[Math.min(Math.max(i, 0), points.length - 1)];

  const last = closed ? points.length : points.length - 1;
  let d = `M${at(0).x} ${at(0).y}`;

  for (let i = 0; i < last; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${p2.x} ${p2.y}`;
  }

  return closed ? `${d}Z` : d;
}

function arrowhead(tip: Point, angle: number) {
  const points = `0,0 ${-ARROW},${-ARROW / 2} ${-ARROW},${ARROW / 2}`;
  return `<polygon class="sketch-head" points="${points}" transform="translate(${tip.x} ${tip.y}) rotate(${angle})" />`;
}

const toneClass = (tone: Tone) => (tone === 'default' ? '' : `sketch-${tone}`);

function outline(frame: Rect, shape: Shape, tone: Tone) {
  const skin = classes('sketch-box', toneClass(tone));

  if (shape === 'db') {
    const lip = CELL_H / 2;
    const { x, y, w, h } = { x: frame.x + 0.5, y: frame.y + 0.5, w: frame.w - 1, h: frame.h - 1 };
    return (
      `<path class="${skin}" d="M${x} ${y + lip}A${w / 2} ${lip} 0 0 1 ${x + w} ${y + lip}` +
      `V${y + h - lip}A${w / 2} ${lip} 0 0 1 ${x} ${y + h - lip}Z" />` +
      `<path class="sketch-lip" d="M${x} ${y + lip}A${w / 2} ${lip} 0 0 0 ${x + w} ${y + lip}" />`
    );
  }

  if (shape === 'hex') {
    const { x, y, w, h } = { x: frame.x + 0.5, y: frame.y + 0.5, w: frame.w - 1, h: frame.h - 1 };
    const c = CELL_W;
    return (
      `<path class="${skin}" d="M${x + c} ${y}H${x + w - c}L${x + w} ${y + c}` +
      `V${y + h - c}L${x + w - c} ${y + h}H${x + c}L${x} ${y + h - c}V${y + c}Z" />`
    );
  }

  const body =
    `<rect class="${skin}" x="${frame.x + 0.5}" y="${frame.y + 0.5}" ` +
    `width="${frame.w - 1}" height="${frame.h - 1}" rx="${shape === 'person' ? CELL_W : 2}" />`;

  if (shape !== 'person') return body;

  const head = CELL_H / 2;
  return (
    `<circle class="${skin}" cx="${frame.x + frame.w / 2}" cy="${frame.y - head}" r="${head}" />` +
    body
  );
}

function drawBox(box: Box) {
  const frame = rect(box);
  const lines: Line[] = [{ text: box.name, meta: false }, ...box.body];
  const top = frame.y + ((box.rows - lines.length) / 2) * CELL_H;
  const x = box.center ? frame.x + frame.w / 2 : frame.x + 2 * CELL_W;
  const anchor = box.center ? 'middle' : 'start';

  const text = lines
    .map((line, index) => {
      const kind =
        index === 0
          ? classes('sketch-label', toneClass(box.tone))
          : line.meta
            ? 'sketch-note'
            : 'sketch-body';
      return (
        `<text class="${kind}" text-anchor="${anchor}" x="${x}" ` +
        `y="${top + index * CELL_H + BASELINE}">${escape(line.text)}</text>`
      );
    })
    .join('');

  return outline(frame, box.shape, box.tone) + text;
}

function drawArt(shape: Art) {
  if (shape.kind === 'text') {
    const kind =
      shape.tier === 'meta' ? 'sketch-note' : shape.tier === 'body' ? 'sketch-body' : 'sketch-label';
    return (
      `<text class="${kind}" x="${shape.at.x}" y="${shape.at.y + BASELINE}">` +
      `${escape(shape.value)}</text>`
    );
  }

  if (shape.kind === 'dot') {
    return (
      `<circle class="${classes('sketch-dot', shape.accent && 'sketch-accent')}" ` +
      `cx="${shape.at.x}" cy="${shape.at.y}" r="${DOT}" />`
    );
  }

  if (shape.kind === 'circle') {
    return (
      `<circle class="${classes('sketch-wire', shape.dashed && 'sketch-dashed', shape.accent && 'sketch-accent')}" ` +
      `cx="${shape.at.x}" cy="${shape.at.y}" r="${shape.r}" />`
    );
  }

  const d = shape.curved
    ? curved(shape.points, shape.closed)
    : straight(shape.points, shape.closed);
  const stroke = classes(
    'sketch-wire',
    shape.dashed && 'sketch-dashed',
    shape.dotted && 'sketch-dotted',
    shape.accent && 'sketch-accent',
    shape.filled && 'sketch-filled',
    shape.mask && 'sketch-mask',
  );
  if (!shape.arrow) return `<path class="${stroke}" d="${d}" />`;

  const tip = shape.points.at(-1)!;
  const prior = shape.points.at(-2)!;
  const angle = (Math.atan2(tip.y - prior.y, tip.x - prior.x) * 180) / Math.PI;
  return `<path class="${stroke}" d="${d}" />` + arrowhead(tip, angle);
}

function drawLink({ wire, link, label }: Placed) {
  const heads =
    (link.heads === 'end' || link.heads === 'both' ? arrowhead(wire.end, wire.enter) : '') +
    (link.heads === 'start' || link.heads === 'both' ? arrowhead(wire.start, wire.exit) : '');
  const path =
    `<path class="${classes(
      'sketch-wire',
      link.dashed && 'sketch-dashed',
      link.dotted && 'sketch-dotted',
    )}" d="${wire.d}" />` + heads;
  if (!label) return path;

  const text = label.lines
    .map((line, index) => {
      const y = label.y + index * CELL_H;
      return (
        `<text class="sketch-note" text-anchor="${wire.anchor}" x="${label.x}" y="${y}">` +
        `${escape(line)}</text>`
      );
    })
    .join('');

  return path + text;
}

function drawLegend(entries: { key: string; text: string }[], right: number, top: number) {
  const width = (Math.max(...entries.map((entry) => entry.text.length)) + 4) * CELL_W;
  const left = right - width;

  const rows = entries.map((entry, index) => {
    const y = top + index * CELL_H;
    const swatch = TONES.includes(entry.key as Tone)
      ? `<rect class="${classes('sketch-box', toneClass(entry.key as Tone))}" ` +
        `x="${left + 0.5}" y="${y + 4.5}" width="${2 * CELL_W - 1}" height="9" rx="2" />`
      : `<path class="${classes(
          'sketch-wire',
          entry.key === 'dashed' && 'sketch-dashed',
          entry.key === 'dotted' && 'sketch-dotted',
        )}" d="M${left} ${y + 9}H${left + 2 * CELL_W}" />`;

    return (
      swatch +
      `<text class="sketch-note" x="${left + 3 * CELL_W}" y="${y + BASELINE}">${escape(entry.text)}</text>`
    );
  });

  return rows.join('');
}

export function renderSketch(source: string, caption?: string) {
  const { boxes, links, art, groups, legend, centred } = parse(source);
  const frames = new Map(boxes.map((box) => [box.name, rect(box)]));
  const placed = links.map((link) => place(link, frames));
  const regions = groups.map((group) => bounds(group, frames));
  const { left, top, width, height } = extent(boxes, art, placed, regions);

  const gap = legend.length > 0 ? CELL_H : 0;
  const keyTop = top + height - CELL_H * PAD + gap;
  const full = height + gap + legend.length * CELL_H;

  const body =
    groups.map((group, index) => drawGroup(group, regions[index])).join('') +
    boxes.map(drawBox).join('') +
    art.map(drawArt).join('') +
    placed.map(drawLink).join('') +
    (legend.length > 0 ? drawLegend(legend, left + width - CELL_W, keyTop) : '');

  const svg =
    `<svg class="${classes('sketch', centred && 'sketch-center')}" role="img" ` +
    `width="${width}" height="${full}" ` +
    `viewBox="${left} ${top} ${width} ${full}"${caption ? ` aria-label="${escape(caption)}"` : ''}>` +
    `${body}</svg>`;

  if (!caption) return svg;
  return `<figure>${svg}<figcaption>${escape(caption)}</figcaption></figure>`;
}

type CodeNode = { lang?: string | null; meta?: string | null; value: string };

export const sketchPlugin = {
  name: 'sketch',
  code(node: CodeNode, ctx: { replaceNode: (target: unknown, content: unknown) => void }) {
    if (node.lang !== 'sketch') return;
    ctx.replaceNode(node, {
      raw: renderSketch(node.value, node.meta ?? undefined),
      mdxExpressions: false,
    });
  },
};
