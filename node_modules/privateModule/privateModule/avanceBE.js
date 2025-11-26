class avanceBE{
	constructor( odbc, res, req, options={}	){
		const{
			CIN="",
			mois="",
			conStr="",
			dependencyes=[]
		}=options;

		this.CIN=CIN;
		this.mois=mois;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
	}
	
	async getData(){
		/* SELECT PERSONNEL.NomPrenom, AVANCE.* FROM PERSONNEL INNER JOIN AVANCE ON PERSONNEL.CIN = AVANCE.CIN WHERE (((AVANCE.Mois)="Août") AND ((AVANCE.CIN)="301072018372")); */
		const cinQuery=(this.CIN!="")?" AND ((AVANCE.CIN)='"+this.CIN+"')":"";
		// const q="SELECT AVANCE.* FROM AVANCE WHERE (((AVANCE.Mois)='"+this.mois+"') "+cinQuery+"); ";
		var q="SELECT PERSONNEL.NomPrenom, AVANCE.* FROM PERSONNEL INNER JOIN AVANCE ON PERSONNEL.CIN = AVANCE.CIN WHERE (((AVANCE.Mois)='"+this.mois+"') "+cinQuery+"); ";
		try{
		const con= await this.odbc.connect(this.conStr);
		const r=await con.query(q);
		var r2={};
		r2.data=[];
		const struct=await this.getTableStructurefromR({ars:r})
		// console.log(r)
		/* statement: ,parameters:, return:, count:, columns: */
		let j=0;
		while(typeof(r[j])!="undefined"){
			r2.data.push(r[j]);
			j++;
		}
		// if(typeof(r[0])!="undefined"){
			// r2.data.push(r[0])
		// }
		
		r2.structure=struct;
		return r2;
		
		}catch(err){
			throw err
		}
		
	}
	
	/* getTableStructurefromR: interpret the coluns section of aesult to
	@params: ars- result from sql query
	@return: tableStruct{colNames:[""...], colDesc:[colName:desciption]}
	*/
	async getTableStructurefromR(options={}){
		const{ars=[]}=options
		try{
			// console.log(ars)
			const tableStructure={};
			tableStructure.colNames=[];
			tableStructure.colDesc={};
			for(let o of ars["columns"]){
			tableStructure.colNames.push(o.name);
			tableStructure.colDesc[o.name]=o;//.dataType 
			
			}
			// console.log(tableStructure.colDesc);
			return tableStructure;
			
		}catch(err){
			throw err
		}
	
	}
	
	async importA(){
		
		try{
			const ars=await this.getValueFromImportedExcel();//step1 done
			// console.log(ars)
			const arsWithCIN=await this.applyCIN(ars);// attention format: {ars:ars,nomTorectify:nomTorectify} 
			if(arsWithCIN.nomTorectify.length>0){ console.log("avanceBE.L70"+arsWithCIN.nomTorectify) }//recperation es noms non trouvées
			// recuperation ds informations d'état de salaire relatif au CIN trovées
			const etatSalaireInfos=await this.getEtatSalaire(arsWithCIN.ars);
			// console.log("L84 "+Object.entries(etatSalaireInfos));
			 // prepare arrInsertQuery le tableau des chains de requettes d'insertion
			const insertsQ=await this.prepareInsert(arsWithCIN.ars);
			// console.log(insertsQ);
			const insertOk=await this.orderInsert(insertsQ);
			
			// console.log(arsWithCIN.ars);
			let ar=arsWithCIN.ars.map((v)=>{if(v["CIN"] !="" && v["CIN"] !='CIN' && v["CIN"] !='undefined' && typeof(v["CIN"])!='undefined') return v["CIN"] } );//important changement format
			
			const sumAvance=await this.getSumAvance(ar);
			 /* next: 
			 getSumAvance, prepare update query, execute query
			 */
			const updateQ=await this.prepareUpdateQ(ar,sumAvance,etatSalaireInfos);
			// console.log("L98 "+updateQ)
			const etatSal=this.dependencyes.etatSalaireBE;
			const myes=new etatSal(this.odbc, this.res,this.req,{mois:this.mois, conStr:this.conStr, dependencyes:this.dependencyes});
			let rep=await myes.performQuery(updateQ)
			// console.log("L102 "+rep);
			return rep
			
		}catch(err){
			throw err
		}
		
	}
	
	/*convert the imported excel inarray*/
	async getValueFromImportedExcel(){
		try {
				const exceljs=this.dependencyes.exceljs;
				const workbook = new exceljs.Workbook();
				const wb1=await workbook.xlsx.readFile(this.req.file.path);
				// console.log(wb1);
				const worksheet = wb1.getWorksheet(1);
				// console.log(worksheet.getRow(1).values);
				const arkeys=worksheet.getRow(1).values;
				let arFormated0=[];
				worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
						let i=1;
						let rowFormated=[];
						row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
							let v=(typeof(cell.value)=='object'  && cell.value!=null )?cell.value.result:cell.value;
							v=(typeof(v)=="undefined" )?null:v;
							rowFormated[arkeys[i]]=v
							i++;
						});
						arFormated0.push(rowFormated);
					});	
				return arFormated0;
			} catch (error) {
				console.error('Erreur lors du traitement du fichier:', error);
				this.res.status(500).send('Erreur serveur');
			} finally{
				 
			}
		
	}
	
	/* add CIN to the array 
	return ars with CIN updated
	*/
	async applyCIN(ars,options={}){
		const{datePaieAvance="15-"+this.mois,
		IdAnnee=this.mois.split("-")[1]}=options;
		// datePaieAvance=(datePaieAvance=="")?"15-"+this.mois:datePaieAvance;
		const personnel=this.dependencyes.personnel;
		const pers=new personnel(this.odbc, this.res,{conStr:this.conStr});
		// console.log(ars)
			try{
				let nomTorectify=[];
				for (let row = 1; row < ars.length; row++) {
					ars[row]["CIN"]=await pers.getCINBySurname(ars[row]["NomPrenom"])
					ars[row]["DatePaieAvance"]=(ars[row]["DatePaieAvance"]==""||ars[row]["DatePaieAvance"]==null)?datePaieAvance:ars[row]["DatePaieAvance"];
					ars[row]["IdAnnee"]=(ars[row]["IdAnnee"]==""||ars[row]["IdAnnee"]==null)?IdAnnee:ars[row]["IdAnnee"];
					ars[row]["Mois"]=(ars[row]["Mois"]==""||ars[row]["Mois"]==null)?this.mois:ars[row]["Mois"];
					
					if(ars[row]["CIN"]==""){
						nomTorectify.push(ars[row]["NomPrenom"])
					}
				}
				return {ars:ars,nomTorectify:nomTorectify} ;
			}catch(err){
				throw err
			}
		
	}
	
	/* getEtatSalair 
	@return array of oject etat salaire courant des CIN 
	*/
	async getEtatSalaire(a){
		try{
			// console.log(a)
			const etatSal=this.dependencyes.etatSalaireBE;
			const myes=new etatSal(this.odbc, this.res,this.req,{mois:this.mois, conStr:this.conStr, dependencyes:this.dependencyes});
			let  etatSalaireData={} ;
			for(let i2=1; i2<a.length; i2++){
				 // console.log("L182 "+a[i2]['Mois']);
				if(a[i2]['CIN']!=""){
					let esCour=await myes.getAllEtatSalaire({CIN:a[i2]['CIN'],mois:a[i2]['Mois']})
					etatSalaireData[a[i2]['CIN']] =esCour[0]
				}
			}
			return etatSalaireData;
		}catch(err){
			throw err
		}
		
		
	}
	
	/* getEtatSalair 
	@return array of oject etat salaire courant des CIN 
	*/
	/* async getEtatSalaire(a){
		try{
			// console.log(a)
			const etatSal=this.dependencyes.etatSalaireBE;
			const myes=new etatSal(this.odbc, this.res,this.req,{mois:this.mois, conStr:this.conStr, dependencyes:this.dependencyes});
			let  etatSalaireData={} ;
			for(let i2=1; i2<a.length; i2++){
				 console.log("L182 "+a[i2]['Mois']);
				if(a[i2]['CIN']!=""){
					let esCour=await myes.getAllEtatSalaire({CIN:a[i2]['CIN'],mois:a[i2]['Mois']})
					etatSalaireData[a[i2]['CIN']] =esCour[0]
				}
			}
			return etatSalaireData;
		}catch(err){
			throw err
		}
		
		
	} */
	
	async prepareInsert(a, options={}){
		const{
			struct={},
			tableKey="NumOrdreAvance",
			tableName="AVANCE"
		}=options;
		// console.log(struct);
		const avStruct=(Object.keys(struct).length===0)?await this.getData():struct;
		// console.log(avStruct.structure.colDesc);
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
	
	async orderInsert(insertQ){
		try{
			const con=await this.odbc.connect(this.conStr);
			for(let q of insertQ){
				 // console.log(q);
				let r=await con.query(q);
				 // console.log(r);
			}
			return 'OK';
		}catch(err){
			throw err;
		}
	}
	
	async addRows(rows){
		try{
			let arq=await this.prepareInsert(rows);
			let r=await this.orderInsert(arq);
			return r;
		}catch(err) {
			console.log(err)
		}
	}
	
	async prepareUpdate(rows, options={}){
		const{tableName="AVANCE", id="NumOrdreAvance"}=options;
		try{
			let ar=[]
			for(let o of rows){
				
				let arKs=Object.keys(o);
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
	
	async updtAvance(rows){
		try{
			let rs={}
			let arq=await this.prepareUpdate(rows);
			rs=await this.orderInsert(arq);//polymorhisme
			console.log(rows);
			return rs
		}catch(err){
			throw err
		}
	}
	
	/* getSumAvance
	@params a -array
	@params this.mois
	*/
	async getSumAvance(a){
		let Objr={}
		 // console.log("L243 "+Object.values(a))
		 for(let s of Object.values(a)){
			if(s!="undefined"&&typeof(s)!="undefined"){Objr[s]=await this.getSumAvanceByCIN(s)}
		}
		// console.log(Objr);
		return Objr
		
	}
	
	/* getSumAvance2
	@params a -array of Object[{CIN:, Mois}]
	@params 
	*/
	async getSumAvance2(a){
		let Objr={}
		for(let s of Object.values(a)){
				// console.log(s)
			if(s!=="undefined"&&typeof(s)!=="undefined"){Objr[s['CIN']]=await this.getSumAvanceByCIN(s['CIN'],{mois:s['Mois']})}
			}
		
		return Objr
	}
	
	async getSumAvanceByCIN(s, options={}){
		const{
			mois=""
		}=options
		try{
			let M=(mois==="")?this.mois:mois;
			let MntAvance=0;
			let q="SELECT Sum(AVANCE.MntAvance) AS MntAvance, AVANCE.Mois, AVANCE.CIN FROM AVANCE GROUP BY AVANCE.Mois, AVANCE.CIN HAVING (((AVANCE.Mois)='"+M+"') AND ((AVANCE.CIN)='"+s+"')); ";
			const con=await this.odbc.connect(this.conStr)
			let resp=await con.query(q)
			// console.log(resp)
			MntAvance=(typeof(resp[0])!="undefined")?resp[0]["MntAvance"]:0;
			return MntAvance
		}catch(err){
			throw err
		}
	}
	
	/* prepareUpdateQ to update etat Salaire
	@params ar- array of CIN -String
	@params sumAvance - Object {CIN:MntAvance}
	@params etatSalaireInfos - Object {CIN:Obj} - Obj:{salbrut , CNAPS, OMSI, IRSA, totalDed, netApayer, CIN}
	*/
	async prepareUpdateQ(ar,sumAvance,etatSalaireInfos){
		// nous allons injecter un row dans etatSalaireBE.buildUpdateQuery(rows,options={} )
		// row[{CIN,SalaireBrute,MntAvance,CNAPSSB, OMSISB, IRSASB, RetenuDivers, TotalDedu, NetAPayer}]
		// needed Element :CIN,SalaireBrute,MntAvance,CNAPSSB, OMSISB, IRSASB, RetenuDivers
		// Element to inject: CIN, TotalDedu, NetAPayer
		try{
			let e=etatSalaireInfos;
			
			let row=[]
			for(let cin of ar){
				if(cin!="undefined" && cin!="" && typeof(cin)!="undefined" ){
					// sumAvance[cin].MntAvance;
					// console.log("L287 "+cin);
					console.log(sumAvance);
					if(e[cin]!="undefined" && typeof(e[cin])!="undefined"){
						let MntAvance=sumAvance[cin];
						let TotalDedu=sumAvance[cin]+e[cin].CNAPSSB+e[cin].OMSISB+e[cin].IRSASB+e[cin].RetenuDivers;
						let NetAPayer=e[cin].SalaireBrute-TotalDedu;
							let o={
								CIN:cin,
								MntAvance:MntAvance ,
								TotalDedu:TotalDedu,
								NetAPayer:NetAPayer
							}
						row.push(o)
					}
				}
			}
			const etatSal=this.dependencyes.etatSalaireBE;
			const myes=new etatSal(this.odbc, this.res,this.req,{mois:this.mois, conStr:this.conStr, dependencyes:this.dependencyes});
			let updtQ=await myes.buildUpdateQuery(row)
			return updtQ;
			
		}catch(err){
			throw err
		}
		
	}
	
	// delete row sent by use
	async deteleRows(d){
		// console.log(d);
		try{
			// step1 preparer les requettes de suppression
			let reqs= this.prepareReqSupp(d);
			// console.log(reqs);
			// step2 order suppression
			let suppr=await this.orderQuery(reqs);
			// step3 recup les CIN et mois concerner et filtrer
			// let concernedR=await this.getConsernedR(d);
			// let arCIN=concernedR.map((v)=>{return v['CIN']});
			// console.log(concernedR);
			// step4 injecter les CIN et mois dans les fonctions geSumAvance
			// let OsumAv=await this.getSumAvance(arCIN);//Object Sum Avance
			
			// concernedR.unshift({});//attention modification de concernedR
			// let EtatSalInfo=await this.getEtatSalaire(concernedR);
			
			// step5 injecter le resultat dans prepareUpdate
			// let updtqs=await this.prepareUpdateQ(arCIN,OsumAv,EtatSalInfo)
			
			// step6 orderUpdate
			// let repq=await this.orderQuery(updtqs);
			
			// const r=await this.getData();
			return suppr;
		}catch(err){
			throw err
		}
	}
	
	/* prepareReqSuppAvance
	@params: d: array - rows d'avance à suppr
	*/
	prepareReqSupp(d,options={}){
		const{tableName="AVANCE", cle="NumOrdreAvance"}=options;
		let s0="DELETE "+tableName+".* FROM "+tableName+" WHERE ((("+tableName+"."+cle+")=9195)); ";
		let reqs=[]
		for(let o of d){
			let s1="DELETE "+tableName+".* FROM "+tableName+" WHERE ((("+tableName+"."+cle+")="+o[cle]+")); ";
			reqs.push(s1);
		}
		return reqs;
	}
	
	async orderQuery(a){
		try{
			let etatSal=this.dependencyes.etatSalaireBE;
			let myes=new etatSal(this.odbc, this.res,this.req,{mois:this.mois, conStr:this.conStr, dependencyes:this.dependencyes});
			let rep=await myes.performQuery(a)
			return rep;
			
		}catch(err){
			throw err
		}
	}
	
	async getConsernedR(d){
		try{
			let a=[]
			for(let o of d){
				a.push({CIN:o['CIN'],Mois:o['Mois']});
			}
			let b=this.supprimerDoublons(a);
			// console.log(b)
			return b
		}catch(err){
			throw err
		}
	}
	
	supprimerDoublons(tableau) {
	  const map = new Map();
	  return tableau.filter(objet => {
		// Créer une clé unique pour chaque objet basée sur CIN et Mois
		const cle = `${objet.CIN}-${objet.Mois}`;
		if (!map.has(cle)) {
		  map.set(cle, true); // Marquer l'objet comme vu
		  return true; // Garder l'objet dans le tableau résultant
		}
		return false; // Supprimer l'objet (c'est un doublon)
	  });
	}
	
}
module.exports=avanceBE;