"use client"

export function BackgroundEffects() {
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(255, 217, 94, 0.04) 0%, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255, 179, 0, 0.03) 0%, transparent 40%)",
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)",
        }}
      />

      <div
        className="fixed top-0 left-0 right-0 h-32 pointer-events-none opacity-30"
        style={{
          background: "linear-gradient(180deg, rgba(245, 211, 108, 0.08) 0%, transparent 100%)",
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#f5d36c]/20 rounded-full float-dust"
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
