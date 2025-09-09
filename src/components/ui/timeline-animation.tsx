'use client'

import { motion, Variants } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface TimelineContentProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  className?: string
  animationNum?: number
  timelineRef?: React.RefObject<HTMLElement>
  customVariants?: Variants
}

export function TimelineContent({
  children,
  as: Component = "div",
  className,
  animationNum = 0,
  timelineRef,
  customVariants,
  ...props
}: TimelineContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const defaultVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      filter: "blur(5px)"
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  }

  const variants = customVariants || defaultVariants

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
      }
    )

    const currentElement = elementRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [])

  return (
    <motion.div
      ref={elementRef}
      custom={animationNum}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}