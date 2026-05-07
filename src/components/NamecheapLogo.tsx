export default function NamecheapLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 130 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Namecheap"
      role="img"
    >
      {/* Flame mark — two overlapping flame shapes forming the N */}
      <g>
        {/* Left flame */}
        <path
          d="M4 28C1 21 4 11 12 5C9 13 13 20 19 21C17 26 11 30 4 28Z"
          fill="#D94424"
        />
        {/* Right flame */}
        <path
          d="M18 28C15 21 18 11 26 5C23 13 27 20 33 21C31 26 25 30 18 28Z"
          fill="#F26522"
        />
      </g>
      {/* namecheap wordmark */}
      <text
        x="40"
        y="23"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="16"
        fontWeight="400"
        fill="currentColor"
        letterSpacing="0"
      >
        namecheap
      </text>
    </svg>
  );
}
