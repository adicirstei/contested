import clamp from "clamp"
import lerp from "lerp"
import { norm, repeatedly } from "./extras"
export const Named = {
    Black : [0,0,0,255],
    White: [255,255,255,255]
}
export function rgba(str) {
    if (str instanceof Array) return str
    const [r,g,b,a] = str.match(/[#](..)(..)(..)(..)?/).slice(1,4).map(c=>parseInt(c,16))
    return (a ? [r,g,b,a] : [r,g,b])
}

export function  setAlpha(c,a) {
    if(c instanceof Array )
    return fromRGBA(c.slice(0,3).concat([a]))
    return setAlpha(rgba(c), a)
}

export function fromRGBA([r,g,b,a]) {
    return `rgba(${r}, ${g}, ${b}, ${ norm((a===undefined?255:a), 0,255, 0,1)} )`
}

export function gradient(palette) {
    const step = 1/palette.length
    return (t) => {
        t=clamp(t, 0, 1)
        // console.log(t)
        const f = t/step
        const i = Math.floor(f)
        const localt = f-i
        if (t===1) return rgba(palette[0])
        const c1 = rgba(palette[i])
        const c2 = rgba(palette[i+1] || palette[0])
        return c1.map((c,i) => lerp(c,c2[i], localt))
    }
}
export function lerpColor(c1,c2, t) {
    return c1.map((c,i)=>lerp(c,c2[i], t))
}

export function mult(c,f) {
    const newc = rgba(c).map(c=> clamp( c*f, 0, 255))
    return fromRGBA(newc)
}

// export function monoPallet(hue, count) {
    
//     repeatedly(count, (e,i)=>i)
// }