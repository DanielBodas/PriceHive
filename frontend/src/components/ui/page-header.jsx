import React from "react";

/**
 * PageHeader - A reusable header component for the PriceHive app.
 * Inspired by the premium "Big Tech" aesthetic with primary gradients.
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  tag,
  actions,
  className = "" 
}) => {
  return (
    <div className={`relative overflow-hidden rounded-[24px] honeycomb-header p-5 text-white shadow-md sm:p-6 ${className}`}>
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/5" />
        
        {/* Brand Watermark Easter Egg */}
        <img 
            src="/icon.png" 
            alt="" 
            className="absolute -right-4 -bottom-4 w-32 h-32 object-contain opacity-10 pointer-events-none rotate-12" 
        />

        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 z-10">
                {tag && (
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
                        {tag}
                    </p>
                )}
                <h1 className="mt-0.5 text-2xl font-black leading-tight sm:text-3xl text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-1 max-w-md text-xs font-semibold text-white/90">
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
