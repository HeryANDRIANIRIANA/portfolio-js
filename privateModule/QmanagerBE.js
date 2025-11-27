class QmanagerBE{
	constructor( odbc, res, req, options={}	){
		const{
			CIN="",
			mois="",
			conStr={},
			dependencyes=[]
		}=options;

		this.CIN=CIN;
		this.mois=mois;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.db=new this.dependencyes.Db()
		this.conStr=this.db.cs;
		this.fs=this.dependencyes["fs"];
		// console.log(this.dependencyes);
	}
	
	async testConnexion(){
		try{
			let con=await this.odbc.createConnection(this.conStr);
			// console.log(con);
			return con
		// console.log(con);
		}catch(err){
			console.log(err);
		}
	}
	
	async getData(options={}){
		const{q=""
		}=options;
		// console.log(q);
		var tableStructureBE=this.dependencyes.tableStructureBE;
		const mytableStructure=new tableStructureBE( this.odbc, this.res, this.req, {conStr:this.conStr, mois:this.mois, CIN:this.CIN, idAnnee:this.idAnnee, dependencyes:this.dependencyes}	);
		
		try{
			let con= await this.odbc.createConnection(this.conStr);
			let r=await con.query(q);
			con.close()
			// console.log(r)
			/* let r1={data:[],structure:{}};
			r1.structure=await mytableStructure.getTableStructurefromR({ars:r});
			let i=0
			while(typeof(r[i])!="undefined"){
				// console.log(r[i])
				r1.data.push(r[i]);
				i++;
			} */
			// console.log(r1);
			return r;
			
		}catch(err){
			throw err
		}
		
		// 
	}
			
	async prepareInsert(a, options={}){
		const{
			struct={},
			tableKey="NumOrdreAvance",
			tableName="AVANCE"
		}=options;
		// console.log(struct);
		const avStruct=(Object.keys(struct).length===0)?await this.getData():struct;
		// console.log(avStruct.structure.colDesc);
		// console.log(avStruct);
		let colDesc=avStruct.structure.colDesc;
		// console.log("colDesc="+colDesc)
		let s1="";
		let s2="";
		let s0="";
		let arq=[];
		// console.log(a);
		for(let i=0; i<a.length; i++){
			let ar0=[];
			let ar1=[];
			for(let o of Object.keys(a[i])){
				 // console.log(colDesc[o]["dataType"])
				if(typeof(colDesc[o])!="undefined" && o!=tableKey && o!="NomPrenom"){
					ar0.push(o);
					let v2=(colDesc[o]["dataType"]<0)?"'"+a[i][o]+"'":a[i][o];
					ar1.push(v2);
				}
			}
			s1=ar0.toString();
			s2=ar1.toString();
			s0="INSERT INTO "+tableName+" ( "+s1+" ) VALUES ( "+s2+" ) ;"
			// console.log(s0)
			arq.push(s0);
		}
		return arq;
	}
		
	async prepareUpdate(rows, options={}){
		const{tableName="AVANCE", id="NumOrdreAvance", colNames=[]}=options;
		try{
			let ar=[]
			for(let o of rows){
				let arKs=(colNames.length>0)?colNames:Object.keys(o);
				let s1="UPDATE "+tableName+" SET ";
				let ksMaped=arKs.map((k)=>{
					let s="";
					// if(k!==id && k!=="undefined"){
						
						let v=(typeof(o[k])=="string")?"'"+o[k]+"'":o[k] ;
						s=" "+tableName+"."+k+"="+v
						return s;
					// }
					
				} );
				// console.log(arKs)
				s1=(typeof(o[id])!=="string")?s1+ksMaped.toString()+" WHERE ((("+tableName+"."+id+" )="+o[id]+")) ":s1+ksMaped.toString()+" WHERE ((("+tableName+"."+id+" )='"+o[id]+"')) ";
				ar.push(s1);
			}
			return ar;
		}catch(err){
			throw err
		}
	}
	
	async prepareDelete(opt={}){
		try{
			const{
				baseName="",
				tableName="",
				tableKey="",
				keyValue=0
			}=opt;
			let arq=[];
			let v=(!isNaN(keyValue))?keyValue:"'"+keyValue+"'"
			
			let s="DELETE FROM `"+baseName+"`.`"+tableName+"` WHERE `"+tableName+"`.`"+tableKey+"` = "+v+";"
			arq.push(s);
			
			return arq
		}catch(err){
			console.log(err);
		}	
	}
	
	async orderInsert(insertQ){
		try{
			const con=await this.odbc.createConnection(this.conStr);
			let r={};
			for(let q of insertQ){
				r=await con.query(q);
				}
			con.close()
			return r;
		}catch(err){
			throw err;
		}
	}
	
	async addRow(options={}){
		const{ar=[] , structure={},
		 tableKey="RangPiece", tableName="PIECE", saveInJson=false
		}=options
		try{
			if(saveInJson===true){
				await this.saveInJson({ar:ar});
			}
			let o={structure:structure}
			let q=await this.prepareInsert(ar,{struct:o, tableKey:tableKey, tableName:tableName} );
			// console.log(q);
			let r=await this.orderInsert(q);
			// console.log(r);
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async updtRow(options={}){
		const{rows=[], tableName="", id=""}=options
		try{
			let q=await this.prepareUpdate(rows,{tableName:tableName, id:id});
			let r=await this.orderInsert(q);
			return r
		}catch(err){
			console.log(err)
		}
		
	}
	
	async saveInJson(options={}){
		const{ar=[]}=options
		try{
			for (const el of ar) {
				let fName=`public/data/${el.idPointage}.${el.Mois}.json`
				
			  this.sauvegarderObjetJSON(el.ById,fName);
			}
			return 0;
		}catch(err){
			console.log(err)
		}
		
	}
	
	sauvegarderObjetJSON(objet, cheminFichier) {
	  try {
		/* const contenuJSON = JSON.stringify(objet, null, 2); // Convertit l'objet en JSON avec indentation
		this.fs.writeFileSync(cheminFichier, contenuJSON); */
		// console.log(`Objet sauvegardé dans ${cheminFichier}`);
		const contenuJSON = JSON.stringify(objet, null, 2);
		this.fs.writeFile(cheminFichier, contenuJSON,(e)=>{if(e){console.log(e);}else{console.log('sauvegarde terminé');}} );
		return 0;
	  } catch (erreur) {
		console.error(`Erreur lors de la sauvegarde de l'objet : ${erreur}`);
	  }
	}
	
}
module.exports=QmanagerBE;