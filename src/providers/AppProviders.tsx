import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export const AppProviders = ({ children }: { children: ReactNode }) => {
    return (
        <BrowserRouter>
            {children}
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </BrowserRouter>
    );
};
