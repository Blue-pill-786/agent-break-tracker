import { CircularProgressbar } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

export default function CircularTimer({title,time,progress,color}){

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
path:{ stroke: color || "#4f46e5" },
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