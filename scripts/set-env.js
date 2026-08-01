const fs = require('fs');
const path = require('path');

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

const content = `export const environment = {
  apiUrl: '${backendUrl}'
};
`;

const dir = path.join(__dirname, '..', 'src', 'environments');
fs.writeFileSync(path.join(dir, 'environment.prod.ts'), content);
console.log(`environment.prod.ts generado con apiUrl=${backendUrl}`);
