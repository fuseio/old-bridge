export const brushHandle = (height: number) => {
  return (
    <svg width="20" height={height} viewBox="0 0 20 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.832 72.8291C19.832 75.5905 17.5935 77.8291 14.832 77.8291L2.55176 77.8291L2.55176 48.3404L14.832 48.3404C17.5935 48.3404 19.832 50.579 19.832 53.3404L19.832 72.8291Z"
        fill="#333333"
      />
      <rect
        x="5.05273"
        y="127.122"
        width="5"
        height="126.876"
        rx="2.5"
        transform="rotate(-180 5.05273 127.122)"
        fill="#333333"
      />
      <rect
        x="13.6406"
        y="70.3369"
        width="2"
        height="14.5095"
        rx="1"
        transform="rotate(-180 13.6406 70.3369)"
        fill="white"
      />
      <rect
        x="13.6406"
        y="70.3369"
        width="2"
        height="14.5095"
        rx="1"
        transform="rotate(-180 13.6406 70.3369)"
        fill="white"
      />
      <rect
        x="8.05273"
        y="70.3369"
        width="2"
        height="14.5095"
        rx="1"
        transform="rotate(-180 8.05273 70.3369)"
        fill="white"
      />
      <rect
        x="8.05273"
        y="70.3369"
        width="2"
        height="14.5095"
        rx="1"
        transform="rotate(-180 8.05273 70.3369)"
        fill="white"
      />
    </svg>
  )
}

export const OffScreenHandle = ({
  color,
  size = 10,
  margin = 10,
}: {
  color: string
  size?: number
  margin?: number
}) => (
  <polygon
    points={`0 0, ${size} ${size}, 0 ${size}`}
    transform={` translate(${size + margin}, ${margin}) rotate(45) `}
    fill={color}
    stroke={color}
    strokeWidth="4"
    strokeLinejoin="round"
  />
)
