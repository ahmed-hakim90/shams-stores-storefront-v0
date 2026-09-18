'use client'

import { Component, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
  label?: string
}

type State = {
  error: Error | null
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error(`[SectionErrorBoundary: ${this.props.label ?? 'section'}]`, error)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Something went wrong loading this section.
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex min-h-9 items-center rounded-(--radius-control) border border-border px-4 text-sm font-medium hover:border-foreground hover:text-foreground"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
