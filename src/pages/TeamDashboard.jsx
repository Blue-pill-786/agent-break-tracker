import { useState, useEffect } from "react"

import { agents } from "../data/agents"
import { timeToMinutes, getESTMinutes } from "../utils/timeUtils"

import "../styles/dashboard.css"

export default function TeamDashboard(){

const [now,setNow] = useState(getESTMinutes())

useEffect(()=>{

const timer = setInterval(()=>{
setNow(getESTMinutes())
},1000)

return ()=>clearInterval(timer)

},[])

/* ---------- helpers ---------- */

function formatTime(minutes){

const h = String(Math.floor(minutes/60)).padStart(2,"0")
const m = String(minutes%60).padStart(2,"0")

return `${h}:${m}`

}

function getMinutesLeft(target){

const diff = target - now

if(diff <= 0) return 0

return diff

}

/* ---------- current break detection ---------- */

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
type:next.type,
time:next.time
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

/* ---------- agents logging in soon ---------- */

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

function calculateCoverage(offsetMinutes){

const future = now + offsetMinutes

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

if(value >= 10) return "green"
if(value >= 6) return "orange"
return "red"

}

/* ---------- UI ---------- */

return(

<div className="container">

<h1 className="title">Team Operations Dashboard</h1>

<p className="time">
Current ET Time: {formatTime(now)}
</p>

<div className="team-grid">

{/* ACTIVE BREAKS */}

<div className="team-section">

<h3>Agents on Break / Lunch</h3>

{agentsOnBreak.length === 0 ?(

<p className="empty">None</p>

):(agentsOnBreak.map((a,i)=>(

<div key={i} className="team-card">

<div>

<strong>{a.name}</strong> <br/>
{a.type}

</div>

<div>

{a.remaining} min left

</div>

</div>

)))}

</div>

{/* BREAKS 15 */}

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

{/* BREAKS 30 */}

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

{/* BREAKS 60 */}

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

{/* COVERAGE FORECAST */}

<div className="team-section">

<h3>Coverage Forecast</h3>

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

</div>

)

}
