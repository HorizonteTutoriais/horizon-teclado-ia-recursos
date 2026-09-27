(()=>{
  const $=s=>document.querySelector(s);
  const floating=$('#floating'),sheet=$('#sheet'),close=$('#close');
  const main=$('#screenMain'),yt=$('#screenYoutube'),audio=$('#audio');
  const play=$('#play'),mainPlay=$('#mainPlay'),progress=$('#progress');
  const current=$('#current'),duration=$('#duration'),bridge=window.AndroidBridge;
  let down=0,dragging=false,dragMoved=false,dragExpanded=false;
  let startX=0,startY=0,startLeft=40,startTop=120;
  let localTouchX=0,localTouchY=0,lastScreenX=0,lastScreenY=0;
  let nativeLeft=40,nativeTop=120,suppressClick=false;
  window.userWidgetOpen=false;window.widgetExpanded=false;window.popupOwnsExpansion=false;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const maxX=()=>Math.max(0,(innerWidth||screen.width)-54);
  const maxY=()=>Math.max(0,(innerHeight||screen.height)-54);
  const widgetHalf=27;
  const touchX=t=>dragExpanded?t.clientX:nativeLeft+t.clientX;
  const touchY=t=>dragExpanded?t.clientY:nativeTop+t.clientY;
  const resetFloatingCss=()=>{floating.style.left='0px';floating.style.top='0px'};
  const collapseAtPosition=()=>{
    resetFloatingCss();
    if(bridge&&typeof bridge.collapseWidgetAt==='function')
      bridge.collapseWidgetAt(Math.round(nativeLeft),Math.round(nativeTop));
    else if(bridge&&typeof bridge.collapseWidget==='function')bridge.collapseWidget();
  };
  window.setNativeWidgetPosition=(x,y)=>{const nx=Number(x),ny=Number(y);if(Number.isFinite(nx))nativeLeft=nx;if(Number.isFinite(ny))nativeTop=ny;};
  window.getWidgetPosition=()=>({left:nativeLeft,top:nativeTop});
  window.collapseWidgetAtPosition=collapseAtPosition;
  const expandForDrag=()=>{
    if(dragExpanded)return;
    dragExpanded=true;
    if(bridge&&typeof bridge.expandWidget==='function')bridge.expandWidget();
    floating.style.left=Math.round(startLeft)+'px';
    floating.style.top=Math.round(startTop)+'px';
  };
  const finishDrag=(touch,cancelled=false)=>{
    if(!dragging)return;
    dragging=false;
    if(dragMoved){
      if(touch&&dragExpanded){lastScreenX=touchX(touch);lastScreenY=touchY(touch)}
      nativeLeft=clamp(lastScreenX-widgetHalf,0,maxX());
      nativeTop=clamp(lastScreenY-widgetHalf,0,maxY());
      collapseAtPosition();
      suppressClick=true;
    }else if(!cancelled){
      suppressClick=false;
    }
    dragMoved=false;dragExpanded=false;
  };
  floating.addEventListener('touchstart',e=>{
    const t=e.touches[0];if(!t)return;e.preventDefault();
    down=1;dragging=true;dragMoved=false;dragExpanded=false;
    startLeft=nativeLeft;startTop=nativeTop;
    lastScreenX=touchX(t);lastScreenY=touchY(t);
    localTouchX=lastScreenX-startLeft;localTouchY=lastScreenY-startTop;
  },{passive:false});
  floating.addEventListener('touchmove',e=>{
    if(!dragging)return;e.preventDefault();const t=e.touches[0];if(!t)return;
    const x=touchX(t),y=touchY(t);
    if(!dragMoved&&(Math.abs(x-(startLeft+localTouchX))>3||Math.abs(y-(startTop+localTouchY))>3)){
      dragMoved=true;expandForDrag();return;
    }
    if(!dragMoved)return;
    lastScreenX=x;lastScreenY=y;
    floating.style.left=Math.round(clamp(lastScreenX-widgetHalf,0,maxX()))+'px';
    floating.style.top=Math.round(clamp(lastScreenY-widgetHalf,0,maxY()))+'px';
  },{passive:false});
  floating.addEventListener('touchend',e=>finishDrag(e.changedTouches&&e.changedTouches[0]),{passive:false});
  floating.addEventListener('touchcancel',e=>finishDrag(e.changedTouches&&e.changedTouches[0],true),{passive:false});
  floating.addEventListener('contextmenu',e=>e.preventDefault());
  const fmt=t=>isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'-:--';
  const setPlaying=v=>{play.textContent=v?'❚❚ tocando agora':'▶ tocando agora';mainPlay.textContent=v?'❚❚':'▶'};
  const openWidget=()=>{
    if(bridge&&typeof bridge.expandWidget==='function')bridge.expandWidget();
    window.widgetExpanded=true;window.userWidgetOpen=true;window.popupOwnsExpansion=false;
    floating.hidden=true;
    setTimeout(()=>{
      sheet.style.left='50%';sheet.style.top='50%';sheet.style.right='auto';
      sheet.style.transform='translate(-50%,-50%)';
      sheet.hidden=false;sheet.classList.remove('expanded');main.hidden=false;yt.hidden=true;
    },80);
  };
  window.openWidget=openWidget;
  floating.onclick=()=>{if(suppressClick){suppressClick=false;return}openWidget()};
  close.onclick=()=>{
    audio.pause();sheet.hidden=true;floating.hidden=false;window.widgetExpanded=false;
    window.userWidgetOpen=false;window.popupOwnsExpansion=false;
    const p=$('#modernPopup');if(p)p.hidden=true;collapseAtPosition();
  };
  play.onclick=()=>audio.paused?audio.play():audio.pause();
  mainPlay.onclick=()=>audio.paused?audio.play():audio.pause();
  audio.onplay=()=>setPlaying(true);audio.onpause=()=>setPlaying(false);
  audio.ontimeupdate=()=>{current.textContent=fmt(audio.currentTime);progress.value=audio.duration?audio.currentTime/audio.duration*100:0};
  audio.onloadedmetadata=()=>duration.textContent=fmt(audio.duration);
  progress.oninput=()=>{if(audio.duration)audio.currentTime=progress.value/100*audio.duration};
  const ytUrl='https://www.youtube.com/@horizontetutoriais1346';
  const go=u=>window.open(u,'_blank');
  const goYoutube=()=>{let left=false;const onBlur=()=>{left=true};window.addEventListener('blur',onBlur,{once:true});window.location.href='intent://www.youtube.com/@horizontetutoriais1346#Intent;scheme=https;package=com.google.android.youtube;end';setTimeout(()=>{if(!left)window.open(ytUrl,'_blank')},1200)};
  $('#youtube').onclick=goYoutube;$('#openYoutube').onclick=goYoutube;
  const goSite=()=>{if(bridge&&typeof bridge.openSiteChooser==='function')bridge.openSiteChooser();else window.open('https://horizontetutoriais.github.io/','_blank')};
  $('#site').onclick=goSite;$('#support').onclick=()=>go('doar.html');
  let sheetDown=0;sheet.addEventListener('touchstart',e=>{sheetDown=e.touches[0].clientY},{passive:true});
  sheet.addEventListener('touchend',e=>{const d=sheetDown-e.changedTouches[0].clientY;if(Math.abs(d)>45){if(d>0){sheet.classList.add('expanded');main.hidden=true;yt.hidden=false}else{sheet.classList.remove('expanded');main.hidden=false;yt.hidden=true}}},{passive:true});
  fetch('config.json?widget=stable-gesture-20260927',{cache:'no-store'}).then(r=>r.json()).then(c=>{if(c.enabled===false)document.body.style.display='none';if(c.title)$('#title').textContent=c.title;if(c.subtitle)$('#subtitle').textContent=c.subtitle}).catch(()=>{});
})();
(()=>{
  const root=document.querySelector('#modernPopup');if(!root)return;
  const trigger=document.querySelector('#popupTrigger'),modal=document.querySelector('#popupModal'),close=document.querySelector('#popupClose'),dismiss=document.querySelector('#popupDismiss'),site=document.querySelector('#popupSite'),hide=document.querySelector('#popupHide'),title=document.querySelector('#popupTitle'),message=document.querySelector('#popupMessage');
  let cfg={enabled:true,popupDelaySeconds:2,displaySeconds:6,hideForHours:24,title:'Horizonte Tutoriais',message:'Inscreva-se no site e ative o sino 🛎️'};
  const hiddenUntil=Number(localStorage.getItem('horizonPopupHiddenUntil')||0);
  const show=()=>{if(cfg.enabled&&Date.now()>hiddenUntil){window.popupOwnsExpansion=!window.widgetExpanded;if(window.popupOwnsExpansion){const f=document.querySelector('#floating');if(f){f.hidden=false;const pos=window.getWidgetPosition?window.getWidgetPosition():{left:40,top:120};f.style.left=Math.round(pos.left)+'px';f.style.top=Math.round(pos.top)+'px'}if(window.AndroidBridge&&typeof window.AndroidBridge.expandWidget==='function')window.AndroidBridge.expandWidget()}root.hidden=false;setTimeout(()=>{if(!root.hidden)closeAll()},(Number(cfg.displaySeconds)||6)*1000)}};
  window.showModernPopup=show;
  const closeAll=()=>{if(hide.checked)localStorage.setItem('horizonPopupHiddenUntil',String(Date.now()+cfg.hideForHours*3600000));root.hidden=true;modal.hidden=true;if(window.popupOwnsExpansion){window.widgetExpanded=false;const f=document.querySelector('#floating');if(f){f.hidden=false;f.style.left='0px';f.style.top='0px'}if(window.AndroidBridge&&typeof window.AndroidBridge.collapseWidgetAt==='function')if(window.collapseWidgetAtPosition)window.collapseWidgetAtPosition();else if(window.AndroidBridge&&typeof window.AndroidBridge.collapseWidget==='function')window.AndroidBridge.collapseWidget();window.popupOwnsExpansion=false}};
  trigger.onclick=()=>{modal.hidden=false};close.onclick=closeAll;dismiss.onclick=closeAll;
  site.onclick=()=>{if(window.AndroidBridge&&typeof window.AndroidBridge.openSiteChooser==='function')window.AndroidBridge.openSiteChooser();else window.open('https://horizontetutoriais.github.io/','_blank')};
  fetch('../popup/config.json?popup=stable-gesture-20260927',{cache:'no-store'}).then(r=>r.json()).then(c=>{cfg={...cfg,...c};title.textContent=cfg.title||title.textContent;message.textContent=cfg.message||message.textContent;setTimeout(show,Math.max(1,Number(cfg.popupDelaySeconds)||8)*1000)}).catch(()=>setTimeout(show,8000));
})();
