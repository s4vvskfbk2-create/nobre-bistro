import { useState, useEffect, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════
// NOBRE BISTRÔ — CARDÁPIO DIGITAL v2
// Design moderno: hero animado, carrossel de destaques,
// categorias com ícone, cards imersivos, modal premium
// ═══════════════════════════════════════════════════

const R = "#8B1A1A";
const GOLD = "#C9A84C";
const WPP_NUMBER = "";
const CREAM = "#faf8f5";
const DARK = "#1a1108";
const BORDER = "#ede9e3";

const fmt = (v) => "R$ " + Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});

const store = {
  get: async(k) => { try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;} },
  set: async(k,v) => { try{await window.storage.set(k,JSON.stringify(v));}catch{} },
};

// ── Dados ─────────────────────────────────────────
const CATS = [
  {id:"prato",   label:"Prato do Dia", icon:"🍽️"},
  {id:"tortas",  label:"Tortas",       icon:"🥧"},
  {id:"salada",  label:"Saladas",      icon:"🥗"},
  {id:"lanches", label:"Lanches",      icon:"🥪"},
  {id:"salgados",label:"Salgados",     icon:"🫓"},
  {id:"sobremesa",label:"Sobremesas",  icon:"🍮"},
  {id:"bebidas", label:"Bebidas",      icon:"🥤"},
  {id:"drinks",  label:"Drinks",       icon:"🍹"},
  {id:"cerveja", label:"Cervejas",     icon:"🍺"},
];

// Produtos padrão (fallback se storage vazio)
const PRODUTOS_PADRAO = [
  {id:1,cat:"prato",name:"Escondidinho",desc:"Purê de mandioca cremoso recheado de carne seca desfiada, gratinado com queijo coalho.",price:48,tag:"🔥 Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80",stock:8,minStock:3,active:true},
  {id:2,cat:"prato",name:"Panqueca de Frango",desc:"Panqueca artesanal recheada com frango desfiado e molho especial da casa.",price:45,tag:null,tagColor:null,img:"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",stock:6,minStock:2,active:true},
  {id:3,cat:"prato",name:"Caldo Abóbora e Carne Seca",desc:"Caldo encorpado de abóbora com carne seca desfiada e azeite de cheiro.",price:28,tag:"⭐ Chef Indica",tagColor:"#92400e",img:"https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80",stock:5,minStock:2,active:true},
  {id:4,cat:"prato",name:"Panqueca de Carne",desc:"Panqueca artesanal com recheio suculento de carne moída ao molho.",price:45,tag:null,tagColor:null,img:"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",stock:4,minStock:2,active:true},
  {id:5,cat:"prato",name:"Risoto Pera Gorgonzola",desc:"Arroz arbóreo cremoso com pera caramelizada e gorgonzola.",price:65,tag:"⭐ Chef Indica",tagColor:"#92400e",img:"https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80",stock:3,minStock:2,active:true},
  {id:6,cat:"tortas",name:"Torta de Frango",desc:"Massa artesanal com recheio generoso de frango ao molho barbecue.",price:38,tag:"🔥 Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&q=80",stock:4,minStock:2,active:true},
  {id:9,cat:"salada",name:"Salada Bistrô",desc:"Folhas frescas, tomate cereja, frango grelhado, sementes e molho especial.",price:45,tag:"🔥 Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",stock:6,minStock:2,active:true},
  {id:15,cat:"salgados",name:"Pão de Queijo Waffle",desc:"Crocante por fora, derretendo por dentro. Nossa especialidade.",price:12.90,tag:"🔥 Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80",stock:12,minStock:4,active:true},
  {id:16,cat:"sobremesa",name:"Brigadeiro",desc:"Brigadeiro artesanal com chocolate belga. Feito com amor.",price:6.50,tag:"🔥 Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1558326567-98ae2405596b?w=400&q=80",stock:15,minStock:5,active:true},
  {id:22,cat:"bebidas",name:"Suco Natural",desc:"Feito na hora. Pergunte os sabores disponíveis.",price:15,tag:"⭐ Chef Indica",tagColor:"#92400e",img:"https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",stock:10,minStock:3,active:true},
  {id:24,cat:"drinks",name:"Gin e Tônica",desc:"Gin premium com tônica artesanal e especiarias selecionadas.",price:32,tag:"🔥 Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80",stock:10,minStock:3,active:true},
  {id:27,cat:"cerveja",name:"Corona Extra",desc:"Long neck com limão. A pedida certa.",price:17,tag:"🔥 Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80",stock:15,minStock:5,active:true},
];

// ── Cart hook ─────────────────────────────────────
function useCart() {
  const [items, setItems] = useState([]);
  const add = (p,qty=1,obs="") => {
    setItems(prev => {
      const k = p.id+"_"+(obs||"");
      const ex = prev.find(i=>i._key===k);
      if(ex) return prev.map(i=>i._key===k?{...i,qty:i.qty+qty}:i);
      return [...prev,{...p,qty,obs,_key:k}];
    });
  };
  const inc = k => setItems(prev=>prev.map(i=>i._key===k?{...i,qty:i.qty+1}:i));
  const dec = k => setItems(prev=>prev.map(i=>i._key===k&&i.qty>1?{...i,qty:i.qty-1}:i).filter(i=>i.qty>0));
  const clear = () => setItems([]);
  const total = items.reduce((s,i)=>s+i.price*i.qty,0);
  const count = items.reduce((s,i)=>s+i.qty,0);
  return {items,add,inc,dec,clear,total,count};
}


// ── Hero Carrossel ────────────────────────────────
function HeroCarousel({destaques}) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const touchStart = useRef(null);

  useEffect(()=>{
    if(!destaques.length) return;
    setIdx(i=>Math.min(i,destaques.length-1));
    timer.current = setInterval(()=>setIdx(i=>(i+1)%destaques.length), 3500);
    return ()=>clearInterval(timer.current);
  },[destaques.length]);

  function goTo(i){
    if(!destaques.length) return;
    clearInterval(timer.current);
    setIdx(i);
    timer.current=setInterval(()=>setIdx(x=>(x+1)%destaques.length),3500);
  }

  function onTouchStart(e){ touchStart.current = e.touches[0].clientX; }
  function onTouchEnd(e){
    if(touchStart.current===null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if(Math.abs(diff)>40) goTo(diff>0?(idx+1)%destaques.length:(idx-1+destaques.length)%destaques.length);
    touchStart.current=null;
  }

  const p = destaques[idx]; if(!p) return null;

  return <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    style={{position:"relative",height:260,overflow:"hidden",background:DARK}}>

    {/* Foto de fundo com parallax visual */}
    {destaques.map((d,i)=>(
      <div key={d.id} style={{position:"absolute",inset:0,transition:"opacity .6s ease",opacity:i===idx?1:0}}>
        <img src={d.img} alt={d.name} style={{width:"100%",height:"100%",objectFit:"cover",transform:"scale(1.05)",transition:"transform 4s ease"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,6,2,.85) 40%,rgba(10,6,2,.1) 100%)"}}/>
      </div>
    ))}

    {/* Conteúdo do slide */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px"}}>
      {p.tag&&<div style={{display:"inline-flex",alignItems:"center",gap:5,background:p.tagColor,borderRadius:20,padding:"3px 10px",marginBottom:7}}>
        <span style={{fontSize:10,fontWeight:800,color:"#fff",letterSpacing:.4}}>{p.tag}</span>
      </div>}
      <h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:900,color:"#fff",letterSpacing:-.3,textShadow:"0 2px 8px rgba(0,0,0,.4)",fontFamily:"Georgia,serif"}}>{p.name}</h2>
      <p style={{margin:"0 0 10px",fontSize:12,color:"rgba(255,255,255,.75)",lineHeight:1.4,maxWidth:280}}>{p.desc}</p>
      <span style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:GOLD}}>{fmt(p.price)}</span>
    </div>

    {/* Indicadores */}
    <div style={{position:"absolute",bottom:18,right:20,display:"flex",gap:5}}>
      {destaques.map((_,i)=>(
        <button key={i} onClick={()=>goTo(i)} style={{width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?"#fff":"rgba(255,255,255,.35)",border:"none",cursor:"pointer",padding:0,transition:"width .3s,background .3s"}}/>
      ))}
    </div>
  </div>;
}

// ── Categorias pill scroll ────────────────────────
function CatBar({cats, active, onSelect}) {
  const ref = useRef(null);
  useEffect(()=>{
    const el = ref.current?.querySelector("[data-active='true']");
    if(el) el.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  },[active]);

  return <div ref={ref} style={{display:"flex",overflowX:"auto",gap:8,padding:"12px 16px",background:"#fff",borderBottom:"1px solid "+BORDER}}>
    {cats.map(c=>{
      const a = active===c.id;
      return <button key={c.id} data-active={String(a)} onClick={()=>onSelect(c.id)}
        style={{flexShrink:0,display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:20,border:"1.5px solid "+(a?R:BORDER),background:a?R:"#fff",color:a?"#fff":"#555",fontSize:12,fontWeight:a?800:600,cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
        <span style={{fontSize:14}}>{c.icon}</span>
        <span>{c.label}</span>
      </button>;
    })}
  </div>;
}

// ── Card de produto — estilo moderno ──────────────
function ProductCard({p, onTap}) {
  const [pressed, setPressed] = useState(false);
  const esg = p.stock===0;

  return <div
    onClick={()=>!esg&&onTap(p)}
    onTouchStart={()=>setPressed(true)}
    onTouchEnd={()=>setPressed(false)}
    style={{
      display:"flex",alignItems:"flex-start",gap:12,
      padding:"14px 0",borderBottom:"1px solid "+BORDER,
      cursor:esg?"default":"pointer",
      opacity:esg?.55:1,
      transform:pressed?"scale(.985)":"scale(1)",
      transition:"transform .12s",
    }}>

    {/* Texto */}
    <div style={{flex:1,minWidth:0}}>
      {esg&&<span style={{display:"inline-block",background:"#fee2e2",color:"#b91c1c",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:18,marginBottom:5,letterSpacing:.3}}>ESGOTADO</span>}
      {!esg&&p.tag&&<span style={{display:"inline-block",background:p.tagColor,color:"#fff",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:18,marginBottom:5,letterSpacing:.3}}>{p.tag}</span>}
      <p style={{margin:0,fontWeight:800,fontSize:14,color:DARK,lineHeight:1.25,letterSpacing:-.1}}>{p.name}</p>
      {p.desc&&<p style={{margin:"4px 0 0",fontSize:12,color:"#999",lineHeight:1.45,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.desc}</p>}
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:7}}>
        <span style={{fontWeight:900,fontSize:15,color:esg?"#ccc":DARK,fontFamily:"Georgia,serif"}}>{fmt(p.price)}</span>
        {!esg&&p.stock>0&&p.stock<=p.minStock&&<span style={{fontSize:9,fontWeight:700,color:"#f59e0b",background:"#fffbeb",border:"1px solid #fde68a",padding:"1px 6px",borderRadius:18}}>⚠️ {p.stock} un.</span>}
      </div>
    </div>

    {/* Foto */}
    <div style={{position:"relative",flexShrink:0}}>
      <div style={{width:106,height:84,borderRadius:13,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,.1)"}}>
        <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",filter:esg?"grayscale(70%)":""}} loading="lazy"/>
        {!esg&&<div style={{position:"absolute",inset:0,borderRadius:13,background:"linear-gradient(135deg,transparent 60%,rgba(139,26,26,.08))"}}/>}
      </div>
      {!esg&&<button onClick={e=>{e.stopPropagation();onTap(p);}} style={{position:"absolute",bottom:-9,right:6,width:30,height:30,borderRadius:"50%",background:R,border:"2.5px solid #fff",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,boxShadow:"0 3px 10px "+R+"60",fontWeight:300}}>+</button>}
    </div>
  </div>;
}

// ── Modal do produto ──────────────────────────────
function ProductModal({p, onClose, onAdd}) {
  const [qty, setQty] = useState(1);
  const [obs, setObs] = useState("");
  const esg = p.stock===0;
  const max = p.stock>0?p.stock:99;

  return <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:480,overflow:"hidden",animation:"slideUp .3s cubic-bezier(.32,1,.56,1)"}}>

      {/* Foto hero */}
      <div style={{position:"relative",height:220}}>
        <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",filter:esg?"grayscale(50)":""}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.4),transparent 50%)"}}/>
        {p.tag&&!esg&&<span style={{position:"absolute",top:14,left:14,background:p.tagColor,color:"#fff",fontSize:10,fontWeight:800,padding:"4px 11px",borderRadius:20,letterSpacing:.3}}>{p.tag}</span>}
        <button onClick={onClose} style={{position:"absolute",top:13,right:13,background:"rgba(255,255,255,.9)",border:"none",width:33,height:33,borderRadius:"50%",fontSize:19,cursor:"pointer",color:"#333",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>×</button>
        <div style={{position:"absolute",bottom:14,left:16}}>
          <p style={{margin:0,fontSize:20,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif",textShadow:"0 2px 8px rgba(0,0,0,.4)"}}>{fmt(p.price)}</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{padding:"16px 20px 30px"}}>
        <h2 style={{margin:"0 0 6px",fontSize:19,fontWeight:900,color:DARK,fontFamily:"Georgia,serif",letterSpacing:-.3}}>{p.name}</h2>
        {p.desc&&<p style={{margin:"0 0 14px",fontSize:13,color:"#777",lineHeight:1.6}}>{p.desc}</p>}

        {!esg&&<>
          <textarea value={obs} onChange={e=>setObs(e.target.value)}
            placeholder="Alguma observação? (ex: sem cebola...)"
            rows={2}
            style={{width:"100%",border:"1.5px solid "+BORDER,borderRadius:12,padding:"10px 13px",fontSize:13,resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:CREAM,marginBottom:14,color:DARK}}/>

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {/* Qty */}
            <div style={{display:"flex",alignItems:"center",gap:0,border:"1.5px solid "+BORDER,borderRadius:25,overflow:"hidden",flexShrink:0}}>
              <button onClick={()=>setQty(Math.max(1,qty-1))} style={{width:36,height:36,border:"none",background:"#fff",color:DARK,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:300}}>−</button>
              <span style={{fontSize:15,fontWeight:800,minWidth:28,textAlign:"center",color:DARK}}>{qty}</span>
              <button onClick={()=>setQty(Math.min(max,qty+1))} style={{width:36,height:36,border:"none",background:"#fff",color:DARK,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:300}}>+</button>
            </div>
            {/* Add btn */}
            <button onClick={()=>onAdd(p,qty,obs)} style={{flex:1,background:R,color:"#fff",border:"none",borderRadius:25,padding:"12px 0",fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:-.1}}>
              Adicionar · {fmt(p.price*qty)}
            </button>
          </div>
          {p.stock>0&&p.stock<=5&&<p style={{textAlign:"center",fontSize:11,color:"#f59e0b",fontWeight:700,marginTop:9}}>⚠️ Apenas {p.stock} restante{p.stock>1?"s":""}</p>}
        </>}
        {esg&&<div style={{textAlign:"center",padding:"16px 0",color:"#b91c1c",fontWeight:700,fontSize:15}}>Item esgotado no momento</div>}
      </div>
    </div>
  </div>;
}

// ── Carrinho drawer ───────────────────────────────
function CartDrawer({cart, onClose, profs}) {
  const [step, setStep] = useState("cart");
  const [nome, setNome] = useState("");
  const [prof, setProf] = useState("");
  const [payment, setPayment] = useState("pix");
  const [obs, setObs] = useState("");
  const oid = useRef(1000+Math.floor(Math.random()*9000));
  const PAY = {pix:"💠 PIX",cartao_credito:"💳 Crédito",cartao_debito:"💳 Débito",dinheiro:"💵 Dinheiro"};
  const steps = ["cart","dados","pagamento"];
  const si = steps.indexOf(step);

  function nowStr(){ return new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}); }

  function sendWpp(){
    const lines = cart.items.map(i=>"• "+i.qty+"x "+i.name+(i.obs?" ("+i.obs+")":"")).join("\n");
    const msg = "🌿 *PEDIDO #"+oid.current+" — Nobre Bistrô*\n\n👤 *Cliente:* "+nome+"\n"+(prof?"✂️ *Profissional:* "+prof+"\n":"")+"\n*Itens:*\n"+lines+"\n\n💰 *Total:* "+fmt(cart.total)+"\n💳 *Pagamento:* "+(PAY[payment]||payment);
    window.open("https://wa.me/"+WPP_NUMBER+"?text="+encodeURIComponent(msg),"_blank");
    store.set("nb_bA_orders", []);
    onClose();
  }

  return <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:480,maxHeight:"88vh",display:"flex",flexDirection:"column",animation:"slideUp .3s cubic-bezier(.32,1,.56,1)"}}>

      {/* Header */}
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid "+BORDER,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          {si>0&&step!=="confirmado"&&<button onClick={()=>setStep(steps[si-1])} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888",padding:0,lineHeight:1}}>←</button>}
          <span style={{fontWeight:800,fontSize:16,flex:1,fontFamily:"Georgia,serif"}}>{step==="cart"?"Meu Pedido":step==="dados"?"Seus Dados":step==="pagamento"?"Pagamento":"Tudo certo! 🎉"}</span>
          <button onClick={onClose} style={{background:"#f5f5f5",border:"none",width:28,height:28,borderRadius:"50%",fontSize:16,cursor:"pointer",color:"#888",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {step!=="confirmado"&&<div style={{display:"flex",gap:4}}>
          {steps.map((s,i)=><div key={s} style={{flex:1,height:3,borderRadius:3,background:si>=i?R:"#eee",transition:"background .3s"}}/>)}
        </div>}
      </div>

      {/* Body */}
      <div style={{overflowY:"auto",flex:1,padding:"14px 20px"}}>

        {step==="cart"&&<>
          {cart.items.map(item=>(
            <div key={item._key} style={{display:"flex",alignItems:"center",gap:10,paddingBottom:12,marginBottom:12,borderBottom:"1px solid "+BORDER}}>
              <div style={{width:48,height:48,borderRadius:10,overflow:"hidden",flexShrink:0}}>
                <img src={item.img} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontWeight:700,fontSize:13,color:DARK}}>{item.name}</p>
                {item.obs&&<p style={{margin:"2px 0 0",fontSize:11,color:"#aaa"}}>{item.obs}</p>}
                <p style={{margin:"3px 0 0",fontWeight:800,fontSize:13,color:R}}>{fmt(item.price*item.qty)}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:0,border:"1.5px solid "+BORDER,borderRadius:20,overflow:"hidden"}}>
                <button onClick={()=>cart.dec(item._key)} style={{width:28,height:28,border:"none",background:"#fff",color:DARK,fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <span style={{fontWeight:800,fontSize:13,minWidth:22,textAlign:"center",color:DARK}}>{item.qty}</span>
                <button onClick={()=>cart.inc(item._key)} style={{width:28,height:28,border:"none",background:"#fff",color:DARK,fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:4,borderTop:"1.5px solid "+BORDER}}>
            <span style={{fontWeight:800,fontSize:15,color:DARK}}>Total</span>
            <span style={{fontWeight:900,fontSize:16,color:R,fontFamily:"Georgia,serif"}}>{fmt(cart.total)}</span>
          </div>
        </>}

        {step==="dados"&&<div>
          <p style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.5,marginBottom:5}}>Seu nome *</p>
          <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Como prefere ser chamada?"
            style={{width:"100%",border:"1.5px solid "+BORDER,borderRadius:12,padding:"11px 13px",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:14,color:DARK}}/>
          {profs&&profs.length>0&&<div style={{marginBottom:14}}>
            <p style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Profissional que te atende</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {profs.filter(p=>p.active).map(p=>(
                <button key={p.id} onClick={()=>setProf(prof===p.name?"":p.name)}
                  style={{padding:"6px 13px",borderRadius:20,border:"1.5px solid "+(prof===p.name?R:BORDER),background:prof===p.name?"#fff5f5":"#fff",color:prof===p.name?R:"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>}
          <div style={{background:"#fff5f5",border:"1px solid #fecaca",borderRadius:12,padding:"10px 13px"}}>
            <p style={{margin:0,fontSize:11,color:"#b91c1c",fontWeight:600,lineHeight:1.5}}>⚠️ O pagamento deve ser realizado <strong>antes do envio do pedido</strong>.</p>
          </div>
        </div>}

        {step==="pagamento"&&<div>
          <p style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Como vai pagar?</p>
          <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:16}}>
            {[["pix","💠 PIX","Chave: nobre@bistro.com.br"],["cartao_credito","💳 Cartão de Crédito",""],["cartao_debito","💳 Cartão de Débito",""],["dinheiro","💵 Dinheiro",""]].map(([v,l,hint])=>(
              <button key={v} onClick={()=>setPayment(v)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 15px",borderRadius:13,border:"1.5px solid "+(payment===v?R:BORDER),background:payment===v?"#fff5f5":"#fff",cursor:"pointer",textAlign:"left"}}>
                <div>
                  <p style={{margin:0,fontWeight:700,fontSize:14,color:payment===v?R:DARK}}>{l}</p>
                  {hint&&payment===v&&<p style={{margin:"2px 0 0",fontSize:11,color:"#888",fontFamily:"monospace"}}>{hint}</p>}
                </div>
                <div style={{width:18,height:18,borderRadius:"50%",border:"2px solid "+(payment===v?R:BORDER),background:payment===v?R:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {payment===v&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
                </div>
              </button>
            ))}
          </div>
          <div style={{background:CREAM,borderRadius:13,padding:"12px 15px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:"#888"}}>Total a pagar</span>
              <span style={{fontWeight:900,fontSize:18,color:R,fontFamily:"Georgia,serif"}}>{fmt(cart.total)}</span>
            </div>
            <p style={{margin:0,fontSize:11,color:"#aaa"}}>Realize o pagamento e depois envie o pedido</p>
          </div>
        </div>}

        {step==="confirmado"&&<div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:52,marginBottom:10}}>🎉</div>
          <h3 style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:DARK,margin:"0 0 8px"}}>Pedido pronto!</h3>
          <p style={{fontSize:13,color:"#888",margin:"0 0 20px",lineHeight:1.6}}>Clique abaixo para enviar seu pedido pelo WhatsApp.</p>
          <div style={{background:CREAM,borderRadius:13,padding:"12px 15px",marginBottom:20,textAlign:"left"}}>
            {cart.items.map(i=>(
              <div key={i._key} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                <span style={{color:"#555"}}>{i.qty}x {i.name}</span>
                <span style={{fontWeight:700,color:DARK}}>{fmt(i.price*i.qty)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid "+BORDER,paddingTop:8,marginTop:4}}>
              <span style={{fontWeight:800,color:DARK}}>Total</span>
              <span style={{fontWeight:900,color:R,fontFamily:"Georgia,serif"}}>{fmt(cart.total)}</span>
            </div>
          </div>
        </div>}
      </div>

      {/* Footer CTA */}
      <div style={{padding:"12px 20px 28px",borderTop:"1px solid "+BORDER,flexShrink:0}}>
        {step==="cart"&&<button onClick={()=>setStep("dados")} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:25,padding:"14px 0",fontSize:15,fontWeight:800,cursor:"pointer"}}>
          Continuar → {fmt(cart.total)}
        </button>}
        {step==="dados"&&<button onClick={()=>nome.trim()&&setStep("pagamento")} disabled={!nome.trim()} style={{width:"100%",background:nome.trim()?R:"#ccc",color:"#fff",border:"none",borderRadius:25,padding:"14px 0",fontSize:15,fontWeight:800,cursor:nome.trim()?"pointer":"not-allowed"}}>
          Ir para Pagamento →
        </button>}
        {step==="pagamento"&&<button onClick={()=>setStep("confirmado")} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:25,padding:"14px 0",fontSize:15,fontWeight:800,cursor:"pointer"}}>
          ✓ Confirmar · {fmt(cart.total)}
        </button>}
        {step==="confirmado"&&<button onClick={sendWpp} style={{width:"100%",background:"#22c55e",color:"#fff",border:"none",borderRadius:25,padding:"14px 0",fontSize:15,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span>📲</span> Enviar pelo WhatsApp
        </button>}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════
export default function App() {
  const [activeCat, setActiveCat] = useState("prato");
  const [sel, setSel] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [added, setAdded] = useState(null);
  const [products, setProducts] = useState(PRODUTOS_PADRAO);
  const [profs, setProfs] = useState([{id:1,name:"Adriana",active:true},{id:2,name:"Amanda",active:true},{id:3,name:"Bruna",active:true},{id:4,name:"Carol",active:true},{id:5,name:"Fernanda",active:true},{id:6,name:"Gabriela",active:true},{id:7,name:"Juliana",active:true},{id:8,name:"Larissa",active:true},{id:9,name:"Letícia",active:true},{id:10,name:"Mariana",active:true}]);
  const [loading, setLoading] = useState(true);
  const cart = useCart();
  const catRefs = useRef({});

  // Carrega produtos e profissionais do storage do Bloco A
  useEffect(()=>{
    (async()=>{
      const p = await store.get("nb_bA_products");
      if(p && p.length) setProducts(p);
      const pf = await store.get("nb_bA_profs");
      if(pf && pf.length) setProfs(pf);
      setLoading(false);
    })();
  },[]);

  // IntersectionObserver para scroll spy
  useEffect(()=>{
    if(search) return;
    const obs = new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting) setActiveCat(e.target.dataset.cat); });
    },{rootMargin:"-120px 0px -50% 0px",threshold:0});
    Object.values(catRefs.current).forEach(el=>el&&obs.observe(el));
    return ()=>obs.disconnect();
  },[search]);

  const grouped = useMemo(()=>{
    const ap = products.filter(p=>p.active);
    if(search){
      const q = search.toLowerCase();
      return {"Resultados":{id:"s",prods:ap.filter(p=>p.name.toLowerCase().includes(q)||p.desc?.toLowerCase().includes(q))}};
    }
    return CATS.reduce((a,c)=>{
      const ps = ap.filter(p=>p.cat===c.id);
      if(ps.length) a[c.label]={id:c.id,icon:c.icon,prods:ps};
      return a;
    },{});
  },[search]);

  function handleAdd(p,qty,obs){
    cart.add(p,qty,obs);
    setSel(null);
    setAdded(p.id);
    setTimeout(()=>setAdded(null),1200);
  }

  function handleCatSelect(id){
    setSearch(""); setShowSearch(false); setActiveCat(id);
    catRefs.current[id]?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  if(loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:CREAM,fontFamily:"Nunito,sans-serif"}}>
    <div style={{textAlign:"center"}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:13,letterSpacing:4,color:R,textTransform:"uppercase",marginBottom:8}}>Nobre Bistrô</div>
      <div style={{width:32,height:32,border:"2.5px solid "+BORDER,borderTop:"2.5px solid "+R,borderRadius:"50%",margin:"0 auto",animation:"spin .7s linear infinite"}}/>
    </div>
  </div>;

  return <div style={{background:CREAM,maxWidth:480,margin:"0 auto",minHeight:"100vh",fontFamily:"Nunito,sans-serif"}}>
    <style>{"@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{display:none;}@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}@keyframes spin{to{transform:rotate(360deg)}}"}</style>

    {/* Hero carrossel */}
    <HeroCarousel destaques={products.filter(p=>p.tag&&p.active&&p.stock!==0).slice(0,6)}/>

    {/* Status bar sobre o hero */}
    <div style={{background:"#fff",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid "+BORDER}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{width:7,height:7,background:"#22c55e",borderRadius:"50%",display:"inline-block",boxShadow:"0 0 0 2px #dcfce7"}}/>
        <span style={{fontSize:12,fontWeight:700,color:"#16a34a"}}>Aberto agora</span>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <button onClick={()=>setShowSearch(!showSearch)} style={{background:"#f5f5f5",border:"none",width:34,height:34,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
        </button>
        <div style={{fontFamily:"Georgia,serif",textAlign:"right"}}>
          <div style={{fontSize:10,letterSpacing:3,color:R,textTransform:"uppercase",fontWeight:700}}>Nobre Bistrô</div>
        </div>
      </div>
    </div>

    {/* Search */}
    {showSearch&&<div style={{padding:"8px 14px",background:"#fff",borderBottom:"1px solid "+BORDER}}>
      <input autoFocus value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Buscar no cardápio..."
        style={{width:"100%",border:"1.5px solid "+BORDER,borderRadius:20,padding:"9px 16px",fontSize:13,outline:"none",background:CREAM,boxSizing:"border-box",fontFamily:"Nunito,sans-serif"}}/>
    </div>}

    {/* Categorias */}
    {!search&&<div style={{position:"sticky",top:0,zIndex:50}}>
      <CatBar cats={CATS} active={activeCat} onSelect={handleCatSelect}/>
    </div>}

    {/* Lista de produtos */}
    <div style={{background:"#fff",paddingBottom:110}}>
      {Object.entries(grouped).map(([catLabel,{id:catId,icon,prods}])=>(
        <div key={catLabel} ref={el=>{if(catId&&catId!=="s")catRefs.current[catId]=el;}} data-cat={catId} style={{padding:"0 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,paddingTop:20,paddingBottom:6}}>
            <span style={{fontSize:18}}>{icon}</span>
            <h2 style={{fontSize:15,fontWeight:900,color:DARK,letterSpacing:-.2,fontFamily:"Georgia,serif"}}>{catLabel}</h2>
            <div style={{flex:1,height:1,background:BORDER}}/>
          </div>
          {prods.map(p=>(
            <ProductCard key={p.id} p={p} onTap={setSel}/>
          ))}
        </div>
      ))}
    </div>

    {/* Feedback visual de adicionado */}
    {added&&<div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:500,background:"rgba(0,0,0,.75)",borderRadius:14,padding:"12px 22px",display:"flex",alignItems:"center",gap:9,animation:"fadeIn .2s ease",backdropFilter:"blur(8px)"}}>
      <span style={{fontSize:20}}>✓</span>
      <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>Adicionado ao pedido</span>
    </div>}

    {/* Botão do carrinho */}
    {cart.count>0&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",zIndex:90,width:"calc(100% - 32px)",maxWidth:448}}>
      <button onClick={()=>setShowCart(true)} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:20,padding:"15px 22px",fontSize:15,fontWeight:900,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 8px 28px "+R+"55"}}>
        <div style={{background:"rgba(255,255,255,.2)",borderRadius:10,padding:"2px 10px",fontSize:13,fontWeight:800}}>{cart.count}</div>
        <span style={{letterSpacing:-.1}}>Ver pedido</span>
        <span style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700}}>{fmt(cart.total)}</span>
      </button>
    </div>}

    {/* Modal produto */}
    {sel&&<ProductModal p={sel} onClose={()=>setSel(null)} onAdd={handleAdd}/>}

    {/* Carrinho */}
    {showCart&&<CartDrawer cart={cart} onClose={()=>setShowCart(false)} profs={profs}/>}

    {/* Admin btn */}
    <button style={{position:"fixed",bottom:86,right:14,zIndex:80,background:"rgba(255,255,255,.9)",backdropFilter:"blur(8px)",border:"1px solid "+BORDER,borderRadius:20,padding:"6px 12px",fontSize:11,color:"#888",fontWeight:700,cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,.08)"}}>⚙️</button>
  </div>;
}
