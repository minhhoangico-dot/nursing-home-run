import type { PropsWithChildren, ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
}

function TestWrapper({
  children,
  routerProps,
}: PropsWithChildren<{ routerProps?: MemoryRouterProps }>) {
  return <MemoryRouter {...routerProps}>{children}</MemoryRouter>;
}

export function renderWithProviders(
  ui: ReactElement,
  { routerProps, ...options }: RenderWithProvidersOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper routerProps={routerProps}>{children}</TestWrapper>
    ),
    ...options,
  });
}
