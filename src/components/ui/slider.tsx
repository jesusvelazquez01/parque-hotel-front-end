
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track 
      className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full",
        "bg-gradient-to-r from-hotel-slate/20 to-hotel-slate/30",
        "backdrop-blur-sm shadow-inner"
      )}
    >
      <SliderPrimitive.Range 
        className={cn(
          "absolute h-full",
          "bg-gradient-to-r from-hotel-gold/90 via-hotel-gold to-hotel-gold/90",
          "transition-all duration-200 ease-out",
          "backdrop-blur-sm shadow-md"
        )} 
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className={cn(
        "block h-5 w-5 rounded-full shadow-lg",
        "border-2 border-hotel-gold",
        "bg-gradient-to-b from-white to-hotel-light",
        "ring-offset-background transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-hotel-gold focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "hover:scale-110 hover:border-hotel-accent",
        "active:scale-95",
        "cursor-pointer"
      )} 
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
