import { CircularProgressbar } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

export default function CircularTimer({title,time,progress}){

const color = progress === 100 ? "#9ca3af" : "#4f46e5"

return(

<div style={{
width:"90px",
maxWidth:"30vw",
textAlign:"center"
}}>

<CircularProgressbar
value={progress}
text={time}
styles={{
path:{ stroke: color },
trail:{ stroke:"#e2e8f0" },
text:{ fill:"#0f172a", fontSize:"11px" }
}}
/>

<p style={{
marginTop:"6px",
fontWeight:"600",
fontSize:"13px"
}}>
{title}
</p>

</div>

)

}