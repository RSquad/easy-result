export function utf8ToHex(str: any) {
  return Array.from(str)
    .map((c: any) =>
      c.charCodeAt(0) < 128
        ? c.charCodeAt(0).toString(16)
        : encodeURIComponent(c).replace(/\%/g, '').toLowerCase()
    )
    .join('');
}
export function hexToUtf8(hex: any) {
  return decodeURIComponent('%' + hex.match(/.{1,2}/g).join('%'));
}
