import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const GlobalLanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const resolved = i18n.resolvedLanguage || "en";
  const currentLanguageLabel = resolved.startsWith("am")
    ? "Amharic"
    : resolved.startsWith("or")
      ? "Oromo"
      : "English";

  if (
    location.pathname === "/" ||
    location.pathname === "/home" ||
    location.pathname === "/dashboard"
  ) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        background: "rgba(17, 24, 39, 0.9)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 9999,
        padding: "4px",
        color: "#fff"
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: "#111827",
          color: "#fff",
          border: "1px solid #374151",
          borderRadius: 9999,
          padding: "8px 12px",
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}
        aria-label={t("language")}
        title={t("language")}
      >
        <span>🌐</span>
        <span style={{ fontSize: 22, lineHeight: 0.6 }}>{currentLanguageLabel}</span>
        <span style={{ fontSize: 16 }}>⌄</span>
      </button>
      {open && (
        <div
          style={{
            background: "#111827",
            color: "#fff",
            border: "1px solid #374151",
            borderRadius: 12,
            padding: 6,
            fontSize: 13,
            position: "absolute",
            top: 48,
            right: 0,
            minWidth: 130
          }}
        >
          {[
            { code: "en", label: "English" },
            { code: "am", label: "Amharic" },
            { code: "or", label: "Oromo" }
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: resolved.startsWith(lang.code) ? "#1f2937" : "transparent",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 10px",
                cursor: "pointer"
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalLanguageSwitcher;
