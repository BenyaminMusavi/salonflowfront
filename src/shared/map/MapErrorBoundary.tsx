"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface MapErrorBoundaryProps {
  /** Rendered instead of the map when its code cannot load or run. */
  fallback: ReactNode;
  /** Called once per failure (e.g. to remember that the map is unavailable). */
  onError?: (error: Error) => void;
  children: ReactNode;
}

interface MapErrorBoundaryState {
  failed: boolean;
}

/**
 * The map is a lazy chunk with modern syntax (MapLibre 6: class static blocks) and a WebGL dependency. If that
 * chunk cannot be fetched (offline) or parsed (iOS < 16.4), the error must stay inside the map area: the list,
 * the filters and the branch form keep working, and the user sees the «map unavailable» fallback instead of
 * the page-wide error screen.
 */
export default class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onError?.(error);
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
