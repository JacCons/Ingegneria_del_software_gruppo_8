import * as fs from 'fs';
import * as path from 'path';
import * as swaggerJsdoc from 'swagger-jsdoc';
import YAML from 'yaml'
import swaggerSpec from '../config/swaggerConfig.ts';
import { getAbsoluteFSPath } from 'swagger-ui-dist';

// Directory di output per la documentazione
const docsDir: string = path.join('..', 'docs', 'api');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
// Get the actual path to swagger-ui-dist
const swaggerUiDist = getAbsoluteFSPath();

// Utilizza le opzioni di configurazione dal file swaggerConfig.ts
console.log('Generazione delle specifiche Swagger utilizzando la configurazione esistente...');


// Salva la specifica come JSON
fs.writeFileSync(
  path.join(docsDir, 'swagger.json'),
  JSON.stringify(swaggerSpec, null, 2)
);

// Salva la specifica come YAML
try {
  fs.writeFileSync(
    path.join(docsDir, 'swagger.yaml'),
    YAML.stringify(swaggerSpec)
  );
  console.log('Specifiche Swagger esportate in formato JSON e YAML');
} catch (e) {
  const error = e as Error;
  console.log('Esportazione YAML fallita:', error.message);
  console.log('Installare il pacchetto yaml: npm install yaml');
}

// Genera documentazione HTML statica
console.log('Generazione documentazione HTML statica...');

// Funzione per copiare i file Swagger UI
const copySwaggerUiFiles = (): void => {
  try {
    const files: string[] = fs.readdirSync(swaggerUiDist);
    
    files.forEach(file => {
      if (!file.endsWith('.map')) {
        const srcPath: string = path.join(swaggerUiDist, file);
        const destPath: string = path.join(docsDir, file);
        fs.copyFileSync(srcPath, destPath);
      }
    });
    
    // Modifica il file index.html per puntare al file swagger.json locale
    // Modifica il file index.html per puntare al file swagger.json locale
    let indexHtml: string = fs.readFileSync(path.join(docsDir, 'index.html'), 'utf8');

    // Crea un file index.html completamente nuovo che punta al tuo swagger.json
    const newIndexHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <title>API Documentation</title>
        <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
        <link rel="stylesheet" type="text/css" href="./index.css" />
        <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
        </head>

        <body>
        <div id="swagger-ui"></div>
        <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
        <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
        <script>
            window.onload = function() {
            // Begin Swagger UI call region
            const ui = SwaggerUIBundle({
                url: "./swagger.json",
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

    // Sovrascrivi completamente il file index.html
    fs.writeFileSync(path.join(docsDir, 'index.html'), newIndexHtml);
    
    console.log('Documentazione HTML statica generata correttamente in', docsDir);
  } catch (err) {
    const error = err as Error;
    console.error('Errore durante la copia dei file Swagger UI:', error.message);
    console.log('Assicurati di aver installato swagger-ui-dist: npm install swagger-ui-dist');
  }
};

// Esegui la copia dei file
copySwaggerUiFiles();

console.log('Documentazione Swagger esportata con successo!');
console.log(`Puoi trovare i file nella directory: ${docsDir}`);
console.log('Per includere questa documentazione nel tuo repository GitHub:');
console.log('1. Commit e push dei file generati');
console.log('2. Abilita GitHub Pages sulla directory /docs per visualizzare la documentazione online');
