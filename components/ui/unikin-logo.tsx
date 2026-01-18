'use client'

import { cn } from '@/lib/utils'

interface UnikinLogoProps {
  className?: string
  size?: number
  showText?: boolean
}

export function UnikinLogo({ className, size = 64, showText = false }: UnikinLogoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Fond du blason - forme de bouclier */}
        <path
          d="M10 10 L190 10 L190 140 C190 180 100 210 100 210 C100 210 10 180 10 140 Z"
          fill="#1E3A8A"
          stroke="#0F172A"
          strokeWidth="3"
        />
        
        {/* Triangle jaune à droite */}
        <path
          d="M190 10 L190 140 C190 160 160 180 130 195 L190 10 Z"
          fill="#FBBF24"
        />
        
        {/* Triangle rouge/orange */}
        <path
          d="M150 10 L190 10 L190 80 Z"
          fill="#EF4444"
        />
        
        {/* Livre ouvert - partie gauche */}
        <path
          d="M40 120 L100 100 L100 160 L40 145 Z"
          fill="white"
          stroke="#0F172A"
          strokeWidth="1"
        />
        
        {/* Livre ouvert - partie droite */}
        <path
          d="M100 100 L160 120 L160 145 L100 160 Z"
          fill="#E5E7EB"
          stroke="#0F172A"
          strokeWidth="1"
        />
        
        {/* Plume/Stylo */}
        <path
          d="M100 45 L100 110"
          stroke="#0F172A"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M95 45 L100 30 L105 45 Z"
          fill="#0F172A"
        />
        
        {/* Étoiles */}
        <g fill="#FBBF24">
          {/* Étoile gauche */}
          <polygon points="55,55 58,65 68,65 60,72 63,82 55,75 47,82 50,72 42,65 52,65" />
          {/* Étoile centrale */}
          <polygon points="100,65 103,75 113,75 105,82 108,92 100,85 92,92 95,82 87,75 97,75" />
          {/* Étoile droite */}
          <polygon points="145,55 148,65 158,65 150,72 153,82 145,75 137,82 140,72 132,65 142,65" />
        </g>
        
        {/* Petites étoiles jaunes dans le triangle */}
        <g fill="#FBBF24">
          <polygon points="165,140 167,145 172,145 168,149 170,154 165,151 160,154 162,149 158,145 163,145" transform="scale(0.7) translate(70, 60)" />
          <polygon points="165,140 167,145 172,145 168,149 170,154 165,151 160,154 162,149 158,145 163,145" transform="scale(0.7) translate(85, 90)" />
          <polygon points="165,140 167,145 172,145 168,149 170,154 165,151 160,154 162,149 158,145 163,145" transform="scale(0.7) translate(100, 120)" />
        </g>
      </svg>
      
      {showText && (
        <p className="mt-2 text-xs font-semibold text-center text-gray-600 dark:text-gray-400 tracking-wider">
          SCIENTIA SPLENDET ET CONSCIENTIA
        </p>
      )}
    </div>
  )
}

// Version simplifiée pour les filigranes
export function UnikinLogoSimple({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fond du blason simplifié */}
      <path
        d="M10 10 L190 10 L190 140 C190 180 100 210 100 210 C100 210 10 180 10 140 Z"
        fill="currentColor"
        opacity="0.15"
      />
      
      {/* Triangle */}
      <path
        d="M190 10 L190 140 C190 160 160 180 130 195 L190 10 Z"
        fill="currentColor"
        opacity="0.25"
      />
      
      {/* Étoiles */}
      <g fill="currentColor" opacity="0.3">
        <polygon points="55,55 58,65 68,65 60,72 63,82 55,75 47,82 50,72 42,65 52,65" />
        <polygon points="100,65 103,75 113,75 105,82 108,92 100,85 92,92 95,82 87,75 97,75" />
        <polygon points="145,55 148,65 158,65 150,72 153,82 145,75 137,82 140,72 132,65 142,65" />
      </g>
      
      {/* Plume */}
      <path
        d="M100 45 L100 110"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.2"
      />
    </svg>
  )
}
