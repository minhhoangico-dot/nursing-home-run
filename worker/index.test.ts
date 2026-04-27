import { describe, expect, test, vi } from 'vitest';

import { APP_SHELL_PATH } from './generatedAppShell';
import worker from './index';

describe('worker app shell routing', () => {
  test('serves the versioned app shell for html document routes', async () => {
    const assetFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : input.toString();
      const pathname = new URL(url).pathname;

      if (pathname === APP_SHELL_PATH) {
        return new Response('<html><body>fresh shell</body></html>', {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }

      return new Response('Not found', { status: 404 });
    });

    const response = await worker.fetch(
      new Request('https://example.com/residents/R002', {
        headers: {
          accept: 'text/html',
        },
      }),
      {
        ASSETS: {
          fetch: assetFetch,
        },
      },
    );

    expect(assetFetch).toHaveBeenCalledTimes(1);
    expect(
      new URL(
        assetFetch.mock.calls[0][0] instanceof Request
          ? assetFetch.mock.calls[0][0].url
          : assetFetch.mock.calls[0][0].toString(),
      ).pathname,
    ).toBe(APP_SHELL_PATH);
    expect(APP_SHELL_PATH).toMatch(/^\/app-shell-.+\.html$/);
    expect(await response.text()).toContain('fresh shell');
    expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
    expect(response.headers.get('CDN-Cache-Control')).toBe('no-store');
  });

  test('falls back to the root document when the versioned app shell is unavailable', async () => {
    const assetFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : input.toString();
      const pathname = new URL(url).pathname;

      if (pathname === APP_SHELL_PATH) {
        return new Response(null, { status: 404 });
      }

      if (pathname === '/') {
        return new Response('<html><body>root shell</body></html>', {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }

      return new Response('Not found', { status: 404 });
    });

    const response = await worker.fetch(
      new Request('https://example.com/dashboard', {
        headers: {
          accept: 'text/html',
        },
      }),
      {
        ASSETS: {
          fetch: assetFetch,
        },
      },
    );

    expect(assetFetch).toHaveBeenCalledTimes(2);
    expect(
      new URL(
        assetFetch.mock.calls[1][0] instanceof Request
          ? assetFetch.mock.calls[1][0].url
          : assetFetch.mock.calls[1][0].toString(),
      ).pathname,
    ).toBe('/');
    expect(await response.text()).toContain('root shell');
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
  });
});
