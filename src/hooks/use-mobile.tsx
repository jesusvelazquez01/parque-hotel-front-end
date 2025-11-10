
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Set the initial state
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Define the resize handler
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener with throttling for better performance
    let resizeTimer: ReturnType<typeof setTimeout>;
    const throttledResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 100)
    }
    
    window.addEventListener("resize", throttledResize)
    
    return () => {
      window.removeEventListener("resize", throttledResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  return !!isMobile
}
