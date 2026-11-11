import localFont from 'next/font/local'

// Consumer D14 faces, shared by the company opening and the product layouts.
export const display = localFont({ src: '../../app/_fonts/schibsted-grotesk-latin.woff2', weight: '400 900', variable: '--acq-display', display: 'optional' })
export const body = localFont({ src: '../../app/_fonts/manrope-latin.woff2', weight: '200 800', variable: '--acq-body', display: 'optional' })
