import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width={32} height={32} rx={8} fill="hsl(var(--primary))" />
    <path
      d="M10 22V19.6522C10 18.1134 10.9333 17.0435 12.8 17.0435H13.2C15.0667 17.0435 16 18.1134 16 19.6522V22"
      stroke="hsl(var(--primary-foreground))"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 13.8696V10H16V13.8696C16 15.4083 15.0667 16.4783 13.2 16.4783H12.8C10.9333 16.4783 10 15.4083 10 13.8696Z"
      stroke="hsl(var(--primary-foreground))"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 10V22"
      stroke="hsl(var(--primary-foreground))"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 13H22"
      stroke="hsl(var(--primary-foreground))"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
