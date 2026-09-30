import fs from "fs";

// Site configuration
const siteUrl = "https://j93.es";

const outputPath = "../public/sitemap.xml";

// Example pages for the sitemap
const pages = [
  "/",
  "/posting/dev/state-machine/state-machine.md",
  "/posting/dev/step-linetracer/step-linetracer.md",
  "/posting/photo/singapore-1/singapore-1.md",
  "/posting/photo/singapore-2/singapore-2.md",
  "/posting/photo/singapore-3/singapore-3.md",
  "/posting/photo/singapore-4/singapore-4.md",
  "/posting/photo/singapore-5/singapore-5.md",
];

// Generate sitemap.xml content
const generateSitemap = (siteUrl, pages) => {
  const urls = pages
    .map((page) => {
      return `  <url>\n    <loc>${siteUrl}${page}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
};

// Save sitemap.xml to the public directory
const saveSitemap = (content) => {
  fs.writeFileSync(outputPath, content, "utf8");
  console.log(`Sitemap has been generated and saved to ${outputPath}`);
};

// Main execution
const sitemapContent = generateSitemap(siteUrl, pages);
saveSitemap(sitemapContent);
