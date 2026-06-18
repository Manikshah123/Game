import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white z-50 p-8">
          <h1 className="text-4xl text-red-500 font-orbitron mb-4">SYSTEM FAILURE</h1>
          <p className="text-xl mb-8">An error occurred in the simulation.</p>
          <pre className="bg-black/50 p-4 rounded text-sm text-red-300 max-w-2xl overflow-auto">
            {this.state.error?.message}
          </pre>
          <button 
            className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-500 rounded font-orbitron"
            onClick={() => window.location.reload()}
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}
