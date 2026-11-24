(() => {
  const $ = (id) => document.getElementById(id);
  const steps = [
    {label:"روبه‌رو به دوربین نگاه کنید",arrow:"↑",transform:"translateY(0)"},
    {label:"آرام به سمت چپ بچرخید",arrow:"←",transform:"translateX(-8px) rotate(-7deg)"},
    {label:"آرام به سمت راست بچرخید",arrow:"→",transform:"translateX(8px) rotate(7deg)"},
    {label:"کمی به سمت بالا نگاه کنید",arrow:"↑",transform:"translateY(-8px)"},
    {label:"کمی به سمت پایین نگاه کنید",arrow:"↓",transform:"translateY(8px)"}
  ];
  let step = 0, selectedFile = null, previewUrl = null;
  // حساب آزمایشی را از همین دو مقدار تغییر دهید.
  const DEMO_USERNAME = "demo-user";
  const DEMO_PASSWORD = "demo-1234";
  $("loginForm").addEventListener("submit", event => {
    event.preventDefault();
    const valid = $("username").value.trim() === DEMO_USERNAME && $("password").value === DEMO_PASSWORD;
    $("loginError").hidden = valid;
    if (valid) { $("loginScreen").hidden = true; $("appShell").hidden = false; window.scrollTo(0,0); }
  });
  const renderStep = () => {
    $("guideCount").textContent = (step+1).toLocaleString("fa-IR")+" از ۵";
    $("guideProgress").style.width = ((step+1)*20)+"%";
    $("faceCaption").textContent = steps[step].label;
    $("directionArrow").textContent = steps[step].arrow;
    $("faceArt").style.transform = steps[step].transform;
    document.querySelectorAll(".instruction").forEach((el,i)=>{
      el.classList.toggle("active",i===step); el.classList.toggle("done",i<step);
      el.querySelector("i").textContent = i<step ? "✓" : i===step ? "●" : "○";
    });
    $("prevStep").disabled = step===0;
    $("prevStep").style.opacity = step===0 ? ".4" : "1";
    $("nextStep").innerHTML = step===4 ? "مرور دوباره <span>↻</span>" : "مرحله بعد <span>←</span>";
  };
  // The SVG is intentionally decorative; the guide never claims to detect real head movement.
  $("faceArt").id = "faceArt";
  $("nextStep").addEventListener("click",()=>{step=step===4?0:step+1;renderStep()});
  $("prevStep").addEventListener("click",()=>{step=Math.max(0,step-1);renderStep()});
  document.querySelectorAll(".instruction").forEach(el=>el.addEventListener("click",()=>{step=Number(el.dataset.step);renderStep()}));
  const formatSize = n => n<1024*1024 ? (n/1024).toFixed(0)+" کیلوبایت" : (n/1024/1024).toFixed(1)+" مگابایت";
  const showError = msg => { $("fileError").textContent=msg; $("fileError").hidden=false; };
  const clearError = () => { $("fileError").hidden=true; $("fileError").textContent=""; };
  const clearFile = () => {
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl=null; selectedFile=null; $("videoInput").value="";
    $("selectedFile").hidden=true; $("dropZone").hidden=false; $("submitButton").disabled=true;
    $("videoPreview").removeAttribute("src"); $("videoPreview").load(); clearError();
  };
  const chooseFile = file => {
    clearError();
    if(!file) return;
    const valid = ["video/mp4","video/quicktime","video/webm"].includes(file.type) || /\.(mp4|mov|webm)$/i.test(file.name);
    if(!valid){showError("فرمت فایل پشتیبانی نمی‌شود. لطفاً ویدئوی MP4، MOV یا WEBM انتخاب کنید.");return}
    if(file.size>100*1024*1024){showError("حجم ویدئو بیشتر از ۱۰۰ مگابایت است.");return}
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    selectedFile=file; previewUrl=URL.createObjectURL(file);
    $("videoPreview").src=previewUrl;
    $("fileName").textContent=file.name;
    $("fileMeta").textContent=formatSize(file.size)+" · فایل انتخاب‌شده روی همین دستگاه";
    $("dropZone").hidden=true; $("selectedFile").hidden=false; $("submitButton").disabled=false;
  };
  $("dropZone").addEventListener("click",()=>$("videoInput").click());
  $("dropZone").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();$("videoInput").click()}});
  $("videoInput").addEventListener("change",e=>chooseFile(e.target.files[0]));
  $("removeFile").addEventListener("click",clearFile);
  ["dragenter","dragover"].forEach(ev=>$("dropZone").addEventListener(ev,e=>{e.preventDefault();$("dropZone").classList.add("dragging")}));
  ["dragleave","drop"].forEach(ev=>$("dropZone").addEventListener(ev,e=>{e.preventDefault();$("dropZone").classList.remove("dragging")}));
  $("dropZone").addEventListener("drop",e=>chooseFile(e.dataTransfer.files[0]));
  $("submitButton").addEventListener("click",()=>{
    if(!selectedFile)return;
    $("appShell").hidden = true;
    $("reviewScreen").hidden = false;
    window.scrollTo({top:0,behavior:"smooth"});
  });
  $("backToStart").addEventListener("click",()=>{ $("reviewScreen").hidden=true; $("appShell").hidden=false; window.scrollTo({top:0,behavior:"smooth"}); });
  if("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }
  renderStep();
})();