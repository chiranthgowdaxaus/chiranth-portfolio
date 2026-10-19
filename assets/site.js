"use strict";
document.querySelectorAll(".copy-email").forEach(button=>{
  button.addEventListener("click",async()=>{
    const email="chiranthgowdaofficial@gmail.com";
    const status=document.getElementById("copy-status");
    try{
      await navigator.clipboard.writeText(email);
      button.textContent="Copied!";
      if(status)status.textContent="Email copied. Say hello anytime.";
      window.setTimeout(()=>{button.textContent="Copy email";if(status)status.textContent="";},3500);
    }catch{
      if(status)status.textContent="Select and copy the email address above.";
    }
  });
});
const header=document.querySelector(".site-header");
if(header){
  let ticking=false;
  const updateHeader=()=>{header.classList.toggle("is-scrolled",window.scrollY>8);ticking=false;};
  window.addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(updateHeader);}},{passive:true});
  updateHeader();
}
if(location.hostname!=="127.0.0.1"&&location.hostname!=="localhost"&&location.protocol==="https:"){
  const analytics=document.createElement("script");analytics.src="/_vercel/insights/script.js";analytics.defer=true;document.head.append(analytics);
}
