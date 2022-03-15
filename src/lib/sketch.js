let animReq 
let cvs
export function defineSketch(sketch, settings) {
    const {resize} = settings

    if(!cvs) {
        cvs = document.createElement('canvas')
        document.body.prepend(cvs)
    } else {
        clearAnimReq()
    }

    if (typeof (resize) === 'function') {
        window.onresize = () => {
            console.log("Window resized")

            const {width,height} = resize()
            clearAnimReq()
            start(cvs, sketch, {...settings, width, height})
        }
    }

    start(cvs, sketch, settings)

}
function clearAnimReq() {
    window.cancelAnimationFrame(animReq)
}

function start(cvs, sketch, settings) {
    const {width, height, animate} = settings

    cvs.width = width;
    cvs.height = height;


    const context = cvs.getContext("2d")
    
    const initialProps = {...settings, context, canvas: cvs}
    const renderFn = sketch( initialProps)
    let frame = 0;
    let time = 0
    const startTime = new Date()
    const rafCb = (timestamp) => {
        const renderProps = {...initialProps, frame, time, timestamp}
        const {animate} = { ...renderProps, ...renderFn(renderProps)}

        frame++
        time = (new Date()) - startTime
        if (animate) animReq=window.requestAnimationFrame(rafCb)
    }

    if (animate) {
        animReq=window.requestAnimationFrame(rafCb)
    } else {
        renderFn(initialProps)
    }
    


}



export function newContext(w,h) {
    const c = document.createElement("canvas")
    c.width=w
    c.height=h
    return c.getContext("2d")
}
