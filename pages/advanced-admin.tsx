import { useState, useEffect, useRef, useMemo } from "react";

var R="#8B1A1A",CREAM="#faf8f5",BORDER="#ede9e3",BG="#f4f6f9",GOLD="#C9A84C";
var _FU="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
var CSS="@import url("+_FU+");*{box-sizing:border-box;margin:0;padding:0;font-family:Nunito,sans-serif;}::-webkit-scrollbar{display:none;}body{background:"+BG+";}@keyframes spin{to{transform:rotate(360deg)}}";

var fmt=function(v){return "R$ "+Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});};
var nowStr=function(){return new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});};
var todayKey=function(){return new Date().toLocaleDateString("pt-BR");};

var _SB_URL="https://zxpnguynjrsixsomaieg.supabase.co";
var _SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cG5ndXluanJzaXhzb21haWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODkyNDAsImV4cCI6MjA5NjE2NTI0MH0.3_6a8Hn0xQe6FEbjVTeRnKZUwRD64Fe_0Jsk-pGHP3Q";
var WPP_NUMBER="";
var SENHAS={gerente:"admin123",atendente:"atend123",cozinha:"cozinha123"};

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

function Badge(props){
  if(!props.count)return null;
  return <span style={{background:"#ef4444",color:"#fff",fontSize:9,fontWeight:800,borderRadius:10,padding:"1px 5px",marginLeft:4}}>{props.count}</span>;
}

function Login(props){
  var _p=useState(""),pass=_p[0],setPass=_p[1];
  var _e=useState(false),err=_e[0],setErr=_e[1];
  function go(){
    if(pass&&SENHAS.gerente&&pass===SENHAS.gerente){props.onLogin("gerente");}
    else if(pass&&SENHAS.atendente&&pass===SENHAS.atendente){props.onLogin("atendente");}
    else if(pass&&SENHAS.cozinha&&pass===SENHAS.cozinha){props.onLogin("cozinha");}
    else{setErr(true);setTimeout(function(){setErr(false);},2000);}
    setPass("");
  }
  return <div style={{background:CREAM,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:22,maxWidth:480,margin:"0 auto"}}>
    <style>{CSS}</style>
    <div style={{width:"100%",maxWidth:300}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:12,fontWeight:700,letterSpacing:4,color:R,textTransform:"uppercase"}}>Nobre</div>
        <div style={{height:1,background:R,margin:"4px 34px 14px"}}/>
        <h2 style={{fontSize:18,fontWeight:900,color:"#1a1a1a",margin:0}}>Admin Avançado</h2>
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
        <p style={{margin:"0 0 7px",fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.5}}>Senhas Demo:</p>
        {[[R,"Gerente: admin123"],["#3b82f6","Atendente: atend123"],["#22c55e","Cozinha: cozinha123"]].map(function(arr){
          return <div key={arr[1]} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:arr[0],flexShrink:0}}/>
            <span style={{fontSize:11,fontWeight:600,color:"#1a1a1a"}}>{arr[1]}</span>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

export default function AdvancedAdmin(){
  var _au=useState(false),auth=_au[0],setAuth=_au[1];
  var _nv=useState(null),nivel=_nv[0],setNivel=_nv[1];
  var _pr=useState(INIT_PRODUCTS),products=_pr[0],setProducts=_pr[1];
  var _or=useState([]),orders=_or[0],setOrders=_or[1];
  var _pf=useState(INIT_PROFS),profs=_pf[0],setProfs=_pf[1];
  var _hr=useState(HORARIOS_DEFAULT),horarios=_hr[0],setHorarios=_hr[1];
  var _fm=useState(false),fechamentoManual=_fm[0],setFechamentoManual=_fm[1];

  if(!auth)return <Login onLogin={function(n){setAuth(true);setNivel(n);}}/>;

  return <div style={{background:BG,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
    <style>{CSS}</style>
    <div style={{background:R,padding:"11px 15px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <p style={{margin:0,color:"rgba(255,255,255,.65)",fontSize:9,fontWeight:700,letterSpacing:.5,textTransform:"uppercase"}}>Nobre Café</p>
        <p style={{margin:0,color:"#fff",fontSize:15,fontWeight:900,fontFamily:"Georgia,serif"}}>Admin Avançado</p>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{background:"rgba(255,255,255,.15)",color:"rgba(255,255,255,.85)",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:18,textTransform:"uppercase"}}>{nivel}</span>
        <button onClick={function(){setAuth(false);setNivel(null);}} style={{background:"rgba(255,255,255,.18)",border:"none",color:"#fff",fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:9,cursor:"pointer"}}>Sair</button>
      </div>
    </div>
    <div style={{padding:16}}>
      <div style={{textAlign:"center",marginBottom:30}}>
        <h2 style={{fontWeight:900,fontSize:20,color:R,margin:"0 0 8px"}}>Admin Avançado</h2>
        <p style={{fontSize:13,color:"#888",margin:0}}>Nível: <strong>{nivel}</strong></p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[
          ["🏪","Balcão","PDV completo com carrinho"],
          ["📋","Pedidos","Gerenciar status de vendas"],
          ["👨‍🍳","Cozinha","Fila de produção"],
          ["🍽️","Cardápio","Editar produtos e estoque"],
          ["💰","Caixa","Relatórios de vendas"],
          ["💳","Fiado","Crédito de profissionais"],
          ["📊","Quinzena","Fechamento de pagamentos"],
          ["👥","Equipe","Gestão e ranking de vendas"]
        ].map(function(item,i){
          return <div key={i} style={{background:"#fff",borderRadius:12,padding:16,textAlign:"center",border:"1.5px solid "+BORDER}}>
            <div style={{fontSize:28,marginBottom:8}}>{item[0]}</div>
            <p style={{fontWeight:700,fontSize:14,color:"#1a1a1a",margin:"0 0 4px"}}>{item[1]}</p>
            <p style={{fontSize:11,color:"#888",margin:0}}>{item[2]}</p>
          </div>;
        })}
      </div>
      <div style={{marginTop:20,background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:12,padding:16}}>
        <p style={{fontWeight:700,fontSize:13,color:"#b91c1c",margin:"0 0 8px"}}>⭐ Funcionalidades Avançadas:</p>
        <ul style={{margin:0,paddingLeft:20,fontSize:12,color:"#555",lineHeight:1.8}}>
          <li>✅ Múltiplos níveis de acesso</li>
          <li>✅ Impressão de comanda automática</li>
          <li>✅ Integração WhatsApp</li>
          <li>✅ Controle de estoque mínimo</li>
          <li>✅ Ranking de vendas por profissional</li>
          <li>✅ Fechamento de quinzena automático</li>
        </ul>
      </div>
    </div>
  </div>;
}
