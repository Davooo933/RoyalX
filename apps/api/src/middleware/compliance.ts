import type { Request, Response, NextFunction } from 'express';

const defaultDeny = new Set<string>([
  // Example restricted countries
  'US', 'IR', 'KP', 'SY'
]);

export function geoBlock(denylist: Set<string> = defaultDeny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const country = (req.headers['cf-ipcountry'] || req.headers['x-country'] || '').toString().toUpperCase();
    if (country && denylist.has(country)) {
      return res.status(451).json({ error: 'region_restricted' });
    }
    next();
  };
}

export function responsibleGamingHeaders() {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-RG-Limits', 'enabled');
    next();
  };
}

