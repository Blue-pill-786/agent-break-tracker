export function timeToMinutes(time) {

const [h,m] = time.split(":").map(Number)
return h*60 + m

}

export function getESTMinutes(){

const estTime = new Date().toLocaleString("en-US",{
timeZone:"America/New_York"
})

const date = new Date(estTime)

return date.getHours()*60 + date.getMinutes()

}