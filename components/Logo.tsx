import Link from "next/link";

interface LogoProps {
  variant?: "default" | "white" | "small";
  href?: string;
}

export function Logo({ variant = "default", href = "/" }: LogoProps) {
  const logoSvg = (
    <svg
      width={variant === "small" ? "32" : "48"}
      height={variant === "small" ? "32" : "48"}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <rect
        width="48"
        height="48"
        rx="8"
        fill={variant === "white" ? "white" : "#1F2937"}
      />

      {/* Shopping bag shape */}
      <g transform="translate(12, 10)">
        {/* Bag body */}
        <path
          d="M3 6H21V24C21 25.1 20.1 26 19 26H5C3.9 26 3 25.1 3 24V6Z"
          fill={variant === "white" ? "#1F2937" : "#FF6B35"}
          stroke={variant === "white" ? "#1F2937" : "#FF6B35"}
          strokeWidth="1.5"
        />

        {/* Bag handles */}
        <path
          d="M8 6C8 3.8 9.8 2 12 2C14.2 2 16 3.8 16 6"
          stroke={variant === "white" ? "#1F2937" : "#FF6B35"}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Shopping items indicator - horizontal lines */}
        <line
          x1="6"
          y1="12"
          x2="18"
          y2="12"
          stroke={variant === "white" ? "#1F2937" : "white"}
          strokeWidth="1"
          opacity="0.6"
        />
        <line
          x1="6"
          y1="16"
          x2="18"
          y2="16"
          stroke={variant === "white" ? "#1F2937" : "white"}
          strokeWidth="1"
          opacity="0.6"
        />
        <line
          x1="6"
          y1="20"
          x2="18"
          y2="20"
          stroke={variant === "white" ? "#1F2937" : "white"}
          strokeWidth="1"
          opacity="0.6"
        />
      </g>
    </svg>
  );

  const content = (
    <div className="flex items-center gap-2">
      {logoSvg}
      {variant !== "small" && (
        <span
          className={`font-bold text-xl ${
            variant === "white" ? "text-white" : "text-gray-900"
          }`}
        >
          MonShop
        </span>
      )}
    </div>
  );

  if (href === "/") {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
