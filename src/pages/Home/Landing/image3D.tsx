import { useEffect, useRef, useCallback } from 'react'
import { Box, Image } from 'rebass/styled-components'

import iPhone from '../../../assets/svg/landing/iphone.svg'
import VisaCard from '../../../assets/svg/landing/visa-card.svg'
import FuseStaked from '../../../assets/svg/landing/fuse-staked.svg'
import Zap from '../../../assets/svg/landing/zap.svg'
import Usdt from '../../../assets/svg/landing/usdt.svg'
import UsdtBlur from '../../../assets/svg/landing/usdt-blur.svg'
import ZapBlur from '../../../assets/svg/landing/zap-blur.svg'

export default function Image3D() {
  const iphoneRef = useRef<HTMLImageElement>(null)
  const visaCardRef = useRef<HTMLImageElement>(null)
  const fuseStakedRef = useRef<HTMLImageElement>(null)
  const zapRef = useRef<HTMLImageElement>(null)
  const usdtRef = useRef<HTMLImageElement>(null)
  const usdtBlurRef = useRef<HTMLImageElement>(null)
  const zapBlurRef = useRef<HTMLImageElement>(null)

  const newScrollY = useRef(0)
  const previousScrollY = useRef(0)
  const isScrolling = useRef(false)

  const animate = (ref: React.RefObject<HTMLImageElement>, translateFactor: number, rotateFactor: number, invert = false) => {
    if (!ref.current) return

    const translateY = newScrollY.current * translateFactor
    const rotateZ = scrollY * rotateFactor

    const transform = window.getComputedStyle(ref.current).transform
    const matrix = new DOMMatrixReadOnly(transform)
    const currentTranslateY = matrix.m42

    const newTranslateY = currentTranslateY + translateY

    ref.current.style.transform = `
      translate3D(0, ${newTranslateY}px, 0)
      rotateZ(${invert ? '-' : ''}${rotateZ}deg)
    `
  }

  const oscillate = useCallback((ref: React.RefObject<HTMLImageElement>, translateFactor: number, increment = 0) => {
    if (!ref.current || isScrolling.current) return

    return requestAnimationFrame(() => {
      if (!(ref.current instanceof Element)) return

      const oscillation = Math.sin(increment) * translateFactor

      const transform = window.getComputedStyle(ref.current).transform
      const matrix = new DOMMatrixReadOnly(transform)
      const currentTranslateY = matrix.m42
      const currentRotateZ = Math.atan2(matrix.m12, matrix.m11) * (180 / Math.PI)

      const newTranslateY = currentTranslateY - oscillation

      ref.current.style.transform = `
        translate3D(0, ${newTranslateY}px, 0)
        rotateZ(${currentRotateZ}deg)
      `

      oscillate(ref, translateFactor, increment + 0.01)
    })
  }, [])

  useEffect(() => {
    const oscillateImages = [
      { ref: visaCardRef, translateFactor: 0.1 },
      { ref: fuseStakedRef, translateFactor: 0.15 },
      { ref: zapRef, translateFactor: 0.2 },
      { ref: usdtRef, translateFactor: 0.25 },
      { ref: usdtBlurRef, translateFactor: 0.3 },
      { ref: zapBlurRef, translateFactor: 0.3 },
    ]
    let oscillateIds = oscillateImages.map(image => oscillate(image.ref, image.translateFactor))

    const handleScroll = () => {
      isScrolling.current = true

      const scrollY = window.scrollY
      newScrollY.current = scrollY - previousScrollY.current
      previousScrollY.current = scrollY

      animate(iphoneRef, 0.067, 0.0033)
      animate(visaCardRef, 0.125, 0.004)
      animate(fuseStakedRef, 0.1, 0.0067, true)
      animate(zapRef, 0.111, 0.0143, true)
      animate(usdtRef, 0.25, 0.0125, true)
      animate(usdtBlurRef, 0.25, 0.0125, true)
      animate(zapBlurRef, 0.25, 0.0125, true)
    }

    const handleScrollEnd = () => {
      isScrolling.current = false
      oscillateIds = oscillateImages.map(image => oscillate(image.ref, image.translateFactor))
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('scrollend', handleScrollEnd)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scrollend', handleScrollEnd)
      oscillateIds.forEach(id => cancelAnimationFrame(id))
    }
  }, [oscillate])

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Image
          ref={iphoneRef}
          src={iPhone}
          sx={{
            maxWidth: '70%',
            transformStyle: 'preserve-3d',
            position: 'relative',
            top: '0',
            left: '15%',
            zIndex: 1,
          }}
          alt=""
        />
        <Image
          ref={visaCardRef}
          src={VisaCard}
          sx={{
            maxWidth: '60%',
            transformStyle: 'preserve-3d',
            position: 'absolute',
            top: '17%',
            left: '10%',
            zIndex: 2,
          }}
          alt=""
        />
        <Image
          ref={fuseStakedRef}
          src={FuseStaked}
          sx={{
            maxWidth: '40%',
            transformStyle: 'preserve-3d',
            position: 'absolute',
            top: '50%',
            right: '7%',
            zIndex: 2,
          }}
          alt=""
        />
        <Box
          sx={{
            display: ['none', 'block'],
            position: 'absolute',
            bottom: '-40%',
            left: '5%',
            backgroundImage: 'url("/images/landing/hero-background.png")',
            filter: 'blur(20px)',
            zIndex: 4,
            height: '50%',
            width: '60%',
            transform: 'rotate(6deg)',
          }}
        ></Box>
      </Box>
      <Image
        ref={zapRef}
        src={Zap}
        sx={{
          maxWidth: '20%',
          transformStyle: 'preserve-3d',
          position: 'absolute',
          top: '-10%',
          left: '-20%',
        }}
        alt=""
      />
      <Image
        ref={usdtRef}
        src={Usdt}
        sx={{
          maxWidth: '20%',
          transformStyle: 'preserve-3d',
          position: 'absolute',
          top: '-8%',
          right: '-30%',
        }}
        alt=""
      />
      <Image
        ref={usdtBlurRef}
        src={UsdtBlur}
        sx={{
          maxWidth: '20%',
          transformStyle: 'preserve-3d',
          position: 'absolute',
          top: '40%',
          left: '-20%',
        }}
        alt=""
      />
      <Image
        ref={zapBlurRef}
        src={ZapBlur}
        sx={{
          maxWidth: '20%',
          transformStyle: 'preserve-3d',
          position: 'absolute',
          top: '40%',
          right: '-35%',
        }}
        alt=""
      />
    </Box>
  )
}
