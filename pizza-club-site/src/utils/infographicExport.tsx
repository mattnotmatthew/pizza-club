/**
 * Infographic Static HTML Export Utility
 *
 * Generates standalone HTML from InfographicCanvas for publishing
 */

import { renderToStaticMarkup } from 'react-dom/server';
import InfographicCanvas from '@/components/infographics/InfographicCanvas';
import type { InfographicWithData } from '@/types/infographics';

/**
 * Generate static HTML from an infographic
 * Returns a complete, standalone HTML document
 */
export function generateStaticHTML(data: InfographicWithData): string {
  // Render the component to static markup
  const markup = renderToStaticMarkup(<InfographicCanvas data={data} isPreview={false} />);

  // Get the base URL for absolute paths (origin only, without BASE_URL)
  const baseUrl = window.location.origin;

  // Replace relative URLs with absolute URLs
  const markupWithAbsoluteUrls = markup.replace(
    /src="\/([^"]+)"/g,
    `src="${baseUrl}/$1"`
  ).replace(
    /url\(\/([^)]+)\)/g,
    `url(${baseUrl}/$1)`
  );

  // Build complete HTML document
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(data.content.title || data.restaurantName)} - Pizza Club Chicago">
  <title>${escapeHtml(data.content.title || data.restaurantName)} | Pizza Club</title>

  <!-- Include Tailwind CSS from CDN for styling -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Custom styles for infographic-specific features -->
  <style>
    /* Fluid Typography - smooth scaling based on viewport */
    .text-fluid-title-xs { font-size: clamp(1rem, 2vw + 0.5rem, 1.5rem); }
    .text-fluid-title-sm { font-size: clamp(1.125rem, 2.5vw + 0.5rem, 1.875rem); }
    .text-fluid-title-base { font-size: clamp(1.25rem, 3vw + 0.5rem, 2.25rem); }
    .text-fluid-title-lg { font-size: clamp(1.5rem, 3.5vw + 0.5rem, 3rem); }
    .text-fluid-title-xl { font-size: clamp(1.5rem, 4vw + 0.5rem, 3.75rem); }
    .text-fluid-title-2xl { font-size: clamp(1.75rem, 5vw + 0.5rem, 4.5rem); }
    .text-fluid-title-3xl { font-size: clamp(2rem, 6vw + 0.5rem, 5rem); }
    .text-fluid-title-4xl { font-size: clamp(2.25rem, 7vw + 0.5rem, 6rem); }

    .text-fluid-sub-xs { font-size: clamp(0.75rem, 1vw + 0.25rem, 0.875rem); }
    .text-fluid-sub-sm { font-size: clamp(0.75rem, 1.25vw + 0.25rem, 1rem); }
    .text-fluid-sub-base { font-size: clamp(0.875rem, 1.5vw + 0.25rem, 1.25rem); }
    .text-fluid-sub-lg { font-size: clamp(1rem, 1.75vw + 0.25rem, 1.5rem); }
    .text-fluid-sub-xl { font-size: clamp(1rem, 2vw + 0.25rem, 1.75rem); }
    .text-fluid-sub-2xl { font-size: clamp(1.125rem, 2.5vw + 0.25rem, 2rem); }
    .text-fluid-sub-3xl { font-size: clamp(1.25rem, 3vw + 0.25rem, 2.25rem); }
    .text-fluid-sub-4xl { font-size: clamp(1.5rem, 3.5vw + 0.25rem, 2.5rem); }

    .text-fluid-sm-xs { font-size: clamp(0.625rem, 0.75vw + 0.25rem, 0.75rem); }
    .text-fluid-sm-sm { font-size: clamp(0.625rem, 1vw + 0.25rem, 0.875rem); }
    .text-fluid-sm-base { font-size: clamp(0.75rem, 1.25vw + 0.25rem, 1rem); }
    .text-fluid-sm-lg { font-size: clamp(0.75rem, 1.5vw + 0.25rem, 1.125rem); }
    .text-fluid-sm-xl { font-size: clamp(0.875rem, 1.5vw + 0.25rem, 1.25rem); }
    .text-fluid-sm-2xl { font-size: clamp(0.875rem, 1.75vw + 0.25rem, 1.5rem); }
    .text-fluid-sm-3xl { font-size: clamp(1rem, 2vw + 0.25rem, 1.75rem); }
    .text-fluid-sm-4xl { font-size: clamp(1rem, 2.25vw + 0.25rem, 2rem); }

    /* Fluid logo sizes - for infographic header logos */
    .logo-fluid-xs { height: clamp(5rem, 8vw + 2rem, 8rem); }
    .logo-fluid-sm { height: clamp(6rem, 10vw + 2rem, 10rem); }
    .logo-fluid-base { height: clamp(7rem, 12vw + 2rem, 12rem); }
    .logo-fluid-lg { height: clamp(8rem, 14vw + 2rem, 14rem); }
    .logo-fluid-xl { height: clamp(9rem, 16vw + 2rem, 16rem); }
    .logo-fluid-2xl { height: clamp(10rem, 18vw + 2rem, 18rem); }
    .logo-fluid-3xl { height: clamp(11rem, 20vw + 2rem, 20rem); }
    .logo-fluid-4xl { height: clamp(12rem, 22vw + 2rem, 22rem); }

    /* Classic round logo sizes */
    .logo-classic-fluid-xs { height: clamp(4rem, 6vw + 1.5rem, 6rem); width: clamp(4rem, 6vw + 1.5rem, 6rem); }
    .logo-classic-fluid-sm { height: clamp(5rem, 8vw + 1.5rem, 8rem); width: clamp(5rem, 8vw + 1.5rem, 8rem); }
    .logo-classic-fluid-base { height: clamp(6rem, 10vw + 1.5rem, 10rem); width: clamp(6rem, 10vw + 1.5rem, 10rem); }
    .logo-classic-fluid-lg { height: clamp(7rem, 12vw + 1.5rem, 12rem); width: clamp(7rem, 12vw + 1.5rem, 12rem); }
    .logo-classic-fluid-xl { height: clamp(8rem, 14vw + 1.5rem, 14rem); width: clamp(8rem, 14vw + 1.5rem, 14rem); }
    .logo-classic-fluid-2xl { height: clamp(9rem, 16vw + 1.5rem, 16rem); width: clamp(9rem, 16vw + 1.5rem, 16rem); }
    .logo-classic-fluid-3xl { height: clamp(10rem, 18vw + 1.5rem, 18rem); width: clamp(10rem, 18vw + 1.5rem, 18rem); }
    .logo-classic-fluid-4xl { height: clamp(11rem, 20vw + 1.5rem, 20rem); width: clamp(11rem, 20vw + 1.5rem, 20rem); }

    /* Checkered border component - scoped to infographic container */
    .infographic-container .bg-checkered-border {
      background-color: #b91c1c;
      position: relative;
    }
    .infographic-container .bg-checkered-border::before,
    .infographic-container .bg-checkered-border::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1.5rem;
      background-image:
        linear-gradient(45deg, #b91c1c 25%, transparent 25%),
        linear-gradient(-45deg, #b91c1c 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #b91c1c 75%),
        linear-gradient(-45deg, transparent 75%, #b91c1c 75%);
      background-size: 1.5rem 1.5rem;
      background-position: 0 0, 0 0.75rem, 0.75rem -0.75rem, -0.75rem 0;
      background-color: white;
      pointer-events: none;
      z-index: 10;
    }
    .infographic-container .bg-checkered-border::before { left: 0; }
    .infographic-container .bg-checkered-border::after { right: 0; }
    @media (min-width: 768px) {
      .infographic-container .bg-checkered-border::before,
      .infographic-container .bg-checkered-border::after {
        width: 2.5rem;
        background-size: 2.5rem 2.5rem;
        background-position: 0 0, 0 1.25rem, 1.25rem -1.25rem, -1.25rem 0;
      }
    }
    @media (min-width: 1024px) {
      .infographic-container .bg-checkered-border::before,
      .infographic-container .bg-checkered-border::after {
        width: 3rem;
        background-size: 3rem 3rem;
        background-position: 0 0, 0 1.5rem, 1.5rem -1.5rem, -1.5rem 0;
      }
    }

    /* Print styles */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .print\\:shadow-none {
        box-shadow: none !important;
      }
    }

    /* Ensure pizza rating slices render correctly */
    .pizza-slice {
      display: inline-block;
    }
  </style>
</head>
<body class="bg-gray-50">
  <div class="min-h-screen py-4">
    ${markupWithAbsoluteUrls}
  </div>

  <!-- Metadata for social sharing -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Restaurant",
      "name": "${escapeHtml(data.restaurantName)}",
      "address": "${escapeHtml(data.restaurantAddress)}"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "${data.visitData.ratings.overall || 0}",
      "bestRating": "5"
    },
    "author": {
      "@type": "Organization",
      "name": "Pizza Club Chicago"
    },
    "datePublished": "${data.visitDate}"
  }
  </script>
</body>
</html>`;

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Download static HTML as a file
 */
export function downloadStaticHTML(data: InfographicWithData): void {
  const html = generateStaticHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const filename = `${data.restaurantName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${data.visitDate}.html`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate static HTML and save to a file on the server
 * This would require a server endpoint to handle file uploads
 */
export async function saveStaticHTMLToServer(
  data: InfographicWithData,
  uploadUrl: string
): Promise<{ filePath: string }> {
  const html = generateStaticHTML(data);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: `${data.id}.html`,
      content: html
    })
  });

  if (!response.ok) {
    throw new Error('Failed to save static HTML to server');
  }

  return await response.json();
}
