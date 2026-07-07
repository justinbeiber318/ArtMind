import { useQuery } from "@tanstack/react-query";
import type { Painting } from "./types";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createArtworkImageUrl(title: string, artist: string, category: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
      <rect width="1200" height="1600" fill="#111827" />
      <rect x="60" y="60" width="1080" height="1480" rx="24" fill="#f7efe2" />
      <rect x="110" y="110" width="980" height="1380" rx="18" fill="#111827" />
      <rect x="150" y="150" width="900" height="500" rx="16" fill="#3c2a21" />
      <rect x="180" y="690" width="840" height="420" rx="16" fill="#f4e8d3" />
      <path d="M180 1100 C330 960 540 900 690 980 C840 1060 960 1040 1020 950" stroke="#d4a85f" stroke-width="18" fill="none" stroke-linecap="round" />
      <text x="600" y="840" text-anchor="middle" font-family="Georgia, serif" font-size="72" font-weight="700" fill="#111827">${escapeXml(title)}</text>
      <text x="600" y="940" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="40" fill="#6b7280">${escapeXml(artist)}</text>
      <text x="600" y="990" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" fill="#9ca3af">${escapeXml(category)}</text>
      <circle cx="930" cy="300" r="88" fill="#f6c96a" opacity="0.75" />
      <circle cx="930" cy="300" r="70" fill="none" stroke="#fff1ba" stroke-width="10" />
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Replace fetchPaintings() body with your existing API client call.
 * Expected shape defined in ./types.ts. This hook returns up to 16 paintings
 * for wall placement.
 */
async function fetchPaintings(): Promise<Painting[]> {
  return [
    { id: "1", title: "The Starry Night", artist: "Vincent van Gogh", year: 1889, category: "Post-Impressionism", style: "Expressive", medium: "Oil", surface: "Canvas", dimensions: "73.7 × 92.1 cm", price: "Not for sale", description: "A swirling night sky over a quiet village, painted from the asylum at Saint-Rémy.", imageUrl: createArtworkImageUrl("The Starry Night", "Vincent van Gogh", "Post-Impressionism") },
    { id: "2", title: "Girl with a Pearl Earring", artist: "Johannes Vermeer", year: 1665, category: "Baroque", style: "Portrait", medium: "Oil", surface: "Canvas", dimensions: "44.5 × 39 cm", description: "A tronie of a girl in an exotic dress and an oversized pearl earring.", imageUrl: createArtworkImageUrl("Girl with a Pearl Earring", "Johannes Vermeer", "Baroque") },
    { id: "3", title: "The Great Wave off Kanagawa", artist: "Katsushika Hokusai", year: 1831, category: "Ukiyo-e", style: "Woodblock", medium: "Ink", surface: "Paper", dimensions: "25.7 × 37.9 cm", description: "The iconic wave towering over boats with Mount Fuji in the distance.", imageUrl: createArtworkImageUrl("The Great Wave off Kanagawa", "Katsushika Hokusai", "Ukiyo-e") },
    { id: "4", title: "Impression, Sunrise", artist: "Claude Monet", year: 1872, category: "Impressionism", style: "Landscape", medium: "Oil", surface: "Canvas", dimensions: "48 × 63 cm", description: "The painting that gave Impressionism its name.", imageUrl: createArtworkImageUrl("Impression, Sunrise", "Claude Monet", "Impressionism") },
    { id: "5", title: "The Kiss", artist: "Gustav Klimt", year: 1908, category: "Symbolism", style: "Art Nouveau", medium: "Oil and gold leaf", surface: "Canvas", dimensions: "180 × 180 cm", description: "A couple embracing on a field of golden flowers.", imageUrl: createArtworkImageUrl("The Kiss", "Gustav Klimt", "Symbolism") },
    { id: "6", title: "A Sunday on La Grande Jatte", artist: "Georges Seurat", year: 1886, category: "Post-Impressionism", style: "Pointillism", medium: "Oil", surface: "Canvas", dimensions: "207.5 × 308.1 cm", description: "Parisians at leisure rendered in tiny dots of color.", imageUrl: createArtworkImageUrl("A Sunday on La Grande Jatte", "Georges Seurat", "Post-Impressionism") },
    { id: "7", title: "Wheatfield with Crows", artist: "Vincent van Gogh", year: 1890, category: "Post-Impressionism", style: "Landscape", medium: "Oil", surface: "Canvas", dimensions: "50.5 × 103 cm", description: "A dramatic sky over a golden wheatfield.", imageUrl: createArtworkImageUrl("Wheatfield with Crows", "Vincent van Gogh", "Post-Impressionism") },
    { id: "8", title: "The Birth of Venus", artist: "Sandro Botticelli", year: 1485, category: "Renaissance", style: "Mythological", medium: "Tempera", surface: "Canvas", dimensions: "172.5 × 278.9 cm", description: "Venus arriving at the shore, born of the sea foam.", imageUrl: createArtworkImageUrl("The Birth of Venus", "Sandro Botticelli", "Renaissance") },
    { id: "9", title: "American Gothic", artist: "Grant Wood", year: 1930, category: "Regionalism", style: "Portrait", medium: "Oil", surface: "Beaverboard", dimensions: "78 × 65.3 cm", description: "A stoic farmer and his daughter before a Gothic-windowed house.", imageUrl: createArtworkImageUrl("American Gothic", "Grant Wood", "Regionalism") },
    { id: "10", title: "The Night Watch", artist: "Rembrandt van Rijn", year: 1642, category: "Baroque", style: "Group Portrait", medium: "Oil", surface: "Canvas", dimensions: "363 × 437 cm", description: "A militia company caught mid-motion in dramatic chiaroscuro.", imageUrl: createArtworkImageUrl("The Night Watch", "Rembrandt van Rijn", "Baroque") },
    { id: "11", title: "Water Lilies", artist: "Claude Monet", year: 1916, category: "Impressionism", style: "Landscape", medium: "Oil", surface: "Canvas", dimensions: "200 × 200 cm", description: "Reflections on the surface of Monet's Giverny pond.", imageUrl: createArtworkImageUrl("Water Lilies", "Claude Monet", "Impressionism") },
    { id: "12", title: "The Scream", artist: "Edvard Munch", year: 1893, category: "Expressionism", style: "Symbolist", medium: "Oil, tempera, pastel", surface: "Cardboard", dimensions: "91 × 73.5 cm", description: "An anguished figure against a blood-red sky.", imageUrl: createArtworkImageUrl("The Scream", "Edvard Munch", "Expressionism") },
  ];
}

export function usePaintingsForMuseum(limit = 16) {
  return useQuery({
    queryKey: ["museum-paintings", limit],
    queryFn: async () => (await fetchPaintings()).slice(0, limit),
    staleTime: 5 * 60_000,
  });
}