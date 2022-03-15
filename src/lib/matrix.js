const {sin, cos} = Math


export const rotation = (theta) => {
    const ct = cos(theta)
    const st = sin(theta)
    return new DOMMatrix([ct, st, -st, ct, 0, 0])}

export const translation = ([x,y]) => new DOMMatrix([1,0,0,1,x,y])
export const identity = new DOMMatrix([1,0,0,1,0,0]) 
export const rotationAround = (p, theta) => translation(p).multiply(rotation(theta)).multiply(translation([-p[0], -p[1]]))
    
export const scaling = ([x,y]) => new DOMMatrix([x,0,0,y,0,0])
export const skewing = ([x,y]) => new DOMMatrix([1,x,y,1,0,0])

export const mirrorOnXAxis = scaling([1,-1])

export const mirrorOnYAxis = scaling([-1,1])

export const mirrorOnAngle = (ang) => rotation(ang).multiply(mirrorOnXAxis).multiply(rotation(-ang))

export const transform = ({a,b,c,d,e,f}, [x,y]) => [ a * x + c * y + e, b * x + d * y + f ] 