import { minify } from "minify";
import tryToCatch from "try-to-catch";
import urlJoin from "url-join";
import fs from "fs";

// packaga.json에서 실행됨으로 root는 ./ 로 설정
const rootDir = "./";
const inputDir = urlJoin(rootDir, "public/");
const outputDir = urlJoin(rootDir, "build/");

const errorPageInputDir = urlJoin(inputDir, "error-page/");
const errorPageOutputDir = urlJoin(outputDir, "error-page/");
const errorPageFileName = ["error.html", "error.css", "error.js"];
const errorPageInput = errorPageFileName.map((name) =>
  urlJoin(errorPageInputDir, name)
);
const errorPageOutput = errorPageFileName.map((name) =>
  urlJoin(errorPageOutputDir, name)
);

const noscriptPageInputDir = urlJoin(inputDir, "noscript-page/");
const noscriptPageOutputDir = urlJoin(outputDir, "noscript-page/");
const noscriptPageFileName = ["noscript.html", "noscript.css"];
const noscriptPageInput = noscriptPageFileName.map((name) =>
  urlJoin(noscriptPageInputDir, name)
);
const noscriptPageOutput = noscriptPageFileName.map((name) =>
  urlJoin(noscriptPageOutputDir, name)
);

const options = {
  js: {
    type: "putout",
    putout: {
      quote: "'",
      mangle: true,
      mangleClassNames: true,
      removeUnusedVariables: true,
      removeConsole: false,
      removeUselessSpread: true,
    },
  },
  html: {
    removeComments: true,
    removeCommentsFromCDATA: true,
    removeCDATASectionsFromCDATA: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeEmptyElements: false,
    removeOptionalTags: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyJS: true,
    minifyCSS: true,
  },
  css: {
    type: "clean-css",
    "clean-css": {
      compatibility: "*",
    },
  },
};

errorPageInput.forEach(async (input, index) => {
  const [error, data] = await tryToCatch(minify, input, options);

  if (error) console.error(error.message);

  try {
    fs.writeFileSync(errorPageOutput[index], data);
  } catch (error) {
    console.error(error.message);
  }
});

noscriptPageInput.forEach(async (input, index) => {
  const [error, data] = await tryToCatch(minify, input, options);

  if (error) console.error(error.message);

  try {
    fs.writeFileSync(noscriptPageOutput[index], data);
  } catch (error) {
    console.error(error.message);
  }
});
