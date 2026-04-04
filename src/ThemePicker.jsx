export default function ThemePicker({
  themeId,
  themes,
  onThemeChange,
  title = "VISUAL THEME",
  compact = false,
}) {
  return (
    <section className={`theme-picker${compact ? " theme-picker--compact" : ""}`}>
      <div className="theme-picker__label">{title}</div>
      <div className="theme-picker__options">
        {themes.map((theme) => {
          const isActive = theme.id === themeId;

          return (
            <button
              key={theme.id}
              type="button"
              className={`theme-option${isActive ? " theme-option--active" : ""}`}
              onClick={() => onThemeChange(theme.id)}
              aria-pressed={isActive}
              title={theme.description}
            >
              <span
                className="theme-option__swatch"
                style={{ "--theme-accent": theme.accent }}
                aria-hidden="true"
              />
              <span className="theme-option__copy">
                <span className="theme-option__name">{theme.label}</span>
                {!compact ? (
                  <span className="theme-option__description">{theme.description}</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
