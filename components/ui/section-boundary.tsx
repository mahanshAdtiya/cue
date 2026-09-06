"use client";

import { Component, type ReactNode } from "react";

import { SectionHeader } from "@/components/ui/section-header";

type SectionBoundaryProps = {
  title: string;
  note?: string;
  message: string;
  className?: string;
  children: ReactNode;
};

type SectionBoundaryState = {
  failed: boolean;
};

export class SectionBoundary extends Component<
  SectionBoundaryProps,
  SectionBoundaryState
> {
  state: SectionBoundaryState = { failed: false };

  static getDerivedStateFromError(): SectionBoundaryState {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section
        className={`flex flex-col gap-3.5 ${this.props.className ?? ""}`}
      >
        <SectionHeader title={this.props.title} note={this.props.note} />
        <p className="text-mut-2 text-[13px]">{this.props.message}</p>
      </section>
    );
  }
}
