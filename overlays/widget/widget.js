(()=>{
  const $=s=>document.querySelector(s);
  const floating=$('#floating'),sheet=$('#sheet'),close=$('#close');
  const main=$('#screenMain'),yt=$('#screenYoutube'),audio=$('#audio');
  const play=$('#play'),mainPlay=$('#mainPlay'),progress=$('#progress'),ytProgress=$('#ytProgress');
  const current=$('#current'),duration=$('#duration'),ytCurrent=$('#ytCurrent'),ytDuration=$('#ytDuration'),bridge=window.AndroidBridge;
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
  const resetFloatingCss=()=>{floating.style.left='0px';floating.style.top='0px';floating.style.display='block';floating.style.visibility='visible';floating.style.opacity='1'};
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
  const setPlaying=v=>{
    const icon=v?'❚❚':'▶';
    play.textContent=icon;mainPlay.textContent=icon;
    play.setAttribute('aria-label',v?'Pausar música':'Reproduzir música');
    mainPlay.setAttribute('aria-label',v?'Pausar música':'Reproduzir música');
  };
  const centerSheet=()=>{
    sheet.style.position='fixed';sheet.style.left='50vw';sheet.style.top='50vh';
    sheet.style.right='auto';sheet.style.bottom='auto';
    sheet.style.width='calc(100vw - 16px)';sheet.style.maxWidth='none';
    sheet.style.transform='translate(-50%,-50%)';
  };
  const restoreFloatingVisual=()=>{const f=document.querySelector('#floating');if(!f)return;const pos=window.getWidgetPosition?window.getWidgetPosition():{left:40,top:120};f.hidden=false;f.style.display='block';f.style.visibility='visible';f.style.opacity='1';f.style.left=Math.round(pos.left)+'px';f.style.top=Math.round(pos.top)+'px';f.style.zIndex='100';};
  let openingWidget=false;
  const finishOpenWidget=()=>{if(!openingWidget)return;openingWidget=false;sheet.hidden=false;sheet.classList.remove('expanded');main.hidden=false;yt.hidden=true;centerSheet();requestAnimationFrame(()=>{centerSheet();requestAnimationFrame(centerSheet)});setTimeout(centerSheet,180);setTimeout(centerSheet,360);};
  const openWidget=()=>{
    window.widgetExpanded=true;window.userWidgetOpen=true;window.popupOwnsExpansion=false;
    floating.hidden=true;floating.style.visibility='hidden';floating.style.opacity='0';floating.style.pointerEvents='none';sheet.hidden=true;openingWidget=true;
    if(bridge&&typeof bridge.expandWidget==='function')bridge.expandWidget();
    setTimeout(finishOpenWidget,120);
  };
  window.openWidget=openWidget;
  floating.onclick=()=>{if(suppressClick){suppressClick=false;return}openWidget()};
  const restoreCollapsedBall=()=>{sheet.hidden=true;floating.hidden=false;floating.style.display='block';floating.style.visibility='visible';floating.style.opacity='1';floating.style.pointerEvents='auto';floating.style.left='0px';floating.style.top='0px';floating.style.zIndex='100';};
  close.onclick=()=>{
    audio.pause();window.widgetExpanded=false;window.userWidgetOpen=false;window.popupOwnsExpansion=false;
    const p=$('#modernPopup');if(p)p.hidden=true;
    restoreCollapsedBall();collapseAtPosition();
    setTimeout(()=>{restoreCollapsedBall();collapseAtPosition()},80);
    setTimeout(restoreCollapsedBall,240);
    setTimeout(restoreCollapsedBall,500);
  };
  const toggleAudio=()=>{const result=audio.paused?audio.play():audio.pause();if(result&&typeof result.catch==='function')result.catch(()=>setPlaying(false));};
  play.onclick=toggleAudio;
  mainPlay.onclick=toggleAudio;
  audio.onplay=()=>setPlaying(true);audio.onpause=()=>setPlaying(false);
  const syncProgress=()=>{
    const rawDuration=Number(audio.duration);
    const rawCurrent=Number(audio.currentTime);
    const hasDuration=Number.isFinite(rawDuration)&&rawDuration>0;
    const now=Number.isFinite(rawCurrent)&&rawCurrent>=0?rawCurrent:0;
    const percent=hasDuration?Math.max(0,Math.min(100,now/rawDuration*100)):0;
    const total=hasDuration?fmt(rawDuration):'-:--';
    current.textContent=fmt(now);duration.textContent=total;
    ytCurrent.textContent=fmt(now);ytDuration.textContent=total;
    progress.value=String(percent);ytProgress.value=String(percent);
    progress.disabled=!hasDuration;ytProgress.disabled=!hasDuration;
  };
  audio.addEventListener('timeupdate',syncProgress);
  audio.addEventListener('loadedmetadata',syncProgress);
  audio.addEventListener('durationchange',syncProgress);
  audio.addEventListener('loadeddata',syncProgress);
  audio.addEventListener('canplay',syncProgress);
  audio.addEventListener('progress',syncProgress);
  audio.addEventListener('seeked',syncProgress);
  audio.addEventListener('play',syncProgress);
  audio.addEventListener('pause',syncProgress);
  audio.addEventListener('ended',()=>{syncProgress();setPlaying(false)});
  const seek=value=>{
    const total=Number(audio.duration),next=Number(value);
    if(Number.isFinite(total)&&total>0&&Number.isFinite(next)){
      audio.currentTime=Math.max(0,Math.min(total,next/100*total));
      syncProgress();
    }
  };
  progress.oninput=()=>seek(progress.value);
  ytProgress.oninput=()=>seek(ytProgress.value);
  syncProgress();
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
  let popupWidgetWasOpen=false;
  let popupBallPosition={left:40,top:120};
  let popupTimer=0;
  const show=()=>{if(cfg.enabled&&Date.now()>hiddenUntil){popupBallPosition=window.getWidgetPosition?window.getWidgetPosition():{left:40,top:120};popupWidgetWasOpen=!!(window.widgetExpanded||window.userWidgetOpen||!document.querySelector('#sheet').hidden);window.popupOwnsExpansion=!popupWidgetWasOpen;root.hidden=true;const reveal=()=>{root.hidden=false;popupTimer=setTimeout(()=>{if(!root.hidden&&!(!modal.hidden))closeAll()},(Number(cfg.displaySeconds)||6)*1000)};if(window.popupOwnsExpansion){const f=document.querySelector('#floating');const pos=popupBallPosition;if(f){f.hidden=true;f.style.visibility='hidden';f.style.opacity='0';f.style.pointerEvents='none';f.style.left='0px';f.style.top='0px'}if(window.AndroidBridge&&typeof window.AndroidBridge.expandWidget==='function')window.AndroidBridge.expandWidget();setTimeout(()=>{if(f&&!root.hidden){f.hidden=false;f.style.visibility='visible';f.style.opacity='1';f.style.pointerEvents='auto';f.style.left=Math.round(pos.left)+'px';f.style.top=Math.round(pos.top)+'px';f.style.zIndex='100'}reveal()},120)}else reveal();}};
  window.showModernPopup=show;
  const restoreFloating=()=>{const f=document.querySelector('#floating');if(!f)return;f.hidden=false;f.style.display='block';f.style.visibility='visible';f.style.opacity='1';f.style.left='0px';f.style.top='0px';f.style.zIndex='100';};
  const closeAll=()=>{if(popupTimer){clearTimeout(popupTimer);popupTimer=0}if(hide.checked)localStorage.setItem('horizonPopupHiddenUntil',String(Date.now()+cfg.hideForHours*3600000));root.hidden=true;modal.hidden=true;if(popupWidgetWasOpen||window.widgetExpanded||window.userWidgetOpen){window.widgetExpanded=true;window.userWidgetOpen=true;const f=document.querySelector('#floating');if(f){f.hidden=true;f.style.visibility='hidden';f.style.opacity='0';f.style.pointerEvents='none';f.style.left='0px';f.style.top='0px'}const sheet=document.querySelector('#sheet');if(sheet)sheet.hidden=false;}else if(window.popupOwnsExpansion){window.widgetExpanded=false;restoreFloating();if(window.collapseWidgetAtPosition)window.collapseWidgetAtPosition();else if(window.AndroidBridge&&typeof window.AndroidBridge.collapseWidget==='function')window.AndroidBridge.collapseWidget();window.popupOwnsExpansion=false;setTimeout(()=>{if(window.AndroidBridge&&typeof window.AndroidBridge.collapseWidgetAt==='function')window.AndroidBridge.collapseWidgetAt(Math.round(popupBallPosition.left),Math.round(popupBallPosition.top));restoreFloating();},120);setTimeout(restoreFloating,360);setTimeout(restoreFloating,700);}popupWidgetWasOpen=false;};
  trigger.onclick=()=>{if(popupTimer){clearTimeout(popupTimer);popupTimer=0}modal.hidden=false};close.onclick=closeAll;dismiss.onclick=closeAll;
  site.onclick=()=>{if(window.AndroidBridge&&typeof window.AndroidBridge.openSiteChooser==='function')window.AndroidBridge.openSiteChooser();else window.open('https://horizontetutoriais.github.io/','_blank')};
  fetch('../popup/config.json?popup=stable-gesture-20260927',{cache:'no-store'}).then(r=>r.json()).then(c=>{cfg={...cfg,...c};title.textContent=cfg.title||title.textContent;message.textContent=cfg.message||message.textContent;setTimeout(show,Math.max(1,Number(cfg.popupDelaySeconds)||8)*1000)}).catch(()=>setTimeout(show,8000));
})();
