import {defineSketch} from './lib/sketch'
import {rand_nth, repeatedly, random, randInt} from './lib/extras'

import clamp from 'clamp'


const colors = {
    "4 mouse group": ["#fefefe", "#2486C8","#EF4136","#FBB040","#00A79D"],
    "circo medio oriente": ["#ffffff","#FF541C","#72B9CD","#E7C233","#E59D2F","#C37827"],
    "Face off": ["#fefefe", "#541123","#75374E","#F5C851","#1C3D72","#00245E"],
    "flor nocturna": ["#ffffff", "#E84121","#79A6B9","#668BA5","#2F3C5F","#202634"],
    "kundu": ["#fdfdfd", "#BB9E52","#BF9D63","#96691C","#E2940F","#665230"],
    "Night": ["#fcfcfc","#FFC527","#CF5D16","#404D5D","#273447","#000000"],
    "Antidesign": ["#ffffff", "#413D3D","#040004","#C8FF00","#FA023C","#4B000F"]
    }
    
    

// Grid [[Cells]] => [Rects] => Lattice

const CellSize = {
    XS: 64,
    S: 48,
    M: 32,
    L: 24,
    XL: 8
}

const Explosion = {
    Low: [3, 4, 5],
    Medium: [7,8,9],
    High: [20,12,16]
}

const Symmetry = {
    Horizontal: 1,
    Vertical: 2,

}

const CellAspect = {
    Square: 1,
    Wide: 0.5,
    UltraWide: 0.25,
    Tall: 2,
    UltraTall: 4
}

const Displacement = {
    Identity: a => a,
    SineY: ([x,y]) => [x, y + 0.2*Math.sin(2*x)],
    SineX: ([x,y]) => [x+Math.sin(y)*0.3, y],
    Concave: ([x,y])=> [x,Math.PI+ (y-Math.PI) * (1.2/8* Math.abs (x-Math.PI) + 1.2)],
    Convex: ([x,y])=> [x,Math.PI + (Math.PI-y) * (1.2/8* Math.abs (x-Math.PI) - 1.2)],
    Mixed: ([x,y]) => {
        if(y<Math.PI) {
            return [x,Math.PI + (Math.PI-y) * (1.2/8* Math.abs (x-Math.PI) - 1.2)]
            
        } else {
            return  [x,Math.PI+ (y-Math.PI) * (1.2/8* Math.abs (x-Math.PI) + 1.2)]
        }
    },
    Tilt: ([x,y]) => {
        const a = -0.1
        return [Math.PI + (x-Math.PI)*Math.cos(a)-(y-Math.PI)*Math.sin(a), Math.PI+(y-Math.PI)*Math.cos(a) + (x-Math.PI)*Math.sin(a)]
    }
}

const FillStyle = {
    "Random" : fillRandom,
    "Random Walk": fillRandomWalk,
    "Ns": fillNs
}
const Texture = {
    Lattice:1,
    Wires:2
}

window.$fxhashFeatures = {
    "Cell Size": rand_nth( Object.keys(CellSize)),
    "Texture": rand_nth(Object.keys(Texture)),
    "Fill Style": rand_nth(Object.keys(FillStyle)), 
    "Cell Aspect": rand_nth(Object.keys(CellAspect)),
    Displacement: rand_nth(Object.keys(Displacement)),
    Palette: rand_nth(Object.keys(colors)),
    "Explosion Count": rand_nth(Object.keys(Explosion))
}

const nodes = 50




const settings = {
    width: 1024,
    height: 1024,
    animate: true
}

const [gw, gh] = [2*Math.PI, 2*Math.PI]
const aspect = CellAspect[window.$fxhashFeatures["Cell Aspect"]]
const cellsX =  (aspect < 1 ? CellSize[window.$fxhashFeatures["Cell Size"]]*aspect : CellSize[window.$fxhashFeatures["Cell Size"]])
const cellsY = cellsX / aspect
const cellDim = [gw/cellsX, gh/cellsY]

defineSketch(({context, width, height})=>{
    console.log(window.$fxhashFeatures)
    const [bg, ...palette] = colors[window.$fxhashFeatures.Palette]
    const displace = Displacement[window.$fxhashFeatures.Displacement]
    
    const fill = FillStyle[window.$fxhashFeatures["Fill Style"]]
    const grid = repeatedly(cellsX*cellsY, (e,i)=> i)

    const rects = fill(grid, cellsX)
    const scale = 0.96 * width / gw;
    const bounds = [0,0,0.96 * width , 0.96 * height ]
    const border = 0.02 * width;
    const tex = Texture[window.$fxhashFeatures.Texture]
    const explosions = rand_nth(Explosion[window.$fxhashFeatures["Explosion Count"]])


    function line([x1,y1], [x2,y2]) {
        if (x1<bounds[0] || x1>bounds[2] || y1<bounds[1] || y1 > bounds[3]) return;
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
    }

    explode(rects, explosions)

    context.fillStyle = bg
    context.fillRect(0,0,width, height)
    // context.strokeStyle = "black"
    context.lineWidth = tex*width / 1000;
    context.translate(border, border)
    
    // context.rect(40,40, 300, 300)
    // context.stroke()
    return (props) => {
        const rect = rects.shift()
        // context.strokeStyle="red"
        // context.beginPath()
        // context.rect(rect.bounds[0]*scale,rect.bounds[1]*scale, scale*(rect.bounds[2]-rect.bounds[0]), scale*(rect.bounds[3]-rect.bounds[1]))
        // context.stroke()
        context.strokeStyle = rand_nth(palette)
        context.beginPath()
        rect.lattice.forEach((row, ri) => {
            const nextR = rect.lattice[ri+1]
            row.forEach((p, ci)=> {
                const nextC = row[ci+1]
                const [x,y] = displace(p)
                let ncp,nrp,nrp1
                if(nextC && nextR) {
                    ncp = displace(nextC)
                    nrp = displace(nextR[ci])
                    nrp1 = displace(nextR[ci+1])
                    
                    line([x*scale, y *scale], [ncp[0]*scale, ncp[1]*scale])
                    if (tex ===1){
                    line([x*scale, y *scale], [nrp[0]*scale, nrp[1]*scale])
                    line([x*scale, y *scale], [nrp1[0]*scale, nrp1[1]*scale])}
                    return;
                }
                if(nextC) {
                    ncp = displace(nextC)
                    line([x*scale, y *scale], [ncp[0]*scale, ncp[1]*scale])
                    return;
                }
                if(nextR) {
                    nrp = displace(nextR[ci])
                    if (tex ===1) line([x*scale, y *scale], [nrp[0]*scale, nrp[1]*scale])
                    return;
                }
            })
        })
        context.stroke()
        const animate = (rects.length > 0)


        return {...props, animate}
    }
}, settings)

function dist([x1,y1], [x2,y2]) {
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2)
}

function vdif([ax,ay], [bx,by] ) {
    return [ax-bx, ay-by]
}
function vmult([x,y], n) {
    return [x*n, y*n]
}

function vadd([ax,ay], [bx,by] ) {
    return [ax+bx, ay+by]
}

function vnorm([x,y]) {
    const l = Math.sqrt(x**2 + y**2)
    return vmult([x,y], 1/l)
}


function explode(rects, n) {
    for (let i=0;i<n;i++) {
        const exp = [random(0, gw), random(0, gh)]
        rects.forEach((r) => {
            r.lattice.forEach((row) => {
                row.forEach((point) => {
                    const d = dist(exp, point)
 
                    const f = 1- Math.tanh (d*5)**2
                    const [x,y] = vadd( vmult(vnorm(  vdif(point, exp)),f/5), point)
                    point[0] = clamp(x, r.bounds[0], r.bounds[2])
                    point[1] = clamp(y, r.bounds[1], r.bounds[3])
                
                })
            })
        })
    }
}


function fillRandom (grid, sz){
    const rects = []
    // const sz = CellSize[window.$fxhashFeatures["Cell Size"]]
    const dirs = {R: 1, L:-1, T: -sz, B: sz} //     [1, -1, -sz, sz]
    
    let cell
    while(grid.length >0) {
        cell = rand_nth(grid)
        const dirK = rand_nth(Object.keys(dirs))
        const dir = dirs[dirK]
        let rect = growRect({}, cell, sz, dirK)
        grid.splice(grid.indexOf(cell), 1)
        while(canGrow(grid, sz, cell, dir)){
            cell = cell+dir
            rect = growRect(rect, cell, sz, dirK)
            grid.splice(grid.indexOf(cell), 1)
        }
        rects.push(rect)
    }
    
    return rects
}


function fillRandomWalk (grid,sz) {
    const rects = []
    // const sz = CellSize[window.$fxhashFeatures["Cell Size"]]
    const dirs = {R: 1, L:-1, T: -sz, B: sz} //     [1, -1, -sz, sz]
    let cell
    while(grid.length >0) {
        if (cell) {cell = rand_nth(grid.sort((a,b)=>a-b))}
        else {cell = rand_nth(grid)}
        const dirK = rand_nth(Object.keys(dirs))
        const dir = dirs[dirK]
        let rect = growRect({}, cell, sz, dirK)
        grid.splice(grid.indexOf(cell), 1)
        while(canGrow(grid, sz, cell, dir)){
            cell = cell+dir
            rect = growRect(rect, cell, sz, dirK)
            grid.splice(grid.indexOf(cell), 1)
        }
        rects.push(rect)
    }
    
    return rects
}

function fillNs(grid, sz) {
    const rects = []
    // const sz = CellSize[window.$fxhashFeatures["Cell Size"]]
    const dirs = {R: 1, B: sz} //     [1, -1, -sz, sz]
    let rectSize = 1+randInt(8)
    let cell
    while(grid.length >0) {
        
        const dirK = rand_nth(Object.keys(dirs))
        const dirStep = dirs[dirK]
        const steps = repeatedly(rectSize-1, (e,i)=> i*dirStep)
        const fits = (c) => steps.reduce((pv, cv) => pv && canGrow ( grid, sz, c+cv, dirStep), true)
        const cands = grid.filter(fits)
        cell =rand_nth( cands)

        if(cell != null) {
            let rect = {}
            for (let k = 0;k<rectSize;k++){
                rect = growRect(rect, cell, sz, dirK)
                grid.splice(grid.indexOf(cell), 1)
                cell = cell+dirs[dirK]
            }

            rects.push(rect)
        } else {
            rectSize--;
        }
    }
    
    return rects
}

function growRect(r, cell, sz, dirK) {
    const cells = r.cells || []
    let bounds = r.bounds || [Infinity, Infinity, -Infinity, -Infinity]
    cells.push(cell)
    const [w,h] = cellDim
    const [cx, cy] = [cell % sz, Math.floor(cell/sz)]
    const [sx,sy,ex,ey] = [cx*w,cy*h,(cx+1)*w, (cy+1)*h]
    bounds = [Math.min(bounds[0], sx), Math.min(bounds[1], sy), Math.max(bounds[2], ex), Math.max(bounds[3], ey)]
    const [nx,ny] = [nodes*w, nodes*h]
    const lattice =  combineLatices((r.lattice || []), newLattice(sx,sy,ex,ey, nx, ny), dirK)
    return {...r, cells, lattice, bounds}
}

function newLattice(sx,sy,ex,ey,nx,ny) {
    const [dx, dy] = [(ex-sx)/nx, (ey-sy)/ny]
    const lat = repeatedly(ny, (e,j)=> repeatedly(nx, (v,i)=> [sx+i*dx + random(-0.1, 0.1)*dx, dy* random(-0.1, 0.1) + sy+j*dy] ))
    return lat
}



function canGrow(grid, sz, cell, dir) {
    let [r,c] = [Math.floor(cell/sz), cell % sz] 
    let next = cell+dir
    let [rn,cn] = [Math.floor((next)/sz), (next) % sz] 
    return (r===rn || c===cn) && grid.includes(next)
    
}

function combineLatices(l1,l2, dirK) {
    switch (dirK) {
        case "B": return l1.concat(l2)
        case "T": return l2.concat(l1)
        case "L": return (l1.length === 0 ? [...l2] : l2.map((l,i) => l.concat(l1[i])))
        case "R": return (l1.length === 0 ? [...l2] : l1.map((l,i) => l.concat(l2[i])))
    }
} 