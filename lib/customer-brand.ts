/** Customer brand slot only. Requested primary is preserved; text adapts for contrast. */
export function customerBrand(requested: string) {
  const effective = /^#[0-9a-f]{6}$/i.test(requested) ? requested.toLowerCase() : '#173b57'
  const linear = (n: number) => { const c = n / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4 }
  const rgb = [1,3,5].map(i => linear(parseInt(effective.slice(i, i + 2), 16)))
  const luminance = .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]
  const black = (luminance + .05) / .05, white = 1.05 / (luminance + .05)
  return { requested, effective, foreground: black >= white ? '#000000' : '#ffffff', contrast: Math.max(black, white) }
}
