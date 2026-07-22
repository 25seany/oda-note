import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Snapgrade — Instant AI grading for handwritten problems",
    short_name: "Snapgrade",
    description:
      "Snap a photo of any handwritten problem. Get graded instantly and build your personal wrong-answer notebook.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F7F5",
    theme_color: "#18181b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
