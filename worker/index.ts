interface AssetBinding {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface Env {
  ASSETS: AssetBinding;
}

import { APP_SHELL_PATH } from './generatedAppShell';

function isDocumentRequest(request: Request): boolean {
  const url = new URL(request.url);

  return (
    (request.method === 'GET' || request.method === 'HEAD') &&
    !url.pathname.startsWith('/assets/') &&
    !url.pathname.includes('.') &&
    !!request.headers.get('accept')?.includes('text/html')
  );
}

function withDocumentCacheHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  headers.set('CDN-Cache-Control', 'no-store');
  headers.set('Cloudflare-CDN-Cache-Control', 'no-store');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (isDocumentRequest(request)) {
      const documentRequest = new Request(new URL(APP_SHELL_PATH, request.url), request);
      let documentResponse = await env.ASSETS.fetch(documentRequest);

      if (documentResponse.status >= 300 && documentResponse.status < 400) {
        const location = documentResponse.headers.get('location');
        if (location) {
          documentResponse = await env.ASSETS.fetch(new Request(new URL(location, request.url), request));
        }
      }

      return withDocumentCacheHeaders(documentResponse);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    return assetResponse;
  },
};
