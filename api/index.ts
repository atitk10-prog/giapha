import serverApp from '../server.js';

// Handle possible ESM / CJS interop issues with default exports
const app = (serverApp && typeof serverApp === 'object' && serverApp.default) 
  ? serverApp.default 
  : serverApp;

export default function(req: any, res: any) {
  if (typeof app === 'function') {
    return app(req, res);
  }
  res.status(500).json({ error: "Express app not found or not a function", serverAppType: typeof serverApp });
}
