// Static, GPU-cheap terminal backdrop: fine graph-paper grid, a soft
// top glow, and a slow phosphor scan sweep. No blurred blobs.
const AuroraBackground = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* graph-paper grid, fading out toward the bottom */}
      <div
        className="grid-bg absolute inset-0 opacity-70"
        style={{
          maskImage:
            "radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 90%)",
        }}
      />
      {/* soft phosphor glow at the top */}
      <div className="absolute -top-48 left-1/2 h-[36rem] w-[52rem] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[130px]" />
      {/* slow scan sweep */}
      <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-accent/[0.04] to-transparent" />
      {/* deepen toward the base */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary" />
    </div>
  );
};

export default AuroraBackground;
