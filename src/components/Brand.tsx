type BrandProps = {
  href?: string;
  tagline?: boolean;
  className?: string;
};

export function Brand({ href = '/', tagline = false, className = '' }: BrandProps) {
  const classes = ['cf-brand', tagline ? 'cf-brand--tagline' : '', className].filter(Boolean).join(' ');

  return (
    <a href={href} className={classes} aria-label="CodeFix.IT — strona główna">
      <span className="cf-brand-mark" aria-hidden="true">
        <img
          className="cf-brand-logo"
          src="/brand/codefix-devil-mark.webp"
          width="128"
          height="128"
          alt=""
          decoding="sync"
          loading="eager"
          fetchPriority="high"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            maxWidth: 'none',
            opacity: 1,
            visibility: 'visible',
            objectFit: 'contain',
          }}
        />
      </span>
      <span className="cf-brand-copy">
        <span className="cf-brand-name">
          Code<strong>Fix</strong><span>.IT</span>
        </span>
        {tagline && <span className="cf-brand-tagline">Diabeł tkwi w kodzie</span>}
      </span>
    </a>
  );
}
