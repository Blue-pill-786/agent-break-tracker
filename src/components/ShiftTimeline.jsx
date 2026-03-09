import { agents } from "../data/agents"
import { timeToMinutes } from "../utils/timeUtils"

export default function ShiftTimeline({ currentTime }){

function getPosition(time){
return (time/(24*60))*100
}

function getWidth(start,end){
return ((end-start)/(24*60))*100
}

const nowPosition = getPosition(currentTime)

return(

<div style={{marginTop:"40px"}}>

<h2 style={{marginBottom:"15px"}}>Live Shift Timeline</h2>

<div style={{
border:"1px solid #e5e7eb",
borderRadius:"8px",
padding:"20px",
background:"#ffffff",
position:"relative"
}}>

{/* current time line */}

<div style={{
position:"absolute",
left:`${nowPosition}%`,
top:"0",
bottom:"0",
width:"2px",
background:"#ef4444",
zIndex:10
}}/>

{agents.map(agent=>{

const start = timeToMinutes(agent.shiftStart)
const end = timeToMinutes(agent.shiftEnd)

const breakAM = timeToMinutes(agent.breakAM)
const lunch = timeToMinutes(agent.lunch)
const breakPM = timeToMinutes(agent.breakPM)

const breakDuration = 15
const lunchDuration = 30

const left = getPosition(start)
const width = getWidth(start,end)

return(

<div key={agent.id} style={{marginBottom:"18px"}}>

<div style={{
fontSize:"13px",
marginBottom:"4px",
fontWeight:"600"
}}>
{agent.name}
</div>

<div style={{
position:"relative",
height:"16px",
background:"#e5e7eb",
borderRadius:"4px"
}}>

{/* shift bar */}

<div style={{
position:"absolute",
left:`${left}%`,
width:`${width}%`,
height:"100%",
background:"#4f46e5",
borderRadius:"4px"
}}/>

{/* AM break */}

<div style={{
position:"absolute",
left:`${getPosition(breakAM)}%`,
width:`${getWidth(breakAM,breakAM+breakDuration)}%`,
height:"100%",
background:"#f59e0b"
}}/>

{/* lunch */}

<div style={{
position:"absolute",
left:`${getPosition(lunch)}%`,
width:`${getWidth(lunch,lunch+lunchDuration)}%`,
height:"100%",
background:"#ef4444"
}}/>

{/* PM break */}

<div style={{
position:"absolute",
left:`${getPosition(breakPM)}%`,
width:`${getWidth(breakPM,breakPM+breakDuration)}%`,
height:"100%",
background:"#f59e0b"
}}/>

</div>

</div>

)

})}

</div>

</div>

)

}