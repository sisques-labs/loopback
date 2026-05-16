type LogoProps = {
  className?: string;
  size?: number;
};

export function Logo({ className, size = 20 }: LogoProps) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden="true"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* left bracket — foreground color */}
        <path
          d="M8 8 H24 V14 H14 V50 H24 V56 H8 Z"
          className="fill-foreground"
        />
        {/* right bracket — brand accent */}
        <path
          d="M56 8 H40 V14 H50 V50 H40 V56 H56 Z"
          className="fill-primary"
        />
      </svg>
      <span className="font-semibold text-foreground">Loopback</span>
    </span>
  );
}
