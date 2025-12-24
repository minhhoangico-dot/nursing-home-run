import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full text-center">
                        <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-red-600">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h1>
                        <p className="text-slate-500 mb-6 text-sm">
                            Hệ thống gặp sự cố không mong muốn. Vui lòng tải lại trang.
                            <br />
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 inline-block font-mono text-red-500 overflow-hidden text-ellipsis w-full">
                                {this.state.error?.message}
                            </span>
                        </p>
                        <button
                            onClick={this.handleReload}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center gap-2 mx-auto w-full transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Tải lại trang
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
