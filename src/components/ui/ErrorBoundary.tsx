import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  fallback: ReactNode
  children: ReactNode
  /** Label used in the console when something fails. */
  name?: string
}

type ErrorBoundaryState = { failed: boolean }

/** Renders `fallback` if anything inside throws (e.g. a WebGL context failure). */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name ?? 'ErrorBoundary'}]`, error, info.componentStack)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
