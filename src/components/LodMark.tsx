// The LOD diamond mark, rebuilt as a vector from the original logo so it stays
// sharp at any size. Drawn as a square with the letter gaps cut out, then turned 45°.
export const LOD_MARK_PATH =
  'M0 0H100V100H0Z M40 100V72H30V90H10V14L0 4V0H4L44 40H57L28.5 10H90V30H58.5L68.5 40H100V45H45V100Z M55 55H90V90H55Z'

export function LodMark({ size = 34, color = '#4caf50', className, title }: {
  size?: number
  color?: string
  className?: string
  title?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-20.71 -20.71 141.42 141.42"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path transform="rotate(45 50 50)" fill={color} fillRule="evenodd" d={LOD_MARK_PATH} />
    </svg>
  )
}
