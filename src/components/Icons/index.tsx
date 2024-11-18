export function WalletIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "inherit" }}>
      <path d="M16.7002 6.91667V4C16.7002 3.30965 16.1406 2.75 15.4502 2.75H4.2002C3.50984 2.75 2.9502 3.30965 2.9502 4V16.5C2.9502 17.1904 3.50984 17.75 4.2002 17.75H15.4502C16.1406 17.75 16.7002 17.1904 16.7002 16.5V13.5833" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" style={{ color: "inherit" }} />
      <path d="M16.7 6.91675H10.8667C10.1763 6.91675 9.6167 7.47639 9.6167 8.16675V12.3334C9.6167 13.0238 10.1763 13.5834 10.8667 13.5834H16.7C17.3904 13.5834 17.95 13.0238 17.95 12.3334V8.16675C17.95 7.47639 17.3904 6.91675 16.7 6.91675Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" style={{ color: "inherit" }} />
      <path d="M12.117 10.2499C12.117 9.78968 12.4901 9.41659 12.9504 9.41659C13.4106 9.41659 13.7837 9.78968 13.7837 10.2499C13.7837 10.7102 13.4106 11.0833 12.9504 11.0833C12.4901 11.0833 12.117 10.7102 12.117 10.2499Z" fill="#76EC00" />
    </svg>
  )
}

export function MenuNav({ stroke }: { stroke: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
  )
}
