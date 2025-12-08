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
  <div class="min-h-screen py-8">
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
