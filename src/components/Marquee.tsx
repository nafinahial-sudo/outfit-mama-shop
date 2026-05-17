export function Marquee() {
  const text =
    "⚽ Buy World Cup 2026 Jerseys from Outfit Mama — premium quality with stylish comfort for true football fans!";
  return (
    <div className="relative overflow-hidden border-y border-gold/40 bg-black text-white">
      <div className="flex whitespace-nowrap py-3 [animation:marquee_30s_linear_infinite]">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="mx-8 font-display text-sm uppercase tracking-[0.2em] md:text-base"
          >
            <span className="text-gold">{text}</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
