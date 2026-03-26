interface AssetBinding {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface Env {
  ASSETS: AssetBinding;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    const url = new URL(request.url);
    const isDocumentRoute =
      (request.method === 'GET' || request.method === 'HEAD') &&
      !url.pathname.startsWith('/assets/') &&
      !url.pathname.includes('.');

    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (!isDocumentRoute && !acceptsHtml) {
      return assetResponse;
    }

    let documentResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', url), request));

    if (documentResponse.status >= 300 && documentResponse.status < 400) {
      const location = documentResponse.headers.get('location');
      if (location) {
        documentResponse = await env.ASSETS.fetch(new Request(new URL(location, url), request));
      }
    }

    return documentResponse;
  },
};
