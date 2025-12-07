const Tag = ({ children }: { children: string }) => {
  return (
    <span
      style={{
        backgroundColor: "var(--color-bg-secondary)", // Discord secondary
        color: "var(--color-brand-primary)", // Brand primary
        border: "1px solid var(--color-border)",
        borderRadius: "4px",
        padding: "0.15rem 0.5rem",
        fontSize: "0.85em",
        lineHeight: "1",
        display: "inline-block",
        fontWeight: 500
      }}
    >
      {children}
    </span>
  );
};

export default Tag;
