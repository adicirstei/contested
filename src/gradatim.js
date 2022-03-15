import { defineSketch, newContext } from "./lib/sketch";
import { Random, parseCC, repeatedly, fract, grid, seq } from "./lib/extras";
import {identity, rotationAround, scaling, translation, transform} from "./lib/matrix"
import { mult } from "./lib/color";





const Palettes = {
    "Coffee":'https://coolors.co/92bfb1-f4ac45-694a38-a61c3c-dad6d6', 
    "Xiketic":"https://coolors.co/f2f3ae-edd382-fc9e4f-ff521b-020122",
    "Bittersweet":"https://coolors.co/db504a-ff6f59-254441-43aa8b-b2b09b",
    "Ming":"https://coolors.co/304751-3c787e-82b43f-c7ef00-cbcf10-ceaf1f-d56f3e-d0cd94-241623",
    Cinnabar:"https://coolors.co/5b2333-564d4a-f24333-ba1b1d-6290c3-70a300-ee964b-f95738-f7f4f3",
    Eggshell: "https://coolors.co/0d1321-1d2d44-3e5c76-748cab-fdca40-df2935-f0ebd8",
    Eggplant: "https://coolors.co/fe4a49-2ab7ca-fed766-436436-60495a-3f3244-420217-e6e6ea",
    "Rosu si negru": "https://coolors.co/07060f-960200-fbf8ee",
    "Madder": "https://coolors.co/5bc0eb-9bc53d-c3423f-789190-fde74c-54494b",


    "Eton": "https://coolors.co/3ab795-a0e8af-86baa1-ffcf56-1a535c-edead0",
    "Cultured": "https://coolors.co/0a090c-07393c-2c666e-90ddf0-228cdb-f0edee",
    "Ming": "https://coolors.co/07393c-2c666e-90ddf0-228cdb-f0edee-0a090c",
    "Khaki": "https://coolors.co/cc8b86-7d4f50-d1be9c-aa998f-3bceac-f9eae1",
    "Indigo": "https://coolors.co/987284-65afff-274060-5899e2-335c81-1b2845",
    "Crimson": "https://coolors.co/d72638-3f88c5-f49d37-792a31-f22b29-140f2d",


    "BW": "https://coolors.co/101010-3d3d3d-f5f5f5",
    "WB": "https://coolors.co/f5f5f5-b1aaaa-040304",
    "Facaba": "https://huemint.com/brand-intersection/#palette=033639-458885-ebc234-f4caba",
    "Fabe": "https://huemint.com/brand-intersection/#palette=d3460c-fabeb5-e9f633-10c2ae"
}
const palName = Random.FXRandomOption(Object.keys(Palettes))

const palette = parseCC(Palettes[palName])
const bgColor=palette.pop()
const aspect = 1//Random.FXRandomOption( [1, 16/9, 4/3]);
const mindim = Math.max(Math.min(window.innerHeight, window.innerWidth), 1024)
const pointSize = mindim/800;

const shBorder = mindim/100


const TargetType = {
    Circle: 1,
    Rect: 1,
    Ring:1,

}

const Style = {
    Serene: [0, 3],
    Ballanced: [3,5],
    Flurry: [6, 10]
}

const styleName = Random.FXRandomOption(Object.keys(Style)) 

const targetType = Random.FXRandomOption(Object.keys(TargetType))
console.log(targetType)
const FillStyle = {
    "Left Center": fillRectLC,
    Center: fillRectCC,
    "Top Left": fillRectLT, 
    "Shape": fillRectSh,
    "Square": fillRectSq,
    "Rect":fillRectRe
}

const width = mindim*aspect
const height = mindim
const rotCenter =a => rotationAround([width/2, height/2], a)
const factor = Random.int(50, 300)
const Deforms = {
    sinus: (x,y)=>[x + Math.sin(y/factor)*(factor/3), y],
    sphere: (x,y)=>{
        const dx = x - width/2 
        const dy = y - height/2 
        const d = Math.sqrt(dx*dx+dy*dy)/factor
        const f = Math.sin(d)/d
        return [x+f *factor, y+f*factor]},
    identity: (x,y) => [x,y],
    waves: (x,y) => {
        const dx = x - width/2 
        const dy = y - height/2 
        const r = Math.sqrt( dx*dx + dy+dy)
        const a = Math.atan2(dy,dx)+Math.PI
        const rr = Math.cos(a*12)* r* Random.float(0.04, 0.15)
        return [x+rr*Math.cos(a), y+rr* Math.sin(a)]
    },
    radio: (x,y) => {
        const dx = x - width/2 
        const dy = y - height/2 
        const r = Math.sqrt( dx*dx + dy+dy)
        // console.log(r)
        const fr = Math.abs( fract(r*0.01) - 0.5)
        // console.log(fr)
        // const a = Math.atan2(dy,dx) + fr
        const [rx,ry] = transform( rotCenter(fr*2), [x,y])
        return [rx,ry]
    },
    zigzag: (x,y) =>  [x + factor*Math.abs(fract(y/factor)-0.5), y ]
    

}
const deform = Random.FXRandomOption(Object.keys( Deforms))
const splitRatio = Random.float(0.1, 20)
const rectCount = Random.int(25, 200) 
const fillStyle = Random.FXRandomOption(Object.keys(FillStyle))


window.$fxhashFeatures = {
    Palette: palName,
    deform,
    "Composition" : styleName,
    "Initial Rect Count": rectCount,
    "Split Ratio": splitRatio, 
    "Fill Style": fillStyle
}

console.table(window.$fxhashFeatures)
console.log(fxhash)

const settings = {
    width: mindim*aspect,
    height:mindim,
    animate:true
}


class DrawingTarget {
    constructor(w,h, mat, cx,cy,path, fx=1, fy=1) {
        // const path = new Path2D()
        this.bg = newContext(w,h)
        this.fg = newContext(w,h)

        this.path = path
        // this.path.arc(cx,cy, r,0,2*Math.PI)
        // this.path.closePath()
        this.bg.translate(cx,cy)
        this.bg.scale(fx, fy)
        this.bg.translate(-cx,-cy)
        this.bg.clip(path, "evenodd")
        this.fg.clip(path, "evenodd")
        this.fg.setTransform(mat)
        this.tm = mat;
    }
    draw(cb) {
        cb(this.fg)
    }
    drawBg(cb) {
        cb(this.bg)
    }
}


function randomMatrix(cx,cy) {
    return Random.FXRandomOption([
        translation([cx,cy]).multiply(scaling([1.5, 1.5])),
        rotationAround([cx,cy],-Math.PI/2),
        rotationAround([cx,cy], Math.PI/4),
        rotationAround([cx,cy], Random.float(0,Math.PI*2)),
        rotationAround([cx,cy], Math.PI/2),
        translation([cx,cy]).multiply(scaling([0.8, 0.8]))
        ])
}

function randomTarget(w,h) {
    const r = 2 / Style[styleName][1]
    const p = new Path2D();
    const [pw, ph] = [r*w*Random.float(0.6, 0.9), r*h*Random.float(0.6,0.9)]
    const [cx, cy] = [Random.float(pw/2, w-pw/2), Random.float(ph/2, h-ph/2)]
    switch(targetType) {
        case "Circle": 
            p.arc(cx, cy, ph/2, 0, Math.PI*2)
            break;
        case "Rect":
            p.rect(cx - pw/2, cy - ph/2, pw,ph )
            break;
        default:
            p.arc(cx, cy, ph/2, 0, Math.PI*2)

    }
    // const p = randomPath(cx,cy, w,h)
    
    const sx =  (pw + shBorder*2) / pw    ///Random.float(1.03,1.07) 
    const sy = sx * pw/pw
    if (targetType==="Ring") {
        const pp = new Path2D()
        pp.arc(cx, cy, ph*0.3, 0, Math.PI*2)

        return [
            new DrawingTarget(w, h, randomMatrix(cx,cy), cx,cy, p, sx,sy),
            new DrawingTarget(w, h, identity, cx,cy, pp, sx, sy)
        ]
    } else return [new DrawingTarget(w, h, randomMatrix(cx,cy), cx,cy, p,sx,sy)]
}

const sketch = ({width, height, context:ctx}) => {

    const p1 = new Path2D();
    p1.rect(20,20,width-40, height-40)

    const p2 = new Path2D()
    p2.arc(width/2, height/2, mindim/4, 0, Math.PI*2)
    const p3 = new Path2D()
    p3.rect(width/8, height/8, width*0.1, height*0.1)



    const p4 = new Path2D()
    p4.arc(width/2, height/2, mindim/6, 0, Math.PI*2)

    const targets = [   
        new DrawingTarget(width, height, identity, width/2, height/2, p1, 1.1, 1.1),
        ...repeatedly(Random.int.apply(null, Style[styleName]), ()=> randomTarget(width,height) ).flatMap(x=>x)
    ]

    ctx.fillStyle = bgColor;

    ctx.fillRect(0,0,width, height)

    
    background(targets, width, height)
    
    
    
    const rectW = width*2 /rectCount
    const rectH = height 

    const rects = repeatedly(rectCount, (_,i)=> [ i*rectW -width/2, -rectH, rectW*0.9, rectH *3 ]  )

    
    for (let i = 0;i<rectCount*splitRatio;i++) {
        const idx = Random.int(0, rects.length)

        const [[rx,ry,rw,rh]] = rects.splice(idx, 1)
        const f = Random.float(0.3, 0.7)

        rects.push([rx,ry, rw, rh*f], [rx,ry+rh*f, rw, rh - rh*f] )
    }
   
    return () => {

        const [rx,ry,rw,rh] = rects.shift()
        
            FillStyle[fillStyle](targets, rx,ry,rw,rh)
        
        targets.forEach(({bg,fg})=> {
            ctx.drawImage(bg.canvas,0,0)
            ctx.drawImage(fg.canvas, 0,0)
        })
        if(rects.length === 0) {
            fxpreview()
            return {animate:false}
        }
    }
}


defineSketch(sketch, settings)


function fillRectCC(tgs, x,y, w, h) {
    const color = Random.FXRandomOption(palette)
    for (let i= 0;i<w*h;i++){
        const [px, py] = [x+w/2+Random.gauss()*w*0.5,y+h/2+ Random.gauss()*h*0.5]

        if(px<x || py<y || py>y+h || px>x + w) continue;
        const [dx,dy] = Deforms[deform](px,py)

        tgs.forEach(t=>t.draw((ctx)=> {
            ctx.fillStyle = color;
            ctx.fillRect(dx-pointSize/2, dy-pointSize/2, pointSize, pointSize)
        }))

    }
}
function fillRectLC(tgs, x,y, w, h) {
    const color = Random.FXRandomOption(palette)
    for (let i= 0;i<w*h;i++){
        const [px, py] = [x+Random.gauss()*w*0.5,y+h/2+ Random.gauss()*h*0.5]

        if(px<x || py<y || py>y+h || px>x + w) continue;
        const [dx,dy] = Deforms[deform](px,py)

        tgs.forEach(t=>t.draw((ctx)=> {
            ctx.fillStyle = color;
            ctx.fillRect(dx-pointSize/2, dy-pointSize/2, pointSize, pointSize)
        }))

    }
}
function fillRectLT(tgs, x,y, w, h) {
    const color = Random.FXRandomOption(palette)
    for (let i= 0;i<w*h;i++){
        const [px, py] = [x+Random.gauss()*w*0.5,y+ Random.gauss()*h*0.5]

        if(px<x || py<y || py>y+h || px>x + w) continue;
        const [dx,dy] = Deforms[deform](px,py)

        tgs.forEach(t=>t.draw((ctx)=> {
            ctx.fillStyle = color;
            ctx.fillRect(dx-pointSize/2, dy-pointSize/2, pointSize, pointSize)
        }))

    }
    // const [s,...r] = [[x+w, 0.98*(y+h)],[x+w, y+h], [x,y+h]]
    //             .map(([px,py])=> Deforms[deform](px,py) )

    // tgs.forEach(t=>t.draw((ctx)=> {
    //     ctx.fillStyle = color;
    //     ctx.beginPath()
        
    //     ctx.moveTo(s[0], s[1])
    //     r.forEach(([px,py])=>ctx.lineTo(px,py))
    //     ctx.closePath()
    //     ctx.fill()
    // }))


}


function fillRectSh(tgs, x,y, w, h) {
    const color = Random.FXRandomOption(palette)
    const step = mindim/Random.float(300, 800)
    const [s,...r] = [ ...grid(seq(x, x+w, step), [y]),
                        ...grid([x+w], seq(y, y+h, step)),
                    ...grid(seq(x+w, x, -step), [y+h]),
                    ...grid([x], seq(y+h, y, -step))  ]
                .map(([px,py])=> Deforms[deform](px,py) )

    tgs.forEach(t=>t.draw((ctx)=> {
        ctx.fillStyle = color;
        ctx.beginPath()
        
        ctx.moveTo(s[0], s[1])
        r.forEach(([px,py])=>ctx.lineTo(px,py))
        ctx.closePath()
        ctx.fill()
    }))


}
function fillRectSq(tgs, x,y, w, h) {
    const color = Random.FXRandomOption(palette)
    const step = w/Random.float(5, 20)
    const sz = w /(step + 3)
    const points =grid(seq(x+sz/2, x+w -sz/2, step), seq(y+sz/2, y+h -sz/2, step))
                        
                .map(([px,py])=> Deforms[deform](px,py) )

    tgs.forEach(t=>t.draw((ctx)=> {
        ctx.fillStyle = color;


        points.forEach(([px,py])=>ctx.fillRect(px,py, sz,sz))

    }))
}
function fillRectRe(tgs, x,y, w, h) {
    const color = Random.FXRandomOption(palette)
    const stepx = w/Random.float(5, 8)
    const stepy = stepx*4
    const sz = w /(stepx + 3)
    const points =grid(seq(x+sz/2, x+w -sz/2, stepx), seq(y+2*sz, y+h -2*sz, stepy))
                        
                .map(([px,py])=> Deforms[deform](px,py) )

    tgs.forEach(t=>t.draw((ctx)=> {
        ctx.fillStyle = color;


        points.forEach(([px,py])=>ctx.fillRect(px,py, sz,sz*4))

    }))
}

function background(tgs, w,h) {
    const color = mult( bgColor, Random.float(0.9, 1.08))


    tgs.forEach(t=>t.drawBg((ctx)=> {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0,0,w,h)
        ctx.strokeStyle = color;
        for(let i=0;i<w*h*0.02;i++) {
            const [x,y] = [Random.float(0,w), Random.float(0,h)]
            ctx.beginPath()
            ctx.moveTo(x,y)
            ctx.lineTo(x+Random.int(5,10), y+Random.int(5, 15))
            ctx.stroke()
        }
    }))
}