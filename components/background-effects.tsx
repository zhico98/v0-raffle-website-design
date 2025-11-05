"use client"

export function BackgroundEffects() {
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(153, 69, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(100, 50, 200, 0.12) 0%, transparent 50%)",
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(153, 69, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(153, 69, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)",
        }}
      />

      <div
        className="fixed top-0 left-0 right-0 h-32 pointer-events-none opacity-20"
        style={{
          background: "linear-gradient(180deg, rgba(153, 69, 255, 0.12) 0%, transparent 100%)",
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/20 rounded-full float-dust"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </>
  )
}
