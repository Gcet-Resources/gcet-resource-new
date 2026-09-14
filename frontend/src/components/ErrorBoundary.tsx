import { Component, type ReactNode, type ErrorInfo } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Do not log tokens or personal state. Monitoring can receive a redacted error code. */
  }
  render() {
    if (this.state.failed)
      return (
        <main
          id="main-content"
          className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-5 p-6 text-center"
        >
          <h1 className="text-3xl font-bold">
            Something interrupted this page
          </h1>
          <p>
            Your account data is safe. Reload to try again, or return to campus.
          </p>
          <button
            className="rounded-xl bg-teal-700 px-5 py-3 text-white"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
          <a className="underline" href="/">
            Back to campus
          </a>
        </main>
      );
    return this.props.children;
  }
}
