const fs = require('fs');
const path = require('path');

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BBWWvO2cOkrnYnIAq7Q7LZ2toK7idkdP8ez8unCT0_hpXMOF__suZTQb4Nxz9TTc54Ec0l4P6TyUiAa79QPvEd8';

const content = `export const environment = {
  apiUrl: '${backendUrl}',
  production: true,
  vapidPublicKey: '${vapidPublicKey}'
};
`;

const dir = path.join(__dirname, '..', 'src', 'environments');
fs.writeFileSync(path.join(dir, 'environment.prod.ts'), content);
console.log(`environment.prod.ts generado con apiUrl=${backendUrl}`);
