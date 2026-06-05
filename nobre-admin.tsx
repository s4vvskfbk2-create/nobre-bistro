import { useState, useEffect, useRef, useMemo } from "react";

var R="#8B1A1A",CREAM="#faf8f5",BORDER="#ede9e3",BG="#f4f6f9",GOLD="#C9A84C";
var _FU="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
var CSS="@import url("+_FU+");*{box-sizing:border-box;margin:0;padding:0;font-family:Nunito,sans-serif;}::-webkit-scrollbar{display:none;}body{background:"+BG+";}@keyframes spin{to{transform:rotate(360deg)}}";

var fmt=function(v){return "R$ "+Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});};
var nowStr=function(){return new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});};
var todayKey=function(){return new Date().toLocaleDateString("pt-BR");};

var _SB_URL="https://zxpnguynjrsixsomaieg.supabase.co";
var _SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cG5ndXluanJzaXhzb21haWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODkyNDAsImV4cCI6MjA5NjE2NTI0MH0.3_6a8Hn0xQe6FEbjVTeRnKZUwRD64Fe_0Jsk-pGHP3Q";

async function sbFetch(method,path,body){
  var res=await fetch(_SB_URL+"/rest/v1/"+path,{
    method:method,
    headers:{"apikey":_SB_KEY,"Authorization":"Bearer "+_SB_KEY,"Content-Type":"application/json","Prefer":method==="POST"?"resolution=merge-duplicates":""},
    body:body?JSON.stringify(body):undefined
  });
  if(!res.ok)return null;
  var text=await res.text();
  return text?JSON.parse(text):null;
}

var store={
  get:async function(k){
    try{var rows=await sbFetch("GET","config?key=eq."+encodeURIComponent(k)+"&select=value");if(rows&&rows.length>0)return rows[0].value;return null;}
    catch(e){return null;}
  },
  set:async function(k,v){
    try{await sbFetch("POST","config",{key:k,value:v});}catch(e){}
  }
};

var DIAS=["Domingo","Segunda","Terca","Quarta","Quinta","Sexta","Sabado"];
var HORARIOS_DEFAULT={0:{aberto:false,abre:"",fecha:""},1:{aberto:false,abre:"",fecha:""},2:{aberto:true,abre:"09:00",fecha:"18:30"},3:{aberto:true,abre:"09:00",fecha:"18:30"},4:{aberto:true,abre:"09:00",fecha:"18:30"},5:{aberto:true,abre:"09:00",fecha:"18:30"},6:{aberto:true,abre:"09:00",fecha:"18:30"}};

var INIT_CATS=[{id:"prato",label:"Prato do Dia"},{id:"tortas",label:"Tortas"},{id:"salada",label:"Saladas"},{id:"lanches",label:"Lanches"},{id:"salgados",label:"Salgados"},{id:"sobremesa",label:"Sobremesas"},{id:"bebidas",label:"Bebidas"},{id:"drinks",label:"Drinks"},{id:"cerveja",label:"Cervejas"}];
var INIT_PROFS=[{id:1,name:"Adriana",active:true,telefone:"",desconto:20},{id:2,name:"Amanda",active:true,telefone:"",desconto:20},{id:3,name:"Bruna",active:true,telefone:"",desconto:20},{id:4,name:"Carol",active:true,telefone:"",desconto:20},{id:5,name:"Fernanda",active:true,telefone:"",desconto:20},{id:6,name:"Gabriela",active:true,telefone:"",desconto:20},{id:7,name:"Juliana",active:true,telefone:"",desconto:20},{id:8,name:"Larissa",active:true,telefone:"",desconto:20},{id:9,name:"Leticia",active:true,telefone:"",desconto:20},{id:10,name:"Mariana",active:true,telefone:"",desconto:20}];
var INIT_PRODUCTS=[
  {id:1,cat:"prato",name:"Escondidinho",desc:"Pure de mandioca cremoso recheado de carne seca.",price:48,tag:"Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80",stock:8,minStock:3,active:true,ingredients:[]},
  {id:2,cat:"prato",name:"Panqueca de Frango",desc:"Panqueca artesanal com frango desfiado.",price:45,tag:null,tagColor:null,img:"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",stock:6,minStock:2,active:true,ingredients:[]},
  {id:3,cat:"prato",name:"Risoto Pera Gorgonzola",desc:"Arroz arboreo cremoso com pera e gorgonzola.",price:65,tag:"Chef Indica",tagColor:"#92400e",img:"https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80",stock:3,minStock:2,active:true,ingredients:[]},
  {id:4,cat:"tortas",name:"Torta de Frango",desc:"Massa artesanal com frango ao molho.",price:38,tag:"Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&q=80",stock:4,minStock:2,active:true,ingredients:[]},
  {id:5,cat:"salada",name:"Salada Bistro",desc:"Folhas frescas, frango grelhado e molho especial.",price:45,tag:"Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",stock:6,minStock:2,active:true,ingredients:[]},
  {id:6,cat:"lanches",name:"Lanche de Frango",desc:"Frango grelhado com molho especial.",price:48,tag:"Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",stock:5,minStock:2,active:true,ingredients:[]},
  {id:7,cat:"salgados",name:"Pao de Queijo Waffle",desc:"Crocante por fora, derretendo por dentro.",price:12.90,tag:"Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80",stock:12,minStock:4,active:true,ingredients:[]},
  {id:8,cat:"sobremesa",name:"Brigadeiro",desc:"Brigadeiro artesanal com chocolate belga.",price:6.50,tag:"Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1558326567-98ae2405596b?w=400&q=80",stock:15,minStock:5,active:true,ingredients:[]},
  {id:9,cat:"bebidas",name:"Suco Natural",desc:"Feito na hora.",price:15,tag:"Chef Indica",tagColor:"#92400e",img:"https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",stock:10,minStock:3,active:true,ingredients:[]},
  {id:10,cat:"drinks",name:"Gin e Tonica",desc:"Gin premium com tonica artesanal.",price:32,tag:"Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80",stock:10,minStock:3,active:true,ingredients:[]},
  {id:11,cat:"cerveja",name:"Corona Extra",desc:"Long neck com limao.",price:17,tag:"Mais Pedido",tagColor:"#b91c1c",img:"https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80",stock:15,minStock:5,active:true,ingredients:[]}
];

function imprimirComanda(order){
  var w=window.open("","_blank","width=380,height=540");
  var rows=(order.items||[]).map(function(i){return "<tr><td style='padding:5px;font-weight:700'>"+i.qty+"x</td><td style='padding:5px'>"+i.name+"</td><td style='padding:5px;text-align:right;font-weight:700'>"+fmt(i.price*i.qty)+"</td></tr>";}).join("");
  var html="<!DOCTYPE html><html><head><title>Comanda</title><style>*{font-family:monospace;}</style></head><body>";
  html+="<h2 style='text-align:center'>COMANDA #"+order.id+"</h2>";
  html+="<p>Cliente: "+(order.nome||"Balcao")+"</p>";
  html+="<p>Hora: "+order.criadoEm+"</p>";
  html+="<table style='width:100%'><tbody>"+rows+"</tbody></table>";
  html+="<hr><p style='font-size:18px;font-weight:900'>TOTAL: "+fmt(order.total)+"</p>";
  html+="</body></html>";
  w.document.write(html);w.document.close();
  setTimeout(function(){w.print();},400);
}

function gerarMsgFiado(prof,order,totalAcum){
  var nome=prof.name.split(" ")[0];
  var itens=order.items.map(function(i){return "- "+i.qty+"x "+i.name+" "+fmt(i.price*i.qty);}).join("\n");
  return "Oi "+nome+"! Lancei no seu fiado:\n\n"+itens+"\n\nValor: "+fmt(order.total)+"\nSaldo quinzena: "+fmt(totalAcum)+"\n\nNobre Bistro";
}

function gerarMsgQuinzena(prof,orders,desconto){
  var total=orders.reduce(function(s,o){return s+o.total;},0);
  var desc=total*(desconto/100);
  var liquido=total-desc;
  var nome=prof.name.split(" ")[0];
  return "Oi "+nome+"! Fechamento da quinzena:\n\nTotal consumido: "+fmt(total)+"\nDesconto "+desconto+"%: -"+fmt(desc)+"\nDesconto na folha: "+fmt(liquido)+"\n\nNobre Bistro";
}

function abrirWpp(telefone,msg){
  var tel=(telefone||"").replace(/\D/g,"");
  if(tel.length>=10)tel="55"+tel;
  window.open("https://wa.me/"+(tel||"5511914195567")+"?text="+encodeURIComponent(msg),"_blank");
}

function Btn(props){
  var c=props.color||R,sx=props.style||{};
  return <button onClick={props.onClick} disabled={props.disabled} style={Object.assign({},{padding:props.sm?"7px 13px":props.lg?"14px 0":"10px 18px",borderRadius:10,border:"1.5px solid "+(props.outline?c:"transparent"),background:props.outline?"transparent":props.disabled?"#ccc":c,color:props.outline?c:"#fff",fontSize:props.sm?12:13,fontWeight:800,cursor:props.disabled?"not-allowed":"pointer",width:props.full?"100%":"auto",opacity:props.disabled?.5:1},sx)}>{props.children}</button>;
}

function InputF(props){
  var s={width:"100%",border:"1.5px solid "+BORDER,borderRadius:10,padding:"10px 13px",fontSize:14,outline:"none",background:"#fff",boxSizing:"border-box",fontFamily:"inherit",color:"#1a1a1a",resize:"none"};
  return <div style={{marginBottom:12}}>
    {props.label&&<label style={{fontSize:11,fontWeight:700,color:"#888",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{props.label}</label>}
    {props.textarea?<textarea value={props.value} onChange={function(e){props.onChange(e.target.value);}} rows={props.rows||3} placeholder={props.placeholder} style={s}/>:<input type={props.type||"text"} value={props.value} onChange={function(e){props.onChange(e.target.value);}} placeholder={props.placeholder} style={s}/>}
    {props.hint&&<p style={{margin:"3px 0 0",fontSize:10,color:"#aaa"}}>{props.hint}</p>}
  </div>;
}

function Modal(props){
  if(!props.open)return null;
  return <div onClick={props.onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:440,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid "+BORDER,position:"sticky",top:0,background:"#fff"}}>
        <span style={{fontWeight:800,fontSize:16}}>{props.title}</span>
        <button onClick={props.onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#aaa"}}>x</button>
      </div>
      <div style={{padding:"14px 18px"}}>{props.children}</div>
    </div>
  </div>;
}

function Badge(props){
  if(!props.count)return null;
  return <span style={{background:"#ef4444",color:"#fff",fontSize:9,fontWeight:800,borderRadius:10,padding:"1px 5px",marginLeft:4}}>{props.count}</span>;
}

function BalcaoTab(props){
  var products=props.products,setProducts=props.setProducts,profs=props.profs,orders=props.orders,setOrders=props.setOrders;
  var _ci=useState([]),cartItems=_ci[0],setCartItems=_ci[1];
  var _cn=useState(""),clienteNome=_cn[0],setClienteNome=_cn[1];
  var _ps=useState(""),profSel=_ps[0],setProfSel=_ps[1];
  var _py=useState("pix"),payment=_py[0],setPayment=_py[1];
  var _fi=useState(false),fiado=_fi[0],setFiado=_fi[1];
  var _dn=useState(null),done=_dn[0],setDone=_dn[1];
  var _bq=useState(""),busca=_bq[0],setBusca=_bq[1];
  var total=cartItems.reduce(function(s,i){return s+i.price*i.qty;},0);
  var oid=useRef(2000+Math.floor(Math.random()*9000));
  var PAY={pix:"PIX",cartao_credito:"Credito",cartao_debito:"Debito",dinheiro:"Dinheiro"};

  var prodsFiltrados=useMemo(function(){
    var ap=products.filter(function(p){return p.active;});
    if(!busca)return ap;
    var q=busca.toLowerCase();
    return ap.filter(function(p){return p.name.toLowerCase().includes(q);});
  },[products,busca]);

  function addItem(p){
    setCartItems(function(prev){
      var ex=prev.find(function(i){return i.id===p.id;});
      if(ex)return prev.map(function(i){return i.id===p.id?Object.assign({},i,{qty:i.qty+1}):i;});
      return prev.concat([Object.assign({},p,{qty:1})]);
    });
  }
  function remItem(id){setCartItems(function(prev){return prev.map(function(i){return i.id===id&&i.qty>1?Object.assign({},i,{qty:i.qty-1}):i;}).filter(function(i){return i.qty>0;});});}

  function confirmar(){
    var order={id:oid.current,nome:clienteNome||"Balcao",profissional:profSel,payment:fiado?"fiado":payment,fiado:fiado,profFiado:fiado?profSel:"",items:cartItems.map(function(i){return{id:i.id,name:i.name,price:i.price,qty:i.qty};}),total:total,status:"em_curso",criadoEm:nowStr(),canal:"balcao"};
    setOrders(function(prev){
      var novos=prev.concat([order]);
      if(fiado&&profSel){
        var profObj=props.profs.find(function(p){return p.name===profSel;});
        var fiadosAnt=prev.filter(function(o){return o.fiado&&o.profFiado===profSel;});
        var totalAcum=fiadosAnt.reduce(function(s,o){return s+o.total;},0)+order.total;
        if(profObj)setTimeout(function(){abrirWpp(profObj.telefone,gerarMsgFiado(profObj,order,totalAcum));},800);
      }
      return novos;
    });
    setProducts(function(prev){return prev.map(function(p){var it=cartItems.find(function(i){return i.id===p.id;});if(!it)return p;return Object.assign({},p,{stock:Math.max(0,(p.stock||0)-it.qty)});});});
    setDone(order);setCartItems([]);setClienteNome("");setProfSel("");setFiado(false);setPayment("pix");
    oid.current=2000+Math.floor(Math.random()*9000);
  }

  if(done)return <div style={{padding:16,textAlign:"center"}}>
    <div style={{width:52,height:52,borderRadius:"50%",background:"#f0fdf4",border:"2px solid #22c55e",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/></svg>
    </div>
    <h3 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:"#1a1a1a",margin:"0 0 4px"}}>Pedido #{done.id}</h3>
    <p style={{fontWeight:900,fontSize:22,color:R,fontFamily:"Georgia,serif",margin:"0 0 14px"}}>{fmt(done.total)}</p>
    <div style={{display:"flex",gap:8,justifyContent:"center"}}>
      <Btn onClick={function(){imprimirComanda(done);}}>Imprimir</Btn>
      <Btn onClick={function(){setDone(null);}} outline>Novo pedido</Btn>
    </div>
  </div>;

  return <div style={{padding:14}}>
    <h2 style={{fontWeight:900,fontSize:18,color:"#1a1a1a",margin:"0 0 12px",fontFamily:"Georgia,serif"}}>Balcao</h2>
    <input value={busca} onChange={function(e){setBusca(e.target.value);}} placeholder="Buscar produto..."
      style={{width:"100%",border:"1.5px solid "+BORDER,borderRadius:10,padding:"9px 13px",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      {prodsFiltrados.map(function(p){
        var esg=p.stock===0;
        return <button key={p.id} onClick={function(){if(!esg)addItem(p);}} disabled={esg}
          style={{background:esg?"#f5f5f5":"#fff",border:"1.5px solid "+BORDER,borderRadius:11,padding:"10px",cursor:esg?"not-allowed":"pointer",textAlign:"left",opacity:esg?.5:1}}>
          <p style={{margin:"0 0 2px",fontWeight:700,fontSize:13,color:"#1a1a1a"}}>{p.name}</p>
          <p style={{margin:0,fontWeight:900,fontSize:14,color:R,fontFamily:"Georgia,serif"}}>{fmt(p.price)}</p>
          <p style={{margin:"2px 0 0",fontSize:9,color:"#aaa"}}>{esg?"Esgotado":p.stock+" un"}</p>
        </button>;
      })}
    </div>
    {cartItems.length>0&&<div style={{background:"#fff",borderRadius:13,border:"1px solid "+BORDER,padding:12,marginBottom:12}}>
      <p style={{fontWeight:800,fontSize:13,margin:"0 0 8px"}}>Itens do pedido</p>
      {cartItems.map(function(item){return(
        <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:13,color:"#1a1a1a"}}>{item.qty}x {item.name}</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:13,fontWeight:700,color:R}}>{fmt(item.price*item.qty)}</span>
            <button onClick={function(){remItem(item.id);}} style={{background:"#fee2e2",border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",fontSize:14,color:"#b91c1c",display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
          </div>
        </div>
      );})}
      <div style={{borderTop:"1.5px solid "+BORDER,paddingTop:8,marginTop:4,display:"flex",justifyContent:"space-between"}}>
        <span style={{fontWeight:800}}>Total</span>
        <span style={{fontWeight:900,color:R,fontFamily:"Georgia,serif",fontSize:16}}>{fmt(total)}</span>
      </div>
    </div>}
    {cartItems.length>0&&<div>
      <InputF label="Cliente" value={clienteNome} onChange={setClienteNome} placeholder="Nome (opcional)"/>
      <div style={{marginBottom:10}}>
        <label style={{fontSize:11,fontWeight:700,color:"#888",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Profissional</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {profs.filter(function(p){return p.active;}).map(function(p){return(
            <button key={p.id} onClick={function(){setProfSel(profSel===p.name?"":p.name);}}
              style={{padding:"5px 10px",borderRadius:18,border:"1.5px solid "+(profSel===p.name?R:BORDER),background:profSel===p.name?"#fff5f5":"#fff",color:profSel===p.name?R:"#666",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {p.name}
            </button>
          );})}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
        {[["pix","PIX"],["cartao_credito","Credito"],["cartao_debito","Debito"],["dinheiro","Dinheiro"]].map(function(arr){
          return <button key={arr[0]} onClick={function(){setPayment(arr[0]);setFiado(false);}}
            style={{padding:"8px 0",borderRadius:9,border:"1.5px solid "+(payment===arr[0]&&!fiado?R:BORDER),background:payment===arr[0]&&!fiado?"#fff5f5":"#fff",color:payment===arr[0]&&!fiado?R:"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {arr[1]}
          </button>;
        })}
      </div>
      {profSel&&<label style={{display:"flex",alignItems:"center",gap:7,marginBottom:12,cursor:"pointer",fontSize:13,fontWeight:fiado?700:400,color:fiado?R:"#666"}}>
        <input type="checkbox" checked={fiado} onChange={function(e){setFiado(e.target.checked);}} style={{accentColor:R,width:15,height:15}}/>
        Fiado para {profSel}
      </label>}
      <Btn lg full onClick={confirmar}>Confirmar Pedido -- {fmt(total)}</Btn>
    </div>}
  </div>;
}

function PedidosTab(props){
  var orders=props.orders,setOrders=props.setOrders;
  var _sf=useState("todos"),statusFiltro=_sf[0],setStatusFiltro=_sf[1];
  var STATUS={todos:"Todos",pendente:"Pendente",aguardando_pagamento:"Aguard. Pgto",em_curso:"Em curso",concluido:"Concluido",cancelado:"Cancelado"};
  var CORES={pendente:"#f59e0b",aguardando_pagamento:"#3b82f6",em_curso:"#8b5cf6",concluido:"#22c55e",cancelado:"#ef4444"};

  function upd(id,status){setOrders(function(prev){return prev.map(function(o){return o.id===id?Object.assign({},o,{status:status}):o;});});}

  var lista=useMemo(function(){
    var o=orders.slice().reverse();
    if(statusFiltro==="todos")return o;
    return o.filter(function(x){return x.status===statusFiltro;});
  },[orders,statusFiltro]);

  var aguardando=orders.filter(function(o){return o.status==="aguardando_pagamento";});

  return <div style={{padding:14}}>
    <h2 style={{fontWeight:900,fontSize:18,color:"#1a1a1a",margin:"0 0 12px",fontFamily:"Georgia,serif"}}>Pedidos</h2>
    {aguardando.length>0&&<div style={{background:"#eff6ff",border:"1.5px solid #3b82f6",borderRadius:13,padding:"11px 14px",marginBottom:12}}>
      <p style={{margin:"0 0 8px",fontWeight:800,fontSize:13,color:"#1d4ed8"}}>{aguardando.length} aguardando pagamento</p>
      {aguardando.map(function(o){return(
        <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff",borderRadius:10,padding:"9px 11px",marginBottom:6}}>
          <div>
            <p style={{margin:0,fontWeight:700,fontSize:13}}>#{o.id} -- {o.nome}</p>
            <p style={{margin:"2px 0 0",fontSize:11,color:"#aaa"}}>{o.items.map(function(i){return i.qty+"x "+i.name;}).join(", ").slice(0,45)}</p>
            <p style={{margin:"2px 0 0",fontWeight:800,fontSize:12,color:R}}>{fmt(o.total)}</p>
          </div>
          <button onClick={function(){upd(o.id,"em_curso");}} style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:10,padding:"9px 14px",fontSize:12,fontWeight:800,cursor:"pointer",flexShrink:0,marginLeft:8}}>Pago</button>
        </div>
      );})}
    </div>}
    <div style={{display:"flex",overflowX:"auto",gap:6,marginBottom:12,paddingBottom:4}}>
      {Object.entries(STATUS).map(function(entry){
        var v=entry[0],l=entry[1];
        var a=statusFiltro===v;
        return <button key={v} onClick={function(){setStatusFiltro(v);}}
          style={{flexShrink:0,padding:"5px 12px",borderRadius:18,border:"1.5px solid "+(a?R:BORDER),background:a?R:"#fff",color:a?"#fff":"#666",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
          {l}
        </button>;
      })}
    </div>
    {lista.map(function(o){return(
      <div key={o.id} style={{background:"#fff",borderRadius:13,border:"1px solid "+BORDER,padding:"11px 13px",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div>
            <p style={{margin:0,fontWeight:800,fontSize:13}}>#{o.id} -- {o.nome}</p>
            <p style={{margin:"2px 0 0",fontSize:10,color:"#aaa"}}>{o.criadoEm} -- {o.canal==="balcao"?"Balcao":"App"}</p>
          </div>
          <div style={{textAlign:"right"}}>
            <span style={{background:CORES[o.status]||"#aaa",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:18,display:"inline-block"}}>{STATUS[o.status]||o.status}</span>
            <p style={{margin:"4px 0 0",fontWeight:900,fontSize:13,color:R,fontFamily:"Georgia,serif"}}>{fmt(o.total)}</p>
          </div>
        </div>
        <p style={{margin:"0 0 8px",fontSize:11,color:"#666"}}>{o.items.map(function(i){return i.qty+"x "+i.name;}).join(", ")}</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {o.status==="pendente"&&<Btn sm onClick={function(){upd(o.id,"em_curso");}}>Aceitar</Btn>}
          {o.status==="em_curso"&&<Btn sm onClick={function(){upd(o.id,"concluido");}} color="#22c55e">Concluir</Btn>}
          {o.status!=="cancelado"&&o.status!=="concluido"&&<Btn sm outline onClick={function(){upd(o.id,"cancelado");}}>Cancelar</Btn>}
          {(o.status==="em_curso"||o.status==="concluido")&&<Btn sm outline onClick={function(){imprimirComanda(o);}}>Imprimir</Btn>}
        </div>
      </div>
    );})}
    {lista.length===0&&<p style={{textAlign:"center",color:"#ccc",padding:"30px 0",fontSize:14}}>Nenhum pedido</p>}
  </div>;
}

function CozinhaTab(props){
  var orders=props.orders,setOrders=props.setOrders;
  var fila=orders.filter(function(o){return o.status==="em_curso";});
  function concluir(id){setOrders(function(prev){return prev.map(function(o){return o.id===id?Object.assign({},o,{status:"concluido"}):o;});});}
  return <div style={{padding:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h2 style={{fontWeight:900,fontSize:18,color:"#1a1a1a",fontFamily:"Georgia,serif"}}>Cozinha</h2>
      <span style={{background:fila.length>0?"#ef4444":"#22c55e",color:"#fff",fontSize:12,fontWeight:800,padding:"4px 12px",borderRadius:18}}>{fila.length} na fila</span>
    </div>
    {fila.length===0&&<div style={{textAlign:"center",padding:"40px 0"}}>
      <p style={{fontSize:14,color:"#ccc",fontWeight:600}}>Nenhum pedido em producao</p>
    </div>}
    {fila.map(function(o){return(
      <div key={o.id} style={{background:"#fff",borderRadius:13,border:"2px solid "+R,padding:"13px",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontWeight:900,fontSize:16,color:R,fontFamily:"Georgia,serif"}}>#{o.id}</span>
          <span style={{fontSize:12,color:"#888"}}>{o.nome} -- {o.criadoEm}</span>
        </div>
        {o.items.map(function(i){return(
          <div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BORDER}}>
            <span style={{fontWeight:800,fontSize:15,color:"#1a1a1a"}}>{i.qty}x</span>
            <span style={{flex:1,fontSize:14,marginLeft:10}}>{i.name}</span>
          </div>
        );})}
        <button onClick={function(){concluir(o.id);}} style={{width:"100%",marginTop:10,background:"#22c55e",color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontSize:14,fontWeight:800,cursor:"pointer"}}>Concluido</button>
      </div>
    );})}
  </div>;
}

function CardapioTab(props){
  var products=props.products,setProducts=props.setProducts;
  var _mo=useState(null),modal=_mo[0],setModal=_mo[1];
  var _fm=useState({}),form=_fm[0],setForm=_fm[1];
  var TAGS=[{v:"",l:"Sem tag"},{v:"Mais Pedido",l:"Mais Pedido",c:"#b91c1c"},{v:"Chef Indica",l:"Chef Indica",c:"#92400e"},{v:"Novo",l:"Novo",c:"#0369a1"}];

  function openNew(){setForm({cat:"prato",name:"",desc:"",price:"",tag:"",tagColor:"",img:"",stock:10,minStock:2,active:true,ingredients:[]});setModal("new");}
  function openEdit(p){setForm(Object.assign({},p,{price:String(p.price),stock:String(p.stock),minStock:String(p.minStock)}));setModal("edit");}
  function save(){
    var p=Object.assign({},form,{price:parseFloat(form.price)||0,stock:parseInt(form.stock)||0,minStock:parseInt(form.minStock)||2,id:modal==="new"?Date.now():form.id,tag:form.tag||null,tagColor:form.tagColor||null});
    if(modal==="new")setProducts(function(prev){return prev.concat([p]);});
    else setProducts(function(prev){return prev.map(function(x){return x.id===p.id?p:x;});});
    setModal(null);
  }
  function toggle(id){setProducts(function(prev){return prev.map(function(p){return p.id===id?Object.assign({},p,{active:!p.active}):p;});});}
  function remove(id){if(window.confirm("Remover produto?"))setProducts(function(prev){return prev.filter(function(p){return p.id!==id;});});}

  return <div style={{padding:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h2 style={{fontWeight:900,fontSize:18,color:"#1a1a1a",fontFamily:"Georgia,serif"}}>Cardapio</h2>
      <Btn sm onClick={openNew}>+ Produto</Btn>
    </div>
    {INIT_CATS.map(function(cat){
      var ps=products.filter(function(p){return p.cat===cat.id;});
      if(!ps.length)return null;
      return <div key={cat.id} style={{marginBottom:16}}>
        <p style={{fontSize:10,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>{cat.label}</p>
        {ps.map(function(p){return(
          <div key={p.id} style={{background:"#fff",borderRadius:11,border:"1px solid "+BORDER,padding:"10px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10,opacity:p.active?1:.5}}>
            <div style={{width:48,height:40,borderRadius:8,overflow:"hidden",flexShrink:0}}>
              <img src={p.img||"https://via.placeholder.com/48x40"} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:0,fontWeight:700,fontSize:13,color:"#1a1a1a"}}>{p.name}</p>
              <p style={{margin:"1px 0 0",fontWeight:800,fontSize:12,color:R}}>{fmt(p.price)} -- {p.stock} un</p>
            </div>
            <div style={{display:"flex",gap:5,flexShrink:0}}>
              <button onClick={function(){openEdit(p);}} style={{background:CREAM,border:"1px solid "+BORDER,borderRadius:7,padding:"5px 8px",fontSize:11,fontWeight:700,cursor:"pointer",color:"#555"}}>Edit</button>
              <button onClick={function(){toggle(p.id);}} style={{background:p.active?"#fef3c7":"#f0fdf4",border:"1px solid "+(p.active?"#fde68a":"#86efac"),borderRadius:7,padding:"5px 8px",fontSize:11,fontWeight:700,cursor:"pointer",color:p.active?"#92400e":"#15803d"}}>{p.active?"Off":"On"}</button>
              <button onClick={function(){remove(p.id);}} style={{background:"#fee2e2",border:"1px solid #fecaca",borderRadius:7,padding:"5px 8px",fontSize:11,fontWeight:700,cursor:"pointer",color:"#b91c1c"}}>Del</button>
            </div>
          </div>
        );})}
      </div>;
    })}
    <Modal open={!!modal} onClose={function(){setModal(null);}} title={modal==="new"?"Novo Produto":"Editar Produto"}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={{gridColumn:"1/-1"}}><InputF label="Nome do prato *" value={form.name||""} onChange={function(v){setForm(Object.assign({},form,{name:v}));}} placeholder="Ex: Escondidinho"/></div>
        <div style={{gridColumn:"1/-1"}}><InputF label="Descricao" value={form.desc||""} onChange={function(v){setForm(Object.assign({},form,{desc:v}));}} placeholder="Descricao do prato" textarea rows={2}/></div>
        <InputF label="Preco (R$) *" value={form.price||""} onChange={function(v){setForm(Object.assign({},form,{price:v}));}} type="number" placeholder="0.00"/>
        <InputF label="Estoque (un)" value={String(form.stock||0)} onChange={function(v){setForm(Object.assign({},form,{stock:v}));}} type="number"/>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:11,fontWeight:700,color:"#888",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Categoria</label>
          <select value={form.cat||"prato"} onChange={function(e){setForm(Object.assign({},form,{cat:e.target.value}));}} style={{width:"100%",border:"1.5px solid "+BORDER,borderRadius:10,padding:"10px 13px",fontSize:14,outline:"none",background:"#fff",marginBottom:12}}>
            {INIT_CATS.map(function(c){return <option key={c.id} value={c.id}>{c.label}</option>;})}
          </select>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:11,fontWeight:700,color:"#888",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Tag</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {TAGS.map(function(t){return(
              <button key={t.v} onClick={function(){setForm(Object.assign({},form,{tag:t.v||null,tagColor:t.c||null}));}}
                style={{padding:"5px 12px",borderRadius:18,border:"1.5px solid "+((form.tag||"")===(t.v)?R:BORDER),background:(form.tag||"")===(t.v)?"#fff5f5":"#fff",color:(form.tag||"")===(t.v)?R:"#666",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {t.l}
              </button>
            );})}
          </div>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <InputF label="URL da foto" value={form.img||""} onChange={function(v){setForm(Object.assign({},form,{img:v}));}} placeholder="https://..."/>
          {form.img&&<img src={form.img} alt="" style={{width:"100%",height:100,objectFit:"cover",borderRadius:10,marginTop:-6,marginBottom:12}} onError={function(e){e.target.style.display="none";}}/>}
          <div style={{background:"#eff6ff",borderRadius:10,padding:"9px 12px",marginBottom:12}}>
            <p style={{margin:"0 0 4px",fontSize:11,fontWeight:700,color:"#1d4ed8"}}>Como adicionar foto:</p>
            <p style={{margin:0,fontSize:11,color:"#1e40af",lineHeight:1.6}}>1. Fotografe o prato<br/>2. Abra imgbb.com<br/>3. Faca upload gratis<br/>4. Cole o link acima</p>
            <button onClick={function(){window.open("https://imgbb.com","_blank");}} style={{marginTop:7,background:"#1d4ed8",color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",width:"100%"}}>Abrir imgbb.com</button>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn full onClick={save} disabled={!form.name||!form.price}>Salvar</Btn>
        <Btn full outline onClick={function(){setModal(null);}}>Cancelar</Btn>
      </div>
    </Modal>
  </div>;
}

function CaixaTab(props){
  var orders=props.orders;
  var hoje=orders.filter(function(o){return o.status==="concluido"&&o.criadoEm&&o.criadoEm.startsWith(todayKey());});
  var totalHoje=hoje.reduce(function(s,o){return s+o.total;},0);
  var byPay={};
  hoje.forEach(function(o){var k=o.fiado?"fiado":(o.payment||"outro");byPay[k]=(byPay[k]||0)+o.total;});
  var fiadoHoje=byPay.fiado||0;
  var emCaixa=totalHoje-fiadoHoje;

  return <div style={{padding:14}}>
    <h2 style={{fontWeight:900,fontSize:18,color:"#1a1a1a",margin:"0 0 14px",fontFamily:"Georgia,serif"}}>Caixa -- {todayKey()}</h2>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      {[["Faturamento",fmt(totalHoje),"#22c55e"],["Pedidos",String(hoje.length),"#3b82f6"],["Em caixa",fmt(emCaixa),R],["Fiado",fmt(fiadoHoje),"#f59e0b"]].map(function(arr){
        return <div key={arr[0]} style={{background:"#fff",borderRadius:12,border:"1px solid "+BORDER,padding:"12px"}}>
          <p style={{margin:"0 0 3px",fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.4}}>{arr[0]}</p>
          <p style={{margin:0,fontWeight:900,fontSize:18,color:arr[2],fontFamily:"Georgia,serif"}}>{arr[1]}</p>
        </div>;
      })}
    </div>
    <div style={{background:"#fff",borderRadius:13,border:"1px solid "+BORDER,padding:13,marginBottom:12}}>
      <p style={{fontWeight:800,fontSize:13,margin:"0 0 8px"}}>Por forma de pagamento</p>
      {Object.entries(byPay).map(function(entry){
        var k=entry[0],v=entry[1];
        var labels={pix:"PIX",cartao_credito:"Credito",cartao_debito:"Debito",dinheiro:"Dinheiro",fiado:"Fiado"};
        return <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:12,color:"#555"}}>{labels[k]||k}</span>
          <span style={{fontWeight:700,fontSize:12}}>{fmt(v)}</span>
        </div>;
      })}
      {Object.keys(byPay).length===0&&<p style={{fontSize:12,color:"#ccc"}}>Nenhum pedido hoje</p>}
    </div>
    <div style={{background:"#fff",borderRadius:13,border:"1px solid "+BORDER,padding:13}}>
      <p style={{fontWeight:800,fontSize:13,margin:"0 0 8px"}}>Ultimos pedidos</p>
      {hoje.slice(-5).reverse().map(function(o){return(
        <div key={o.id} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:12,color:"#555"}}>#{o.id} {o.nome}</span>
          <span style={{fontWeight:700,fontSize:12,color:R}}>{fmt(o.total)}</span>
        </div>
      );})}
      {hoje.length===0&&<p style={{fontSize:12,color:"#ccc"}}>Nenhum pedido concluido hoje</p>}
    </div>
  </div>;
}

function FiadoTab(props){
  var profs=props.profs,orders=props.orders;
  var fiadoAberto=orders.filter(function(o){return o.fiado&&o.status!=="cancelado";});
  var porProf={};
  fiadoAberto.forEach(function(o){if(!o.profFiado)return;if(!porProf[o.profFiado])porProf[o.profFiado]={orders:[],total:0};porProf[o.profFiado].orders.push(o);porProf[o.profFiado].total+=o.total;});
  var lista=Object.entries(porProf).sort(function(a,b){return b[1].total-a[1].total;});
  return <div style={{padding:14}}>
    <h2 style={{fontWeight:900,fontSize:18,color:"#1a1a1a",margin:"0 0 12px",fontFamily:"Georgia,serif"}}>Fiado em aberto</h2>
    {!lista.length&&<p style={{textAlign:"center",color:"#ccc",padding:"30px 0",fontSize:14}}>Nenhum fiado em aberto</p>}
    {lista.map(function(entry){
      var nome=entry[0],dados=entry[1];
      var profObj=profs.find(function(p){return p.name===nome;});
      return <div key={nome} style={{background:"#fff",borderRadius:13,border:"1px solid "+BORDER,padding:"12px 14px",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <p style={{margin:0,fontWeight:800,fontSize:14}}>{nome}</p>
            <p style={{margin:"2px 0 0",fontSize:11,color:"#aaa"}}>{dados.orders.length} pedidos</p>
          </div>
          <p style={{margin:0,fontWeight:900,fontSize:16,color:R,fontFamily:"Georgia,serif"}}>{fmt(dados.total)}</p>
        </div>
        {dados.orders.slice(-3).map(function(o){return(
          <div key={o.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3,color:"#666"}}>
            <span>{o.criadoEm} -- {o.items.map(function(i){return i.qty+"x "+i.name;}).join(", ").slice(0,35)}</span>
            <span style={{fontWeight:700,color:R,flexShrink:0,marginLeft:6}}>{fmt(o.total)}</span>
          </div>
        );})}
        {profObj&&profObj.telefone&&<button onClick={function(){abrirWpp(profObj.telefone,gerarMsgFiado(profObj,dados.orders[dados.orders.length-1],dados.total));}} style={{width:"100%",marginTop:8,background:"#25D366",color:"#fff",border:"none",borderRadius:9,padding:"8px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Enviar saldo WPP</button>}
        {(!profObj||!profObj.telefone)&&<p style={{fontSize:10,color:"#aaa",textAlign:"center",margin:"6px 0 0"}}>Cadastre o telefone na aba Equipe</p>}
      </div>;
    })}
  </div>;
}

function QuinzenaTab(props){
  var profs=props.profs,orders=props.orders;
  var hoje=new Date(),dia=hoje.getDate();
  var inicioQ=new Date(hoje.getFullYear(),hoje.getMonth(),dia<=15?1:16);
  var fimQ=new Date(hoje.getFullYear(),hoje.getMonth(),dia<=15?15:new Date(hoje.getFullYear(),hoje.getMonth()+1,0).getDate(),23,59,59);
  var quinzenaLabel=dia<=15?"1a quinzena (1-15)":"2a quinzena (16-"+new Date(hoje.getFullYear(),hoje.getMonth()+1,0).getDate()+")";

  function isNaQ(o){
    if(!o.criadoEm)return false;
    var partes=o.criadoEm.split(" ")[0].split("/");
    if(partes.length<3)return false;
    var d=new Date(parseInt(partes[2]),parseInt(partes[1])-1,parseInt(partes[0]));
    return d>=inicioQ&&d<=fimQ;
  }

  var metricas=profs.map(function(p){
    var fiados=orders.filter(function(o){return o.fiado&&o.profFiado===p.name&&o.status!=="cancelado"&&isNaQ(o);});
    var total=fiados.reduce(function(s,o){return s+o.total;},0);
    var desc=p.desconto||20;
    return Object.assign({},p,{fiadosQ:fiados,totalQ:total,desconto:desc,descValor:total*(desc/100),liquido:total-(total*(desc/100))});
  }).filter(function(p){return p.totalQ>0;});

  return <div style={{padding:14}}>
    <h2 style={{fontWeight:900,fontSize:18,color:"#1a1a1a",margin:"0 0 4px",fontFamily:"Georgia,serif"}}>Quinzena</h2>
    <p style={{fontSize:11,color:"#888",margin:"0 0 12px"}}>{quinzenaLabel}</p>
    {!metricas.length&&<p style={{textAlign:"center",color:"#ccc",padding:"30px 0",fontSize:14}}>Nenhum fiado nesta quinzena</p>}
    {metricas.length>0&&<div style={{background:R,borderRadius:12,padding:"12px 14px",marginBottom:12,color:"#fff"}}>
      <p style={{margin:"0 0 2px",fontSize:10,fontWeight:700,opacity:.75,textTransform:"uppercase",letterSpacing:.5}}>Total a descontar</p>
      <p style={{margin:0,fontWeight:900,fontSize:22,fontFamily:"Georgia,serif"}}>{fmt(metricas.reduce(function(s,p){return s+p.liquido;},0))}</p>
    </div>}
    {metricas.map(function(p){return(
      <div key={p.id} style={{background:"#fff",borderRadius:13,border:"1px solid "+BORDER,padding:"12px 14px",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <p style={{margin:0,fontWeight:800,fontSize:14}}>{p.name}</p>
            <p style={{margin:"2px 0 0",fontSize:11,color:"#aaa"}}>{p.fiadosQ.length} pedidos</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{margin:0,fontWeight:900,fontSize:16,color:R,fontFamily:"Georgia,serif"}}>{fmt(p.liquido)}</p>
            <p style={{margin:"2px 0 0",fontSize:10,color:"#aaa"}}>a descontar</p>
          </div>
        </div>
        <div style={{background:CREAM,borderRadius:9,padding:"8px 10px",marginBottom:10}}>
          {[["Consumo bruto",fmt(p.totalQ),"#555"],["Desconto "+p.desconto+"%","-"+fmt(p.descValor),"#22c55e"],["Desconto na folha",fmt(p.liquido),R]].map(function(arr,i){return(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:i<2?3:0,borderTop:i===2?"1px solid "+BORDER:"none",paddingTop:i===2?5:0,marginTop:i===2?3:0}}>
              <span style={{fontWeight:i===2?800:400,color:"#555"}}>{arr[0]}</span>
              <span style={{fontWeight:700,color:arr[2]}}>{arr[1]}</span>
            </div>
          );})}
        </div>
        {p.telefone&&<button onClick={function(){abrirWpp(p.telefone,gerarMsgQuinzena(p,p.fiadosQ,p.desconto));}} style={{width:"100%",background:"#25D366",color:"#fff",border:"none",borderRadius:9,padding:"9px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Enviar resumo WPP</button>}
        {!p.telefone&&<p style={{fontSize:10,color:"#aaa",textAlign:"center",margin:0}}>Sem telefone cadastrado</p>}
      </div>
    );})}
  </div>;
}

function EquipeTab(props){
  var profs=props.profs,setProfs=props.setProfs,orders=props.orders;
  var _mo=useState(null),modal=_mo[0],setModal=_mo[1];
  var _fm=useState({}),form=_fm[0],setForm=_fm[1];
  var _tb=useState("lista"),tab=_tb[0],setTab=_tb[1];

  function openEdit(p){setForm(Object.assign({},p));setModal("edit");}
  function openNew(){setForm({name:"",active:true,telefone:"",desconto:20});setModal("new");}
  function save(){
    var p=Object.assign({},form,{id:modal==="new"?Date.now():form.id,desconto:parseInt(form.desconto)||20});
    if(modal==="new")setProfs(function(prev){return prev.concat([p]);});
    else setProfs(function(prev){return prev.map(function(x){return x.id===p.id?p:x;});});
    setModal(null);
  }

  var ranking=profs.map(function(p){
    var ps=orders.filter(function(o){return o.status==="concluido"&&o.profissional===p.name;});
    return Object.assign({},p,{pedidos:ps.length,total:ps.reduce(function(s,o){return s+o.total;},0)});
  }).sort(function(a,b){return b.total-a.total;});

  return <div style={{padding:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <h2 style={{fontWeight:900,fontSize:18,color:"#1a1a1a",fontFamily:"Georgia,serif"}}>Equipe</h2>
      <Btn sm onClick={openNew}>+ Profissional</Btn>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:12}}>
      {[["lista","Equipe"],["ranking","Ranking"]].map(function(arr){
        var a=tab===arr[0];
        return <button key={arr[0]} onClick={function(){setTab(arr[0]);}} style={{flex:1,padding:"7px 0",borderRadius:10,border:"1.5px solid "+(a?R:BORDER),background:a?R:"#fff",color:a?"#fff":"#666",fontSize:12,fontWeight:800,cursor:"pointer"}}>{arr[1]}</button>;
      })}
    </div>
    {tab==="lista"&&profs.map(function(p){return(
      <div key={p.id} style={{background:"#fff",borderRadius:11,border:"1px solid "+BORDER,padding:"10px 12px",marginBottom:7,display:"flex",alignItems:"center",gap:10,opacity:p.active?1:.5}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:CREAM,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:R,flexShrink:0}}>{p.name[0]}</div>
        <div style={{flex:1}}>
          <p style={{margin:0,fontWeight:700,fontSize:13}}>{p.name}</p>
          <p style={{margin:"1px 0 0",fontSize:10,color:"#aaa"}}>{p.telefone||"Sem telefone"} -- Desc {p.desconto||20}%</p>
        </div>
        <button onClick={function(){openEdit(p);}} style={{background:CREAM,border:"1px solid "+BORDER,borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",color:"#555"}}>Edit</button>
      </div>
    );})}
    {tab==="ranking"&&ranking.map(function(p,idx){return(
      <div key={p.id} style={{background:"#fff",borderRadius:11,border:"1px solid "+BORDER,padding:"10px 12px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontWeight:900,fontSize:16,color:idx<3?GOLD:"#ccc",width:24,flexShrink:0}}>#{idx+1}</span>
        <div style={{flex:1}}>
          <p style={{margin:0,fontWeight:700,fontSize:13}}>{p.name}</p>
          <p style={{margin:"1px 0 0",fontSize:11,color:"#aaa"}}>{p.pedidos} pedidos</p>
        </div>
        <p style={{margin:0,fontWeight:900,fontSize:14,color:R,fontFamily:"Georgia,serif"}}>{fmt(p.total)}</p>
      </div>
    );})}
    <Modal open={!!modal} onClose={function(){setModal(null);}} title={modal==="new"?"Nova Profissional":"Editar Profissional"}>
      <InputF label="Nome *" value={form.name||""} onChange={function(v){setForm(Object.assign({},form,{name:v}));}} placeholder="Nome da profissional"/>
      <InputF label="Telefone WhatsApp" value={form.telefone||""} onChange={function(v){setForm(Object.assign({},form,{telefone:v}));}} placeholder="(11) 99999-9999" hint="Para receber notificacoes de fiado"/>
      <InputF label="Desconto (%)" value={String(form.desconto||20)} onChange={function(v){setForm(Object.assign({},form,{desconto:v}));}} type="number"/>
      <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13,fontWeight:700,color:"#555",marginBottom:16}}>
        <input type="checkbox" checked={form.active!==false} onChange={function(e){setForm(Object.assign({},form,{active:e.target.checked}));}} style={{width:14,height:14}}/>
        Ativa
      </label>
      <div style={{display:"flex",gap:8}}><Btn full onClick={save} disabled={!form.name}>Salvar</Btn><Btn full outline onClick={function(){setModal(null);}}>Cancelar</Btn></div>
    </Modal>
  </div>;
}

function HorariosTab(props){
  var horarios=props.horarios,setHorarios=props.setHorarios,fechamentoManual=props.fechamentoManual,setFechamentoManual=props.setFechamentoManual;
  function updDia(dia,campo,valor){setHorarios(function(prev){var n=Object.assign({},prev);n[dia]=Object.assign({},n[dia],{[campo]:valor});return n;});}
  return <div style={{padding:14}}>
    <h2 style={{fontWeight:900,fontSize:18,color:"#1a1a1a",margin:"0 0 14px",fontFamily:"Georgia,serif"}}>Horarios</h2>
    <div style={{background:fechamentoManual?"#fee2e2":"#f0fdf4",border:"1.5px solid "+(fechamentoManual?"#fecaca":"#22c55e"),borderRadius:13,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <p style={{margin:0,fontWeight:800,fontSize:13,color:fechamentoManual?"#b91c1c":"#15803d"}}>{fechamentoManual?"Fechado manualmente":"Aberto"}</p>
        <p style={{margin:"2px 0 0",fontSize:11,color:"#888"}}>Controle de emergencia</p>
      </div>
      <button onClick={function(){setFechamentoManual(!fechamentoManual);}} style={{background:fechamentoManual?"#22c55e":"#ef4444",color:"#fff",border:"none",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:800,cursor:"pointer"}}>
        {fechamentoManual?"Reabrir":"Fechar agora"}
      </button>
    </div>
    <div style={{background:"#fff",borderRadius:13,border:"1px solid "+BORDER,overflow:"hidden",marginBottom:14}}>
      {Object.entries(horarios).map(function(entry){
        var dia=parseInt(entry[0]),h=entry[1];
        var isHoje=new Date().getDay()===dia;
        return <div key={dia} style={{padding:"11px 14px",borderBottom:"1px solid "+BORDER,background:isHoje?"#fafaf8":"#fff"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:68,flexShrink:0}}>
              <span style={{fontSize:12,fontWeight:isHoje?800:600,color:isHoje?R:"#555"}}>{DIAS[dia]}</span>
              {isHoje&&<span style={{fontSize:9,color:R,fontWeight:700,marginLeft:4}}>hoje</span>}
            </div>
            <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",flexShrink:0}}>
              <input type="checkbox" checked={h.aberto||false} onChange={function(e){updDia(dia,"aberto",e.target.checked);}} style={{width:15,height:15,accentColor:R}}/>
              <span style={{fontSize:11,color:"#666",fontWeight:h.aberto?700:400}}>{h.aberto?"Aberto":"Fechado"}</span>
            </label>
            {h.aberto&&<div style={{display:"flex",alignItems:"center",gap:6,flex:1}}>
              <input type="time" value={h.abre||""} onChange={function(e){updDia(dia,"abre",e.target.value);}} style={{border:"1px solid "+BORDER,borderRadius:7,padding:"4px 7px",fontSize:12,outline:"none",width:80}}/>
              <span style={{fontSize:11,color:"#aaa"}}>ate</span>
              <input type="time" value={h.fecha||""} onChange={function(e){updDia(dia,"fecha",e.target.value);}} style={{border:"1px solid "+BORDER,borderRadius:7,padding:"4px 7px",fontSize:12,outline:"none",width:80}}/>
            </div>}
          </div>
        </div>;
      })}
    </div>
    <div style={{background:"#fff",borderRadius:13,border:"1px solid "+BORDER,padding:13}}>
      <p style={{fontWeight:700,fontSize:13,margin:"0 0 10px"}}>Links do restaurante</p>
      <div style={{display:"flex",gap:8}}>
        <a href="https://wa.me/5511914195567" target="_blank" rel="noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"#25D366",color:"#fff",padding:"10px 0",borderRadius:10,fontSize:12,fontWeight:700,textDecoration:"none"}}>WhatsApp</a>
        <a href="https://instagram.com/nobrebistro" target="_blank" rel="noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"#e1306c",color:"#fff",padding:"10px 0",borderRadius:10,fontSize:12,fontWeight:700,textDecoration:"none"}}>Instagram</a>
      </div>
    </div>
  </div>;
}

function Admin(props){
  var products=props.products,setProducts=props.setProducts,orders=props.orders,setOrders=props.setOrders,profs=props.profs,setProfs=props.setProfs,horarios=props.horarios,setHorarios=props.setHorarios,fechamentoManual=props.fechamentoManual,setFechamentoManual=props.setFechamentoManual,nivel=props.nivel,onLogout=props.onLogout;
  var _tb=useState("balcao"),tab=_tb[0],setTab=_tb[1];
  var pending=orders.filter(function(o){return o.status==="pendente"||o.status==="aguardando_pagamento";}).length;
  var cooking=orders.filter(function(o){return o.status==="em_curso";}).length;
  var TABS_GERENTE=[["balcao","Balcao",0],["pedidos","Pedidos",pending],["cozinha","Cozinha",cooking],["cardapio","Cardapio",0],["caixa","Caixa",0],["fiado","Fiado",0],["quinzena","Quinzena",0],["equipe","Equipe",0],["horarios","Horarios",0]];
  var TABS_ATENDENTE=[["balcao","Balcao",0],["pedidos","Pedidos",pending],["cozinha","Cozinha",cooking]];
  var tabs=nivel==="gerente"?TABS_GERENTE:TABS_ATENDENTE;

  return <div style={{background:BG,minHeight:"100vh",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
    <style>{CSS}</style>
    <div style={{background:R,padding:"11px 15px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      <div>
        <p style={{margin:0,color:"rgba(255,255,255,.65)",fontSize:9,fontWeight:700,letterSpacing:.5,textTransform:"uppercase"}}>Nobre Bistro</p>
        <p style={{margin:0,color:"#fff",fontSize:15,fontWeight:900,fontFamily:"Georgia,serif"}}>Painel Admin</p>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{background:"rgba(255,255,255,.15)",color:"rgba(255,255,255,.85)",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:18,textTransform:"uppercase"}}>{nivel}</span>
        <button onClick={onLogout} style={{background:"rgba(255,255,255,.18)",border:"none",color:"#fff",fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:9,cursor:"pointer"}}>Sair</button>
      </div>
    </div>
    <div style={{display:"flex",overflowX:"auto",gap:0,background:"#fff",borderBottom:"1px solid "+BORDER,flexShrink:0}}>
      {tabs.map(function(arr){
        var id=arr[0],label=arr[1],badge=arr[2];
        var a=tab===id;
        return <button key={id} onClick={function(){setTab(id);}} style={{flexShrink:0,padding:"10px 12px",border:"none",borderBottom:"2.5px solid "+(a?R:"transparent"),background:"#fff",color:a?R:"#666",fontSize:11,fontWeight:a?800:600,cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:3}}>
          {label}{badge>0&&<Badge count={badge}/>}
        </button>;
      })}
    </div>
    <div style={{flex:1,overflowY:"auto"}}>
      {tab==="balcao"&&<BalcaoTab products={products} setProducts={setProducts} profs={profs} orders={orders} setOrders={setOrders}/>}
      {tab==="pedidos"&&<PedidosTab orders={orders} setOrders={setOrders}/>}
      {tab==="cozinha"&&<CozinhaTab orders={orders} setOrders={setOrders}/>}
      {tab==="cardapio"&&(nivel==="gerente"?<CardapioTab products={products} setProducts={setProducts}/>:<AcessoBloqueado/>)}
      {tab==="caixa"&&(nivel==="gerente"?<CaixaTab orders={orders}/>:<AcessoBloqueado/>)}
      {tab==="fiado"&&(nivel==="gerente"?<FiadoTab profs={profs} orders={orders}/>:<AcessoBloqueado/>)}
      {tab==="quinzena"&&(nivel==="gerente"?<QuinzenaTab profs={profs} orders={orders}/>:<AcessoBloqueado/>)}
      {tab==="equipe"&&(nivel==="gerente"?<EquipeTab profs={profs} setProfs={setProfs} orders={orders}/>:<AcessoBloqueado/>)}
      {tab==="horarios"&&(nivel==="gerente"?<HorariosTab horarios={horarios} setHorarios={setHorarios} fechamentoManual={fechamentoManual} setFechamentoManual={setFechamentoManual}/>:<AcessoBloqueado/>)}
    </div>
  </div>;
}

function AcessoBloqueado(){
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 24px",textAlign:"center"}}>
    <div style={{width:48,height:48,borderRadius:"50%",background:"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
    </div>
    <h3 style={{fontWeight:800,fontSize:16,color:"#1a1a1a",margin:"0 0 6px"}}>Acesso Restrito</h3>
    <p style={{fontSize:13,color:"#888",margin:0}}>Area exclusiva para o gerente.</p>
  </div>;
}

function Login(props){
  var _p=useState(""),pass=_p[0],setPass=_p[1];
  var _e=useState(false),err=_e[0],setErr=_e[1];
  function go(){
    if(pass==="nobre2025"){props.onLogin("gerente");}
    else if(pass==="balcao"){props.onLogin("atendente");}
    else if(pass==="cozinha"){props.onLogin("cozinha");}
    else{setErr(true);setTimeout(function(){setErr(false);},2000);}
    setPass("");
  }
  return <div style={{background:CREAM,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:22,maxWidth:480,margin:"0 auto"}}>
    <style>{CSS}</style>
    <div style={{width:"100%",maxWidth:300}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:12,fontWeight:700,letterSpacing:4,color:R,textTransform:"uppercase"}}>Nobre</div>
        <div style={{height:1,background:R,margin:"4px 34px 14px"}}/>
        <h2 style={{fontSize:18,fontWeight:900,color:"#1a1a1a",margin:0}}>Admin</h2>
      </div>
      <div style={{background:"#fff",borderRadius:16,padding:22,border:"1px solid "+BORDER,boxShadow:"0 4px 24px rgba(0,0,0,.07)"}}>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:"#888",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Senha</label>
          <input type="password" value={pass} onChange={function(e){setPass(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")go();}} placeholder="Digite sua senha" autoFocus
            style={{width:"100%",border:"1.5px solid "+(err?"#fca5a5":BORDER),borderRadius:10,padding:"11px 13px",fontSize:16,outline:"none",boxSizing:"border-box",fontFamily:"inherit",letterSpacing:2}}/>
          {err&&<p style={{color:"#ef4444",fontSize:12,margin:"5px 0 0",fontWeight:600}}>Senha incorreta</p>}
        </div>
        <button onClick={go} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:11,padding:"13px 0",fontSize:14,fontWeight:800,cursor:"pointer"}}>Entrar</button>
      </div>
      <div style={{marginTop:16,background:"#fff",borderRadius:12,padding:"12px 14px",border:"1px solid "+BORDER}}>
        <p style={{margin:"0 0 7px",fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.5}}>Niveis</p>
        {[[R,"Gerente","nobre2025"],["#3b82f6","Atendente","balcao"],["#22c55e","Cozinha","cozinha"]].map(function(arr){
          return <div key={arr[1]} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:arr[0],flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:700,color:"#1a1a1a"}}>{arr[1]}</span>
            <span style={{fontSize:11,color:"#aaa"}}>-- senha: {arr[2]}</span>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

export default function App(){
  var _au=useState(false),auth=_au[0],setAuth=_au[1];
  var _nv=useState(null),nivel=_nv[0],setNivel=_nv[1];
  var _pr=useState([]),products=_pr[0],setProducts=_pr[1];
  var _or=useState([]),orders=_or[0],setOrders=_or[1];
  var _pf=useState(INIT_PROFS),profs=_pf[0],setProfs=_pf[1];
  var _hr=useState(HORARIOS_DEFAULT),horarios=_hr[0],setHorarios=_hr[1];
  var _fm=useState(false),fechamentoManual=_fm[0],setFechamentoManual=_fm[1];
  var _ld=useState(true),loading=_ld[0],setLoading=_ld[1];
  var _sv=useState(false),saving=_sv[0],setSaving=_sv[1];

  useEffect(function(){
    (async function(){
      var p=await store.get("nb_bA_products");
      var o=await store.get("nb_bA_orders");
      var pf=await store.get("nb_bA_profs");
      var h=await store.get("nb_bA_horarios");
      var fm=await store.get("nb_bA_fechamento");
      setProducts(p&&p.length?p:INIT_PRODUCTS);
      if(o)setOrders(o);
      if(pf&&pf.length)setProfs(pf);
      if(h)setHorarios(h);
      if(fm!==null)setFechamentoManual(!!fm);
      setLoading(false);
    })();
  },[]);

  useEffect(function(){if(!loading){setSaving(true);store.set("nb_bA_products",products).then(function(){setSaving(false);});}}, [products]);
  useEffect(function(){if(!loading)store.set("nb_bA_orders",orders);},[orders]);
  useEffect(function(){if(!loading)store.set("nb_bA_profs",profs);},[profs]);
  useEffect(function(){if(!loading)store.set("nb_bA_horarios",horarios);},[horarios]);
  useEffect(function(){if(!loading)store.set("nb_bA_fechamento",fechamentoManual);},[fechamentoManual]);

  if(loading)return <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:CREAM}}>
    <style>{CSS}</style>
    <div style={{fontFamily:"Georgia,serif",fontSize:13,letterSpacing:3,color:R,marginBottom:12,textTransform:"uppercase"}}>Nobre Bistro</div>
    <div style={{width:28,height:28,border:"2.5px solid "+BORDER,borderTop:"2.5px solid "+R,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
    <p style={{marginTop:12,fontSize:11,color:"#aaa"}}>Carregando dados...</p>
  </div>;

  if(!auth)return <Login onLogin={function(n){setAuth(true);setNivel(n);}}/>;

  if(nivel==="cozinha")return <div style={{background:BG,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
    <style>{CSS}</style>
    <div style={{background:"#1d4ed8",padding:"11px 15px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <p style={{margin:0,color:"#fff",fontSize:15,fontWeight:900,fontFamily:"Georgia,serif"}}>Cozinha</p>
      <button onClick={function(){setAuth(false);setNivel(null);}} style={{background:"rgba(255,255,255,.18)",border:"none",color:"#fff",fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:9,cursor:"pointer"}}>Sair</button>
    </div>
    <CozinhaTab orders={orders} setOrders={setOrders}/>
  </div>;

  return <Admin products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} profs={profs} setProfs={setProfs} horarios={horarios} setHorarios={setHorarios} fechamentoManual={fechamentoManual} setFechamentoManual={setFechamentoManual} nivel={nivel} onLogout={function(){setAuth(false);setNivel(null);}}/>;
}
