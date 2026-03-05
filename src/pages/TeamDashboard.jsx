import { useEffect, useState } from "react"
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

function minutesLeft(target){

let diff = target - now

if(diff < 0) diff += 1440

return diff

}

const onBreak = []
const next15 = []
const next30 = []
const next60 = []
const shiftEnding = []
const nextLogin = []

agents.forEach(agent=>{

const breakAM = timeToMinutes(agent.breakAM)
const lunch = timeToMinutes(agent.lunch)
const breakPM = timeToMinutes(agent.breakPM)
const shiftStart = timeToMinutes(agent.shiftStart)
const shiftEnd = timeToMinutes(agent.shiftEnd)

const breakDuration = 15
const lunchDuration = 30

// ---------- CURRENT BREAKS ----------

if(now >= breakAM && now < breakAM + breakDuration)
onBreak.push({name:agent.name,type:"Break AM"})

if(now >= lunch && now < lunch + lunchDuration)
onBreak.push({name:agent.name,type:"Lunch"})

if(now >= breakPM && now < breakPM + breakDuration)
onBreak.push({name:agent.name,type:"Break PM"})

// ---------- UPCOMING BREAKS ----------

const events = [
{label:"Break AM",time:breakAM},
{label:"Lunch",time:lunch},
{label:"Break PM",time:breakPM}
]

events.forEach(e=>{

const diff = minutesLeft(e.time)

if(diff > 0 && diff <= 15)
next15.push({name:agent.name,event:e.label,time:diff})

if(diff > 15 && diff <= 30)
next30.push({name:agent.name,event:e.label,time:diff})

if(diff > 30 && diff <= 60)
next60.push({name:agent.name,event:e.label,time:diff})

})

// ---------- SHIFT END ----------

const shiftLeft = minutesLeft(shiftEnd)

if(shiftLeft <= 60)
shiftEnding.push({name:agent.name,time:shiftLeft})

// ---------- NEXT LOGIN ----------

const loginLeft = minutesLeft(shiftStart)

if(loginLeft <= 60)
nextLogin.push({name:agent.name,time:loginLeft})

})

function Section({title,list}){

return(

<div className="team-section">

<h3>{title}</h3>

{list.length === 0 && <p className="empty">None</p>}

{list.map((a,i)=>(

<div key={i} className="team-card">
<strong>{a.name}</strong>
<span>{a.event || ""}</span>
<span>{a.time ? `${a.time} min` : ""}</span>
</div>
))}

</div>

)

}

return(

<div className="container">

<h1 className="title">Team Operations Dashboard</h1>

<p className="time">
Current ET Time: {Math.floor(now/60)}:{String(now%60).padStart(2,"0")}
</p>

<div className="team-grid">

<Section title="Agents on Break / Lunch" list={onBreak} />

<Section title="Breaks in 15 Minutes" list={next15} />

<Section title="Breaks in 30 Minutes" list={next30} />

<Section title="Breaks in 60 Minutes" list={next60} />

<Section title="Shift Ending Soon" list={shiftEnding} />

<Section title="Agents Logging In Soon" list={nextLogin} />

</div>

</div>

)

}
