import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

const categories = ['Landscape', 'Portrait', 'Still Life', 'Abstract', 'Architecture', 'Mixed Media'];
const styles = ['Impressionism', 'Realism', 'Abstract', 'Baroque', 'Still Life', 'Contemporary', 'Expressionism'];

const artists = [
  { name: 'Elena Marchetti', nationality: 'Italian', bornYear: 1968, bio: 'Known for luminous Mediterranean landscapes built from broken colour.' },
  { name: 'Tomas Lindqvist', nationality: 'Swedish', bornYear: 1975, bio: 'Contemporary abstractionist exploring geometry and restraint.' },
  { name: 'Amara Okafor', nationality: 'Nigerian', bornYear: 1982, bio: 'Portraitist whose work bridges classical realism and modern identity.' },
  { name: 'Henri Delacroix-Mercier', nationality: 'French', bornYear: 1955, bio: 'Baroque-influenced still life and interiors.' },
  { name: 'Mei Tanaka', nationality: 'Japanese', bornYear: 1979, bio: 'Mixed-media artist working between ink tradition and abstraction.' },
];

// A small curated set; the loop below expands it to ~40 paintings.
const baseWorks = [
  { title: 'Harbour at First Light', category: 'Landscape', style: 'Impressionism', colors: ['#1E3A5F', '#D9B23A', '#F5F5F5'], medium: 'Oil', surface: 'canvas', year: 2019 },
  { title: 'Study in Cobalt', category: 'Abstract', style: 'Abstract', colors: ['#1E3A5F', '#2D2D2D', '#F5F5F5'], medium: 'Acrylic', surface: 'canvas', year: 2021 },
  { title: 'The Quiet Sitter', category: 'Portrait', style: 'Realism', colors: ['#5C4033', '#2D2D2D', '#D9B23A'], medium: 'Oil', surface: 'panel', year: 2018 },
  { title: 'Pomegranates and Pewter', category: 'Still Life', style: 'Baroque', colors: ['#8B2E2E', '#1A1A1A', '#B8860B'], medium: 'Oil', surface: 'canvas', year: 2017 },
  { title: 'Ink Garden III', category: 'Mixed Media', style: 'Contemporary', colors: ['#1A1A1A', '#F5F5F5', '#3B5F3B'], medium: 'Ink', surface: 'paper', year: 2022 },
  { title: 'Cathedral Light', category: 'Architecture', style: 'Baroque', colors: ['#B8860B', '#2D2D2D', '#F5F5F5'], medium: 'Oil', surface: 'canvas', year: 2016 },
  { title: 'Field After Rain', category: 'Landscape', style: 'Impressionism', colors: ['#3B5F3B', '#D9B23A', '#1E3A5F'], medium: 'Oil', surface: 'canvas', year: 2020 },
  { title: 'Red Interval', category: 'Abstract', style: 'Expressionism', colors: ['#8B2E2E', '#F5F5F5', '#1A1A1A'], medium: 'Acrylic', surface: 'linen', year: 2023 },
];

// Deterministic placeholder image (Picsum) so the gallery renders before
// real Cloudinary assets are uploaded.
const img = (seed, w = 900, h = 1100) => `https://picsum.photos/seed/artmind-${seed}/${w}/${h}`;

async function main() {
  console.log('Seeding ArtMind…');

  // Categories & styles
  const catRecords = {};
  for (const name of categories) {
    catRecords[name] = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }
  const styleRecords = {};
  for (const name of styles) {
    styleRecords[name] = await prisma.style.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  // Artists
  const artistRecords = [];
  for (const a of artists) {
    artistRecords.push(
      await prisma.artist.upsert({
        where: { slug: slugify(a.name) },
        update: {},
        create: { ...a, slug: slugify(a.name), portraitUrl: img(slugify(a.name), 400, 400) },
      }),
    );
  }

  // Paintings — expand base set across artists with varied view counts.
  let counter = 0;
  for (let pass = 0; pass < 5; pass++) {
    for (const w of baseWorks) {
      counter += 1;
      const artist = artistRecords[counter % artistRecords.length];
      const title = pass === 0 ? w.title : `${w.title} (No. ${pass + 1})`;
      const slug = slugify(`${title}-${artist.name}`);
      const viewCount = Math.floor(Math.random() * 4000);
      await prisma.painting.upsert({
        where: { slug },
        update: {},
        create: {
          title,
          slug,
          description: `${title} is a ${w.style.toLowerCase()} ${w.category.toLowerCase()} work in ${w.medium.toLowerCase()} on ${w.surface}, exploring colour and composition with characteristic restraint.`,
          imageUrl: img(`${slug}`),
          thumbnailUrl: img(`${slug}`, 450, 550),
          medium: w.medium,
          surface: w.surface,
          dominantColors: w.colors,
          widthCm: 60 + (counter % 5) * 12,
          heightCm: 80 + (counter % 4) * 15,
          year: w.year,
          price: 1500 + (counter % 10) * 850,
          viewCount,
          trendingScore: viewCount / 1000 + Math.random(),
          featured: counter % 7 === 0,
          artistId: artist.id,
          categoryId: catRecords[w.category].id,
          styleId: styleRecords[w.style]?.id ?? null,
        },
      });
    }
  }

  // Admin + demo user
  await prisma.user.upsert({
    where: { email: 'admin@artmind.test' },
    update: {},
    create: {
      email: 'admin@artmind.test',
      name: 'Gallery Admin',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('Admin1234', 12),
    },
  });
  await prisma.user.upsert({
    where: { email: 'demo@artmind.test' },
    update: {},
    create: {
      email: 'demo@artmind.test',
      name: 'Demo Collector',
      passwordHash: await bcrypt.hash('Demo1234', 12),
    },
  });

  const total = await prisma.painting.count();
  console.log(`Seed complete — ${total} paintings, ${artistRecords.length} artists.`);
  console.log('Admin login: admin@artmind.test / Admin1234');
  console.log('Demo login:  demo@artmind.test  / Demo1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

// Allow `node prisma/seed.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) { /* executed above */ }
