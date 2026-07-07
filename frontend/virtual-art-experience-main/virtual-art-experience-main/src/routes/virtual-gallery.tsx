import { createFileRoute } from "@tanstack/react-router";
import { VirtualGalleryPage } from "../features/virtual-gallery/VirtualGalleryPage";

export const Route = createFileRoute("/virtual-gallery")({
  head: () => ({
    meta: [
      { title: "Virtual Gallery — 3D Museum Experience" },
      { name: "description", content: "Walk through an immersive 3D museum room and explore artworks up close." },
      { property: "og:title", content: "Virtual Gallery — 3D Museum Experience" },
      { property: "og:description", content: "Walk through an immersive 3D museum room and explore artworks up close." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: VirtualGalleryPage,
});