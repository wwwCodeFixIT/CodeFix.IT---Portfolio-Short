type BrandProps = {
  href?: string;
  tagline?: boolean;
  className?: string;
};

export function Brand({ href = '/', tagline = false, className = '' }: BrandProps) {
  const classes = ['cf-brand', tagline ? 'cf-brand--tagline' : '', className].filter(Boolean).join(' ');

  return (
    <a href={href} className={classes} aria-label="CodeFix.IT — strona główna">
      <img
        className="cf-brand-logo"
        src="/favicon.svg"
        width="44"
        height="44"
        alt=""
        aria-hidden="true"
        decoding="async"
      />
      <span className="cf-brand-copy">
        <span className="cf-brand-name">
          Code<strong>Fix</strong><span>.IT</span>
        </span>
        {tagline && <span className="cf-brand-tagline">Diabeł tkwi w kodzie</span>}
      </span>
    </a>
  );
}
