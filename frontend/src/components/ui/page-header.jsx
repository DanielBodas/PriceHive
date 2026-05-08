import React from "react";

/**
 * PageHeader - A reusable header component for the PriceHive app.
 * Inspired by the premium "Honey Tech" aesthetic with Amber gradients.
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  tag,
  actions,
  className = "" 
}) => {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl sm:p-8 ${className}`}>
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                {tag && (
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                        {tag}
                    </p>
                )}
                <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl font-heading tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-2 max-w-lg text-sm font-medium text-slate-400 leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {actions}
            </div>
        </div>
    </div>
  );
};

export { PageHeader };
