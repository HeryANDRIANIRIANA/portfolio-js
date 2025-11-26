class etatSalaireBE{
	constructor( odbc, res, req, options={}	){
		const{
			mois="",
			conStr="",
			dependencyes=[]
		}=options;
		// const{
			// mois=window.mois
		// }=options
		// this.mois=(mois!="")?mois:await this.getLastMonth() ;
		this.mois=mois;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
	}
	
	/* getLast EtatSalaire */
	async getLastMonth(){
		
		// let q=await this.getTableStructure().colData;
		let p=await this.getTableStructure();
		// console.log(p['colData']['Mois'])
		let q=p['colData']['Mois'];
		
		// console.log(q)
		return q;
	}
	
	/* order for update after PARAM_SALAIRE edit */
	async orderUpdateByParamSalaire(options={} ){
		const{
			mois="",
			arParamSal=[]
		}=options
		// getCurentPs if Its not defined
		this.mois=(mois!="")?mois:await this.getLastMonth() ;
		try{
			// let arPS=[]
		// if(arParamSal!=[]){
			// arPS=arParamSal;
		// }else{
			// console.log(this.dependencyes);
			let myPS=new this.dependencyes.paramSalaire(this.odbc, this.res, this.req, { conStr: this.conStr, dependencyes:this.dependencyes });
			let arPS = await myPS.getParamSalaire();
		// }
		
		const EsStructur=await this.getTableStructure();
		const CurentEs= await this.getAllEtatSalaire();
		let esMaped=[];
		for(let v of CurentEs){
			esMaped[v['CIN']]=v
		}
		
		const nr= await this.buildNewRow(arPS,EsStructur, {arEsStructured:esMaped}); //new Rows
		const updts=await this.buildUpdateQuery(nr);
		const rs=await this.performQuery(updts)
		return rs;
		}catch(err){
			console.log(err)
		}
	}
	
	/* geting all EtatSalaire
	@params:CIN - facultatif
	@params:Mois - this.mois
	*/
	async getAllEtatSalaire(options={}){
		const{
			CIN='',
			mois=''
		}=options;
		let M=(mois==='')?this.mois:mois;
		// let M=this.mois
		let cinCriter=(CIN=="")?"":" AND ((PAIEMENT.CIN)='"+CIN+"') ";
		let r="SELECT PAIEMENT.* FROM PAIEMENT WHERE (((PAIEMENT.Mois)='"+M+"') "+cinCriter+" ) ORDER BY PAIEMENT.NomPrenom DESC;";
		let con= await this.odbc.connect(this.conStr);
		let r2=await con.query(r);
		return r2;
	}
	
	/* buildNewEs: créate new EtatSalaire from paramSalaire */
	async buildNewEtatSalaire(paramSalaire,options={}){
		const{}=options;
		
		
			// step1: getparamSalaire
			let myPS=new paramSalaire(this.odbc, this.res, this.req, { conStr: this.conStr });
			const ps = await myPS.getParamSalaire();
			// console.log(ps)
			// step2 Etat de salaire structur
			var EsStructur=await this.getTableStructure();
			
			// step3 available EsField in paramSalaire
			const newEsRow=await this.buildNewRow(ps,EsStructur);
			
			// step4 build a query
			const querys= await this.buildQueryInsert0(newEsRow)
			// console.log(querys)
			// step5: performInsert
			const InsertOp=await this.performQuery(querys)
			
			return {stepNumber:1, EsStructur:EsStructur} ;
		
		
		// step6 get the result
		// const result=await this.getAllEtatSalaire()
		
		// Update perso info
		// const personnel=this.dependencyes.personnel;
		// const p=new personnel(this.odbc, this.res, {conStr:this.conStr}) ;
		// const personelList=await p.getListAllPers();
		// const persoNewRow=await this.buildNewRow(personelList,EsStructur,{source:"PERSONNEL"});
		// const updtQ=await this.buildUpdateQuery(persoNewRow);
		// const rep=await this.performQuery(updtQ);
		
		//Update mois info
		// const mois2BE=this.dependencyes.mois2BE;
		// let m2=new mois2BE(this.odbc, this.res, this.req, {conStr:this.conStr, mois:this.mois}) 
		// const moisInfo=await m2.getInfoFromDb();
		// if(typeof(moisInfo[0].PeriodeDebut)!="undefined"){
		// const moisNewRow=await this.buildNewRow(moisInfo,EsStructur,{source:"MOIS2"});
		// const updtQM=await this.buildUpdateQuery(moisNewRow);
		// const rep2=await this.performQuery(updtQM);	
		// console.log('Creation EtatSalaire terminé'+rep2);
		
		// test à supprimer orderUpdate AfterParamS
		// console.log("L99 a suppprimer");
		// const t=await this.orderUpdateByParamSalaire();
		// console.log(t);
		
		// }
	}
	
	async updtEtatSalaire12( options={} ){
		const{data=[] ,EsStructur=[] , stepNumber=2, source="PERSONNEL"}=options
		try{
			const persoNewRow=await this.buildNewRow(data,EsStructur,{source:source});
			const updtQ=await this.buildUpdateQuery(persoNewRow);
			const rep=await this.performQuery(updtQ);
			var stepNumber1=stepNumber;
			stepNumber1++;
			return {stepNumber:stepNumber1, EsStructur:EsStructur} ;//important step2 getPersoList order by frontend
		}catch(err){ 
			throw err
		}
	}
	
	/* geting etatSalaire FieldsName and type */
	async getTableStructure(){
		let r="SELECT TOP 1 PAIEMENT.* FROM PAIEMENT ORDER BY PAIEMENT.NumOrdrePaiement DESC";
		let con=await this.odbc.connect(this.conStr);
		let r0=await con.query(r);
		let rep={};
		rep.colData=r0[0];
		// console.log(rep.colData)
		rep.colNames=Object.keys(r0[0]);
		rep.colProp=[];
		let i=0;
		for(let v of rep.colNames){
			rep.colProp[v]=r0.columns[i]
			i++;
		}
		return rep;
	}
	
	/* ps - paramSalaire 
	aprè_s polymorphisme, il ya des similitudes
	la différence réside de la source de la requette
	par défaut PARAM_SALAIRE - mais aussi PERSONNEL....
	!important! 
	@param ps menne la clé ordre de mise à jour 
	@param EsStructur apporte la structure que Edtat de salaire à besoin 
	@param ArEsStructured- la valeur couant de l'Etat de salaire ordonnée par CIN as key 
	*/
	async buildNewRow(ps,EsStructur, options={}){
		const{
			source="PARAM_SALAIRE",
			arEsStructured=[]
		}=options
		
		// console.log(ps)
		let psSec=(typeof(ps.res)!="undefined")?ps.res:ps;
		let re=[]
		for (let p of psSec){
			let newP={} ;
			for(let s of EsStructur.colNames){

				if( typeof(p)!='undefined' && typeof(p[s])!='undefined' ){
				newP[s]=p[s];	
				}
				// else{
					// newP[s]='NULL'
				// }
					
			}
			
			// esceptions 
			// console.log(source)
		switch(source){
			case "PARAM_SALAIRE":
			// if(typeof(arEsStructured[newP['CIN']])!='undefined' ){
				// console.log(arEsStructured[newP['CIN']]['MntAvance'])
			// }
			
			newP['MntAvance']=(typeof(arEsStructured[newP['CIN']])!='undefined' )?arEsStructured[newP['CIN']]['MntAvance'] : 0;
			newP['RetenuDivers']=(typeof(arEsStructured[newP['CIN']])!='undefined' )?arEsStructured[newP['CIN']]['RetenuDivers'] : 0;
			newP['HeureSup']=(typeof(arEsStructured[newP['CIN']])!='undefined' )?arEsStructured[newP['CIN']]['HeureSup'] : 0;
			newP['Mois']=this.mois;
			newP['IdAnnee']=parseInt(this.mois.split('-')[1]) ;
			newP['TotalDedu']=newP['MntAvance']+newP['CNAPSSB']+newP['OMSISB']+newP['IRSASB']+newP['RetenuDivers'];
			newP['NetAPayer']=newP['SalaireBrute']-newP['TotalDedu'];
			break;
			
		}
		// console.log(newP);
			re.push(newP)
		}
		
		return re;
	}
	
	/* buildQueryInsert0: used only on first init EtatSalaire */
	async buildQueryInsert0(newEsRow){
		// part1 INSERT INTO PAIEMENT ()
		let colNs=Object.keys(newEsRow[0]);
		let cnToStr=colNs.toString();
		let queryPart0="INSERT INTO PAIEMENT ( "+cnToStr+" )";
		// part2 VALUES ( )
		let ar0=[];
		for (let a of newEsRow){
			let b=Object.values(a);
			let c= b.map((v)=>{
				let d=(typeof(v)=="string")?"'"+v+"'":v;
				return d;
			} );
			let e=c.toString();
			if(colNs.length==c.length){
				ar0.push(queryPart0+" VALUES ( "+e+" )");
			}
		} 
		return ar0;
	}
	
	/* j'ignore encor les possibilité de polymorphisme
	les posibilités d'usage sont: 
	1-mise à jours des informations sur le personnel
	2-mise à jours  des informations de salaires
	a changement Avance
	b changement heureSup
	d chagement paramSalaire
	En quoi ses opérations se resemblent t ils?
	il ya des champs dépendants
	solution: pas de calcul ici 
	l'objectif est de construir une requete à partir de 2 paramètres que vous envoyées.
	@param: whereParam:{mois:'01-2025', CIN:'301....'}-obligatoir
	exception: le mois est définie au paravant , mais la deuxième clé :CIN est encor encapsulé
	@param: setParam:[
	  {
		NomPrenom: 'FANJAKASOA',
		TypePersonnel: 'Pérmanent',
		NomFonction: 'GARDIEN',
		CIN: '51601100598'
	  },]
	*/
	async buildUpdateQuery(rows,options={} ){
		const{
			tableName="PAIEMENT"
		}=options;
		let q="UPDATE PAIEMENT SET PAIEMENT.NomPrenom = 'HERY', PAIEMENT.NomFonction = 'INFO' WHERE (((PAIEMENT.CIN)='315011034087') AND ((PAIEMENT.Mois)='01-2025'));"
		let qPart0="UPDATE "+tableName+" SET ";
		let rowMaped=rows.map((v)=>{
			let cNames=Object.keys(v);
			let cNamesMaped=cNames.map((v1)=>{
				let vv1=v[v1];
				let str2=(typeof(vv1)=='string')?"'"+vv1+"'":vv1;
				let str=" "+tableName+"."+v1+"= "+str2+" ";	
				return str;
			})
			let str3=(typeof(v.CIN)!='undefined')?"  WHERE ((("+tableName+".CIN)='"+v.CIN+"') AND (("+tableName+".Mois)='"+this.mois+"')); ":"  WHERE ((("+tableName+".Mois)='"+this.mois+"')); ";
			let rfin=qPart0+cNamesMaped.toString()+str3;
			// console.log(rfin);
			return rfin;
		} );
		 // console.log(rowMaped);
		return rowMaped;
		
	}
	
	async updt(rows,options={}){
		try{
			let r={} ;
			let updtq=await this.buildUpdateQuery(rows);
			// console.log(updtq)
			r=await this.performQuery(updtq);
			// 
			return r;
		}catch(err){
			console.log(err)
		}
	}
	
	/*just order for a query but can also be used for an update
	@dependency: query
	*/
	async performQuery(querys){
		const con=await this.odbc.connect(this.conStr);
		try{
			
			for(let query of querys){
				// console.log(query);
				let r=await con.query(query);
				// console.log(r);
			}
			return 'OK';
		}catch(err){
			console.error(err);
			throw err
		}
	}
	

}

module.exports=etatSalaireBE;