const PALETTES = [
  { bg: '#101827', paper: '#f6eddc', frame: '#c9a24a', accent: '#7a4d2b', accent2: '#e2c36a' },
  { bg: '#172033', paper: '#f9f0de', frame: '#d4af5f', accent: '#32435f', accent2: '#f0c97a' },
  { bg: '#251a18', paper: '#f5ead6', frame: '#b98f42', accent: '#8a5a3c', accent2: '#f0db8a' },
  { bg: '#10231f', paper: '#f4efe3', frame: '#c8a24e', accent: '#356052', accent2: '#f0d588' },
  { bg: '#1d1830', paper: '#f7f1e7', frame: '#c6a04b', accent: '#56407d', accent2: '#f1d48c' },
  { bg: '#231b14', paper: '#f4ead7', frame: '#d0a54d', accent: '#7d5a31', accent2: '#f3d68d' },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createArtworkImageUrl(title, artist, category, index) {
  const palette = PALETTES[index % PALETTES.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.bg}" />
          <stop offset="100%" stop-color="#04070f" />
        </linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.paper}" />
          <stop offset="100%" stop-color="#e9dcc1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1600" fill="url(#bg)" />
      <rect x="68" y="68" width="1064" height="1464" rx="26" fill="url(#panel)" />
      <rect x="112" y="112" width="976" height="1376" rx="20" fill="${palette.bg}" />
      <path d="M164 1220 C314 1100 488 1004 626 1064 C774 1130 892 1096 1032 960" stroke="${palette.accent2}" stroke-width="20" fill="none" stroke-linecap="round" />
      <circle cx="874" cy="388" r="110" fill="${palette.accent2}" opacity="0.22" />
      <circle cx="874" cy="388" r="78" fill="none" stroke="${palette.accent2}" stroke-width="12" opacity="0.7" />
      <rect x="186" y="180" width="828" height="420" rx="18" fill="${palette.paper}" opacity="0.92" />
      <rect x="214" y="206" width="772" height="94" rx="12" fill="${palette.accent}" opacity="0.82" />
      <rect x="214" y="322" width="772" height="18" rx="9" fill="${palette.accent2}" opacity="0.72" />
      <path d="M258 430h684" stroke="${palette.accent}" stroke-width="8" stroke-linecap="round" opacity="0.65" />
      <text x="600" y="810" text-anchor="middle" font-family="Georgia, serif" font-size="74" font-weight="700" fill="${palette.paper}">
        ${escapeXml(title)}
      </text>
      <text x="600" y="912" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="${palette.paper}" opacity="0.76">
        ${escapeXml(artist)}
      </text>
      <text x="600" y="962" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="${palette.paper}" opacity="0.52">
        ${escapeXml(category)}
      </text>
      <text x="600" y="1460" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="${palette.paper}" opacity="0.34">
        ArtMind Museum Collection
      </text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function toText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return value.name || value.title || value.label || '';
}

function buildDimensions(record) {
  if (record?.dimensions) return record.dimensions;
  const height = record?.heightCm ?? record?.height ?? record?.heightCM;
  const width = record?.widthCm ?? record?.width ?? record?.widthCM;
  if (height && width) return `${height} x ${width} cm`;
  return '';
}

function normalizePainting(record, index) {
  const title = toText(record?.title) || `Artwork ${index + 1}`;
  const artist = toText(record?.artist) || 'Unknown artist';
  const category = toText(record?.category) || toText(record?.collection) || 'Museum piece';
  const style = toText(record?.style);
  const medium = toText(record?.medium);
  const surface = toText(record?.surface);
  const year = record?.year ?? record?.releasedAt ?? '';
  const dimensions = buildDimensions(record);
  const imageUrl = record?.thumbnailUrl || record?.imageUrl || record?.coverUrl || createArtworkImageUrl(title, artist, category, index);

  return {
    id: String(record?.id ?? record?.slug ?? `${index + 1}`),
    slug: record?.slug ? String(record.slug) : null,
    title,
    artist,
    year,
    category,
    style,
    medium,
    surface,
    dimensions,
    description: toText(record?.description),
    imageUrl,
    thumbnailUrl: record?.thumbnailUrl || imageUrl,
    source: 'api',
  };
}

function createDemoPaintings(startIndex = 0, count = 16) {
  const templates = [
    {
      title: 'The Quiet Gallery',
      artist: 'A. Delorme',
      year: 1891,
      category: 'Impressionism',
      style: 'Atmospheric',
      medium: 'Oil',
      surface: 'Canvas',
      dimensions: '92 x 130 cm',
      description: 'A corridor of light held in suspension, as if the building were breathing softly.',
    },
    {
      title: 'Blue Chamber Study',
      artist: 'N. Vale',
      year: 1904,
      category: 'Modernism',
      style: 'Expressionist',
      medium: 'Oil',
      surface: 'Canvas',
      dimensions: '110 x 88 cm',
      description: 'Cool blue geometry and warm shadows balance one another across the room.',
    },
    {
      title: 'The Marble Silence',
      artist: 'I. Marceau',
      year: 1878,
      category: 'Neoclassicism',
      style: 'Portrait',
      medium: 'Oil',
      surface: 'Panel',
      dimensions: '78 x 64 cm',
      description: 'A posed figure framed by stone and memory, almost motionless in the glow.',
    },
    {
      title: 'Evening Still Life',
      artist: 'L. Serrat',
      year: 1923,
      category: 'Still Life',
      style: 'Cubist',
      medium: 'Oil',
      surface: 'Canvas',
      dimensions: '82 x 101 cm',
      description: 'Fruit, glass, and shadow are rearranged into a quiet but restless rhythm.',
    },
    {
      title: 'Harbor of Memory',
      artist: 'M. Arno',
      year: 1885,
      category: 'Seascape',
      style: 'Luminist',
      medium: 'Oil',
      surface: 'Canvas',
      dimensions: '96 x 140 cm',
      description: 'A harbor holds the fading day while boats drift between reflection and mist.',
    },
    {
      title: 'Golden Passage',
      artist: 'C. Renard',
      year: 1912,
      category: 'Interior',
      style: 'Symbolist',
      medium: 'Oil and gold leaf',
      surface: 'Linen',
      dimensions: '150 x 112 cm',
      description: 'A ceremonial hallway where gilded details catch the last light of the afternoon.',
    },
    {
      title: 'Lantern Room',
      artist: 'S. Imani',
      year: 1930,
      category: 'Architecture',
      style: 'Minimalist',
      medium: 'Acrylic',
      surface: 'Canvas',
      dimensions: '100 x 100 cm',
      description: 'Rectangular lanterns float in a dim hall, measuring space through rhythm.',
    },
    {
      title: 'Conservatory After Rain',
      artist: 'E. Moris',
      year: 1899,
      category: 'Landscape',
      style: 'Post-Impressionist',
      medium: 'Oil',
      surface: 'Canvas',
      dimensions: '91 x 122 cm',
      description: 'Steam, leaves, and wet glass turn the greenhouse into a quiet greenhouse dream.',
    },
    {
      title: 'Nocturne for the Museum',
      artist: 'H. Bell',
      year: 1908,
      category: 'Nocturne',
      style: 'Tonalist',
      medium: 'Oil',
      surface: 'Panel',
      dimensions: '74 x 93 cm',
      description: 'The room darkens, but the paintings still keep a soft inner flame.',
    },
    {
      title: 'Field of Absence',
      artist: 'R. Halden',
      year: 1866,
      category: 'Landscape',
      style: 'Romantic',
      medium: 'Oil',
      surface: 'Canvas',
      dimensions: '97 x 145 cm',
      description: 'An open field with no figures, only wind, distance, and a sky that keeps moving.',
    },
    {
      title: 'Amber River',
      artist: 'T. Selene',
      year: 1918,
      category: 'Landscape',
      style: 'Impressionist',
      medium: 'Oil',
      surface: 'Canvas',
      dimensions: '88 x 126 cm',
      description: 'A slow river catches amber reflections from the canopy above it.',
    },
    {
      title: 'Glass and Shadow',
      artist: 'P. Voss',
      year: 1941,
      category: 'Still Life',
      style: 'Modern',
      medium: 'Oil',
      surface: 'Board',
      dimensions: '68 x 84 cm',
      description: 'Transparent forms and dark silhouettes trade places as the viewer moves closer.',
    },
    {
      title: 'Portrait of a Whisper',
      artist: 'A. Noor',
      year: 1888,
      category: 'Portrait',
      style: 'Realist',
      medium: 'Oil',
      surface: 'Canvas',
      dimensions: '84 x 67 cm',
      description: 'A face half hidden by shadow, where expression becomes almost audible.',
    },
    {
      title: 'Museum of Dust',
      artist: 'L. Orin',
      year: 1954,
      category: 'Conceptual',
      style: 'Abstract',
      medium: 'Mixed media',
      surface: 'Canvas',
      dimensions: '120 x 120 cm',
      description: 'Dust motes become a quiet subject in their own right, suspended in light.',
    },
    {
      title: 'The Long Return',
      artist: 'N. Corbeau',
      year: 1901,
      category: 'Narrative',
      style: 'Symbolist',
      medium: 'Oil',
      surface: 'Linen',
      dimensions: '99 x 132 cm',
      description: 'A road back to a place that has changed while the traveler was away.',
    },
    {
      title: 'Echoes in the Hall',
      artist: 'V. Laine',
      year: 1936,
      category: 'Interior',
      style: 'Surreal',
      medium: 'Oil',
      surface: 'Canvas',
      dimensions: '104 x 118 cm',
      description: 'Sound seems visible in the long hall, curling around the frame edges.',
    },
  ];

  return templates.slice(startIndex, startIndex + count).map((item, index) => ({
    ...item,
    id: `demo-${startIndex + index + 1}`,
    slug: null,
    imageUrl: createArtworkImageUrl(item.title, item.artist, item.category, startIndex + index),
    thumbnailUrl: createArtworkImageUrl(item.title, item.artist, item.category, startIndex + index),
    source: 'demo',
  }));
}

export function buildMuseumCollection(records, limit) {
  const apiPaintings = Array.isArray(records)
    ? records.slice(0, limit).map((record, index) => normalizePainting(record, index))
    : [];

  if (apiPaintings.length >= limit) {
    return {
      paintings: apiPaintings.slice(0, limit),
      mode: 'live',
    };
  }

  const filler = createDemoPaintings(apiPaintings.length, limit - apiPaintings.length);
  return {
    paintings: [...apiPaintings, ...filler].slice(0, limit),
    mode: apiPaintings.length === 0 ? 'demo' : 'mixed',
  };
}

