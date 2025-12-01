import { ClassDataRectif } from './classes/ClassDataRectif.js';
$(()=>{
	
	let myDbMan=new ClassDataRectif();
	setTimeout(async()=>{
		let r=await myDbMan.testConnection()
		console.log("Connexion DB :"+r.data.connection.authorized)
	},100)
	
	let card=document.createElement('my-card')
	document.body.appendChild(card)
})