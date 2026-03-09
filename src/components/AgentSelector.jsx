export default function AgentSelector({ agents, setAgent }) {

function handleChange(e){
  const index = e.target.value
  if(index === "") return
  setAgent(agents[index])
}

return (

<select onChange={handleChange} defaultValue="">

<option value="" disabled>
Select your name
</option>

{agents.map((agent,index)=>(
<option key={agent.id} value={index}>
{agent.name}
</option>
))}

</select>

)

}