'use client';

import React from 'react';
import { Search, Bell, ShieldCheck } from 'lucide-react';

export default function Header({ title }: { title: string }) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6"
      style={{
        height: 'var(--header-height)',
        background: 'rgba(8, 11, 17, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Left: Page Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        <h1 className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {title}
        </h1>
        <span className="badge badge-emerald hidden lg:inline-flex">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse" />
          Live
        </span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="input-field text-[12px] py-2 pl-8 pr-4"
            style={{ width: '220px', padding: '7px 12px 7px 32px' }}
          />
        </div>

        {/* Safety indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '11px',
            fontWeight: 600,
            color: '#6EE7B7',
          }}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Safety Protocol Active
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl btn-ghost"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 dot-pulse" />
        </button>
      </div>
    </header>
  );
}
