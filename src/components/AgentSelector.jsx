export default function AgentSelector({agents,setAgent}){

return(

<select onChange={(e)=>setAgent(agents[e.target.value])}>

<option>Select your name</option>

{agents.map((agent,index)=>(
<option key={index} value={index}>
{agent.name}
</option>
))}

</select>

)

}