'use client';

import React from 'react';

// ================= Card Components =================
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', style = {}, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`dash-card ${className}`}
      style={{
        background: 'var(--dash-card-bg)',
        border: '1px solid var(--dash-border)',
        borderRadius: 'var(--dash-radius, 14px)',
        boxShadow: 'var(--dash-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.05))',
        color: 'var(--dash-text-main)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', style = {}, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`dash-card-header ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--dash-border)',
        gap: '12px',
        flexWrap: 'wrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { icon?: string }
>(({ className = '', style = {}, icon, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={`dash-card-title ${className}`}
    style={{
      fontSize: '15px',
      fontWeight: 700,
      color: 'var(--dash-text-main)',
      letterSpacing: '-0.2px',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      lineHeight: 1.2,
      ...style,
    }}
    {...props}
  >
    {icon && <i className={icon} style={{ color: '#f97316' }} />}
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', style = {}, children, ...props }, ref) => (
  <p
    ref={ref}
    className={`dash-card-description ${className}`}
    style={{
      fontSize: '12.5px',
      color: 'var(--dash-text-muted)',
      margin: '4px 0 0 0',
      lineHeight: 1.4,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', style = {}, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`dash-card-content ${className}`}
      style={{
        padding: '20px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', style = {}, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`dash-card-footer ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 20px',
        borderTop: '1px solid var(--dash-border)',
        background: 'var(--dash-muted-bg)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

// ================= Badge Component =================
export const Badge: React.FC<{
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'neutral';
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}> = ({ variant = 'primary', style = {}, className = '', children }) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'rgba(249, 115, 22, 0.12)',
      color: '#f97316',
      border: '1px solid rgba(249, 115, 22, 0.25)',
    },
    success: {
      background: 'rgba(16, 185, 129, 0.12)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.25)',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.12)',
      color: '#f59e0b',
      border: '1px solid rgba(245, 158, 11, 0.25)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.12)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.25)',
    },
    info: {
      background: 'rgba(14, 165, 233, 0.12)',
      color: '#0ea5e9',
      border: '1px solid rgba(14, 165, 233, 0.25)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--dash-text-muted)',
      border: '1px solid var(--dash-border)',
    },
    neutral: {
      background: 'rgba(100, 116, 139, 0.12)',
      color: '#64748b',
      border: '1px solid rgba(100, 116, 139, 0.25)',
    },
  };

  return (
    <span
      className={`dash-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.2px',
        lineHeight: 1.2,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// ================= Button Component =================
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    loading?: boolean;
  }
>(({ variant = 'primary', size = 'md', icon, loading, className = '', style = {}, children, disabled, ...props }, ref) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: '#f97316',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
    },
    success: {
      background: '#10b981',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
    },
    secondary: {
      background: 'var(--dash-muted-bg)',
      color: 'var(--dash-text-main)',
      border: '1px solid var(--dash-border)',
    },
    danger: {
      background: '#ef4444',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--dash-text-main)',
      border: '1px solid var(--dash-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--dash-text-muted)',
      border: 'none',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '12px', borderRadius: '8px' },
    md: { padding: '9px 16px', fontSize: '13px', borderRadius: '10px' },
    lg: { padding: '12px 22px', fontSize: '14.5px', borderRadius: '12px' },
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`dash-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <i className="ri-loader-4-line ri-spin" />
      ) : icon ? (
        <i className={icon} />
      ) : null}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

// ================= PageHeader Component =================
export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, breadcrumb, action }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    }}
  >
    <div>
      {breadcrumb && (
        <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Halo Bangun</span>
          <span>/</span>
          <span style={{ color: '#f97316', fontWeight: 600 }}>{breadcrumb}</span>
        </div>
      )}
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 800,
          color: 'var(--dash-text-main)',
          margin: 0,
          letterSpacing: '-0.4px',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: '13px',
            color: 'var(--dash-text-muted)',
            margin: '4px 0 0 0',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

