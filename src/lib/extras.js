import  * as FXH from "@liamegan1/fxhash-helpers"
FXH.FXInit(fxrand)

export const Random = {
    float: (min, max) => {
        if (min === undefined) return FXH.FXRandomBetween(0,1)
        if (max === undefined) return FXH.FXRandomBetween(0,min)
        return FXH.FXRandomBetween(min, max)
    },
    int: (min, max)=> {
                    if (max === undefined) {
                        max = min
                        min = 0 
                    }
                    return FXH.FXRandomIntBetween(min, max)
                },
    bool: FXH.FXRandomBool,
    reset: () => {
        window.fxrand = sfc32(...hashes)
        FXH.FXInit(window.fxrand)
    },
    gauss:() => fxrand() + fxrand() + fxrand() + fxrand() -2.0,
    ...FXH
}

export function deg2rad(degrees) {
    return (degrees * Math.PI / 180);
}

export const random = FXH.FXRandomBetween

export const brand = FXH.FXRandomBool

export function inBounds({l, t, r, b}, [x,y]) {
  return (x<=r) && (x>=l) && (y>=t) && (y<=b)
}
const vals = []


export function norm(v, start1, stop1, start2, stop2) {
  return (v - start1) / (stop1 - start1) * (stop2 - start2) + start2
}


export const rand_nth = FXH.FXRandomOption

// export function rand_nth(arr) {
//     return arr[Math.floor(fxrand() * arr.length)];
// }

export function rProb(p, a, b){
  if(fxrand()<p) return a
  else return b
}

export function randInt(n) {
    return Math.floor(fxrand() * n);
}
export function repeatedly (n, fn) {
    return Array.from({length: n}, fn);
}


export function range(start, end, step) {
  step = step || 1
  return repeatedly((end-start)/step, (e,i) => start+i*step)

}

export function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(fxrand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled
}

/**
 * Creates a sequence of numbers between `start` and `end` by `step` increments.
 * @param {number} start - Start value (included)
 * @param {number} end - End value (might not be oncluded, depending of step value)
 * @param {number} step 
 * @returns {[number]} 
 */
export function seq(start, end, step=1) {
    let vals = (end - start)/step + 1 
    // if (start + vals*step > end ) vals -=1;
    return repeatedly(vals, (_,i)=> start + i*step)
}


export function grid(seq1, seq2=seq1) {
    const r = []

    for (let i=0;i<seq1.length;i++) 
    for(let j = 0;j<seq2.length;j++)
    r.push([seq1[i], seq2[j]])
    return r;
}

export function fract(n) {
  return n - Math.floor(n)
}


export function random_but(arr, v1,v2) {
  if (arr.length <=1) return null;
  let r
  do {
    r = rand_nth(arr)
  } while(r === v1 || r === v2)
  return r;
}

export function distance(a, b) {
  var dx = a.x-b.x;
  var dy = a.y-b.y;
  return dx*dx + dy*dy;
}

/**
 * Parse a coolors.co palette url
 * 
 * @param {string} url - The palette url to be parsed
 * @returns {string} Return a css color string in format #rrggbb.
 */
 export function parseCC(url) {
  const palRx = /(?:[0-9a-z]{6}[-$])+/i



  return url.substring(url.search(palRx))
      .split("-")
      .map(c=>"#" + c)
}