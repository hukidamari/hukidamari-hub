const Tag = ({ children }: { children: string }) => {
  return (
    <span
      style={{
        backgroundColor: "#eef2f6",
        color: "#333",
        borderRadius: "0.5rem",
        padding: "0.1rem 0.6rem",
        fontSize: "85%",
      }}
    >
      {children}
    </span>
  );
};

export default Tag;
