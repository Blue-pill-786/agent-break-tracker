import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Select from "react-select"

import { agents } from "../data/agents"
import { timeToMinutes, getESTMinutes } from "../utils/timeUtils"
import ShiftTimeline from "../components/ShiftTimeline"

import "../styles/dashboard.css"

export default function TeamDashboard(){

const [now,setNow] = useState(getESTMinutes())
const [selectedAgent,setSelectedAgent] = useState(null)

useEffect(()=>{

const timer=setInterval(()=>{
setNow(getESTMinutes())
},1000)

return ()=>clearInterval(timer)

},[])

/* ---------- dropdown ---------- */

const options = agents.map(a=>({
value:a.id,
label:a.name
}))

/* ---------- helpers ---------- */

function formatTime(minutes){

const h = String(Math.floor(minutes/60)).padStart(2,"0")
const m = String(minutes%60).padStart(2,"0")

return `${h}:${m}`

}

function getMinutesLeft(target){

let diff = target - now

if(diff < 0) diff += 1440

return diff

}

/* ---------- break detection ---------- */

function getCurrentBreak(agent){

const breakAM = timeToMinutes(agent.breakAM)
const lunch = timeToMinutes(agent.lunch)
const breakPM = timeToMinutes(agent.breakPM)

const breakDuration = 15
const lunchDuration = 30

if(now >= breakAM && now < breakAM + breakDuration){

return {
type:"Break AM",
end: breakAM + breakDuration
}

}

if(now >= lunch && now < lunch + lunchDuration){

return {
type:"Lunch",
end: lunch + lunchDuration
}

}

if(now >= breakPM && now < breakPM + breakDuration){

return {
type:"Break PM",
end: breakPM + breakDuration
}

}

return null

}

/* ---------- agents on break ---------- */

const agentsOnBreak = agents
.map(agent=>{

const currentBreak = getCurrentBreak(agent)

if(!currentBreak) return null

return{
name:agent.name,
type:currentBreak.type,
remaining:getMinutesLeft(currentBreak.end)
}

})
.filter(Boolean)

/* ---------- upcoming breaks ---------- */

function upcomingBreaks(minutes){

return agents
.map(agent=>{

const events=[

{type:"Break AM",time:timeToMinutes(agent.breakAM)},
{type:"Lunch",time:timeToMinutes(agent.lunch)},
{type:"Break PM",time:timeToMinutes(agent.breakPM)}

]

const next = events.find(e => e.time > now)

if(!next) return null

const diff = next.time - now

if(diff <= minutes){

return{
name:agent.name,
type:next.type
}

}

return null

})
.filter(Boolean)

}

const break15 = upcomingBreaks(15)
const break30 = upcomingBreaks(30)
const break60 = upcomingBreaks(60)

/* ---------- shift ending soon ---------- */

const shiftEndingSoon = agents
.map(agent=>{

const end = timeToMinutes(agent.shiftEnd)
const diff = end - now

if(diff > 0 && diff <= 60){

return{
name:agent.name,
time:agent.shiftEnd
}

}

return null

})
.filter(Boolean)

/* ---------- login soon ---------- */

const loginSoon = agents
.map(agent=>{

const start = timeToMinutes(agent.shiftStart)
const diff = start - now

if(diff > 0 && diff <= 60){

return{
name:agent.name,
time:agent.shiftStart
}

}

return null

})
.filter(Boolean)

/* ---------- coverage forecast ---------- */

function calculateCoverage(offset){

const future = now + offset

let working = 0

agents.forEach(agent=>{

const start = timeToMinutes(agent.shiftStart)
const end = timeToMinutes(agent.shiftEnd)

const breakAM = timeToMinutes(agent.breakAM)
const lunch = timeToMinutes(agent.lunch)
const breakPM = timeToMinutes(agent.breakPM)

const breakDuration = 15
const lunchDuration = 30

if(future < start || future >= end) return
if(future >= breakAM && future < breakAM + breakDuration) return
if(future >= lunch && future < lunch + lunchDuration) return
if(future >= breakPM && future < breakPM + breakDuration) return

working++

})

return working

}

const coverageNow = calculateCoverage(0)
const coverage15 = calculateCoverage(15)
const coverage30 = calculateCoverage(30)
const coverage60 = calculateCoverage(60)

function coverageColor(value){

if(value >= 10) return "#22c55e"
if(value >= 6) return "#f59e0b"
return "#ef4444"

}

/* ---------- UI ---------- */

return(

<div className="container">

<h1 className="title">Team Operations Dashboard</h1>

<p className="time">
Current ET Time: {formatTime(now)}
</p>

<Link to="/" className="nav-btn">
Agent Dashboard
</Link>

<Select
options={options}
placeholder="Select Agent"
onChange={(option)=>{

if(!option){
setSelectedAgent(null)
return
}

const agent = agents.find(a=>a.id===option.value)
setSelectedAgent(agent)

}}
/>

{selectedAgent && (

<Link
to={`/agent/${selectedAgent.id}`}
className="nav-btn"
style={{marginTop:"10px",display:"inline-block"}}
>
Open Agent Dashboard
</Link>

)}

{/* TIMELINE */}

<ShiftTimeline />

<div className="team-grid">

{/* COVERAGE FORECAST */}

<div className="team-section">

<h3>Coverage Forecast</h3>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:"12px"
}}>

<div className="team-card">
<div>Now</div>
<div style={{color:coverageColor(coverageNow)}}>
{coverageNow} agents
</div>
</div>

<div className="team-card">
<div>15 Minutes</div>
<div style={{color:coverageColor(coverage15)}}>
{coverage15} agents
</div>
</div>

<div className="team-card">
<div>30 Minutes</div>
<div style={{color:coverageColor(coverage30)}}>
{coverage30} agents
</div>
</div>

<div className="team-card">
<div>60 Minutes</div>
<div style={{color:coverageColor(coverage60)}}>
{coverage60} agents
</div>
</div>

</div>

</div>

{/* ACTIVE BREAKS */}

<div className="team-section">

<h3>Agents on Break / Lunch</h3>

{agentsOnBreak.length === 0 ?(

<p className="empty">None</p>

):(agentsOnBreak.map((a,i)=>(

<div key={i} className="team-card">

<div>
<strong>{a.name}</strong><br/>
{a.type}
</div>

<div>{a.remaining} min left</div>

</div>

)))}

</div>

{/* UPCOMING BREAKS */}

<div className="team-section">

<h3>Breaks in 15 Minutes</h3>

{break15.length === 0 ?(
<p className="empty">None</p>
):(break15.map((a,i)=>(

<div key={i} className="team-card">
<div>{a.name}</div>
<div>{a.type}</div>
</div>

)))}

</div>

<div className="team-section">

<h3>Breaks in 30 Minutes</h3>

{break30.length === 0 ?(
<p className="empty">None</p>
):(break30.map((a,i)=>(

<div key={i} className="team-card">
<div>{a.name}</div>
<div>{a.type}</div>
</div>

)))}

</div>

<div className="team-section">

<h3>Breaks in 60 Minutes</h3>

{break60.length === 0 ?(
<p className="empty">None</p>
):(break60.map((a,i)=>(

<div key={i} className="team-card">
<div>{a.name}</div>
<div>{a.type}</div>
</div>

)))}

</div>

{/* SHIFT ENDING */}

<div className="team-section">

<h3>Shift Ending Soon</h3>

{shiftEndingSoon.length === 0 ?(
<p className="empty">None</p>
):(shiftEndingSoon.map((a,i)=>(

<div key={i} className="team-card">
<div>{a.name}</div>
<div>{a.time}</div>
</div>

)))}

</div>

{/* LOGIN SOON */}

<div className="team-section">

<h3>Agents Logging In Soon</h3>

{loginSoon.length === 0 ?(
<p className="empty">None</p>
):(loginSoon.map((a,i)=>(

<div key={i} className="team-card">
<div>{a.name}</div>
<div>{a.time}</div>
</div>

)))}

</div>

</div>

</div>

)

}