import { LOCKED_THEME } from "../game/themes.js";

export default function ThemePicker({ title = "VISUAL THEME", compact = false }) {
  if (compact) {
    return (
      <section className="theme-picker theme-picker--compact">
        <div className="theme-picker__chip-row">
          <span className="theme-picker__chip theme-picker__chip--label">{title}</span>
          <span className="theme-picker__chip theme-picker__chip--select">
            <span
              className="theme-picker__summary-swatch theme-picker__summary-swatch--compact"
              style={{ "--theme-accent": LOCKED_THEME.accent }}
              aria-hidden="true"
            />
            <span className="theme-picker__chip-text">
              {LOCKED_THEME.label} / {LOCKED_THEME.modeLabel}
            </span>
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="theme-picker">
      <div className="theme-picker__label">{title}</div>
      <div className="theme-picker__summary" title={LOCKED_THEME.description}>
        <span
          className="theme-picker__summary-swatch"
          style={{ "--theme-accent": LOCKED_THEME.accent }}
          aria-hidden="true"
        />
        <span className="theme-picker__summary-copy">
          <span className="theme-picker__summary-title">
            {LOCKED_THEME.label} / {LOCKED_THEME.modeLabel}
          </span>
          <span className="theme-picker__summary-description">{LOCKED_THEME.description}</span>
        </span>
      </div>

      <div className="theme-picker__preview" aria-hidden="true">
        <span className="theme-picker__preview-swatch theme-picker__preview-swatch--surface" />
        <span className="theme-picker__preview-swatch theme-picker__preview-swatch--panel" />
        <span className="theme-picker__preview-swatch theme-picker__preview-swatch--accent" />
      </div>
    </section>
  );
}
