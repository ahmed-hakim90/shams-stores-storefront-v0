const OPENAI_PIXEL_ID = 'KBHCVX1dYePAFy31mpRQgR'

export const openaiPixelScript = `
!function(w,d,s,u){
  if(w.oaiq)return;
  var q=function(){q.q.push(arguments)};
  q.q=[];w.oaiq=q;
  var j=d.createElement(s);j.async=1;j.src=u;
  var f=d.getElementsByTagName(s)[0];
  f.parentNode.insertBefore(j,f)
}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");
oaiq("init", { pixelId: "${OPENAI_PIXEL_ID}", debug: false });
`.trim()

export function measureOaiq(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const q = (window as unknown as { oaiq?: (...args: unknown[]) => void }).oaiq
  if (typeof q !== 'function') return
  q('measure', event, params)
}

export function getOppref(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(/(?:^|;\s*)openai_oppref=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

export function captureOppref() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const oppref = params.get('oppref')
  if (oppref) {
    document.cookie = `openai_oppref=${encodeURIComponent(oppref)};max-age=${30 * 86400};path=/;SameSite=Lax`
  }
}

export { OPENAI_PIXEL_ID }
