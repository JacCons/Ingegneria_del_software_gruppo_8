import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from 'swagger-jsdoc';
import { getAbsoluteFSPath } from 'swagger-ui-dist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const docsDir = path.resolve(rootDir, '..', 'docs');

console.log('Project root directory:', rootDir);
console.log('Documentation output directory:', docsDir);

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SecuriTrento API Documentation',
      version: '1.0.0',
      description: 'API documentation for the SecuriTrento application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'SecuriTrento Team',
        url: 'https://github.com/JacCons/Ingegneria_del_software_gruppo_8',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: [
    path.join(rootDir, 'routes', '*.ts'),
    path.join(rootDir, 'models', '*.ts'),
  ],
};

try {
  console.log('Generating Swagger specification from JSDoc comments...');
  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  const swaggerJsonPath = path.join(docsDir, 'swagger.json');
  fs.writeFileSync(swaggerJsonPath, JSON.stringify(swaggerSpec, null, 2));
  console.log(`Swagger JSON saved to: ${swaggerJsonPath}`);

  const swaggerUiDistPath = getAbsoluteFSPath();
  console.log('Swagger UI distribution path:', swaggerUiDistPath);

  const filesToCopy = [
    'swagger-ui.css',
    'swagger-ui-bundle.js',
    'swagger-ui-standalone-preset.js',
    'favicon-32x32.png',
    'favicon-16x16.png',
  ];

  console.log('Copying Swagger UI files...');
  filesToCopy.forEach(file => {
    const source = path.join(swaggerUiDistPath, file);
    const destination = path.join(docsDir, file);
    fs.copyFileSync(source, destination);
    console.log(`Copied: ${file}`);
  });

  console.log('Generating standalone HTML file...');
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SecuriTrento API Documentation</title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css">
  <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32">
  <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="./swagger-ui-bundle.js"></script>
  <script src="./swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        // Use embedded spec instead of URL - this is key for offline use
        spec: ${JSON.stringify(swaggerSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
      // End Swagger UI call region
      window.ui = ui;
    }
  </script>
</body>
</html>
`;

  const htmlPath = path.join(docsDir, 'index.html');
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`Standalone HTML file saved to: ${htmlPath}`);

  const readmeContent = `# SecuriTrento API Documentation

This directory contains the API documentation for the SecuriTrento application.

## Files
- \`index.html\`: Standalone HTML file containing the Swagger UI with embedded API documentation
- \`swagger.json\`: The raw Swagger/OpenAPI specification file

## Usage
Open \`index.html\` in any browser to view the API documentation offline.

## GitHub Pages
This documentation is also available online at: https://yourusername.github.io/Ingegneria_del_software_gruppo_8/
`;

  fs.writeFileSync(path.join(docsDir, 'README.md'), readmeContent);

  console.log('\nExport complete!');
  console.log('To use with GitHub Pages:');
  console.log('1. Commit and push the generated files in the docs directory');
  console.log('2. Enable GitHub Pages in the repository settings');
  console.log('3. Set the source to the main branch and the /docs folder');
  console.log('4. The documentation will be available at: https://yourusername.github.io/Ingegneria_del_software_gruppo_8/');

} catch (error) {
  console.error('Error generating Swagger documentation:', error);
}
