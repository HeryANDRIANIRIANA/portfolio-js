class DetailCommandeBE{
	constructor( odbc, res, req, options={}	){
		const{
			CIN="",
			mois="",
			conStr="",
			dependencyes=[],
			idAnnee=2025
		}=options;

		/* this.CIN=CIN;
		this.mois=mois; */
		this.idAnnee=idAnnee;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
		this.tableName="CLIENT";
		let CQmanagerBE=this.dependencyes["QmanagerBE"];
		this.Qman=new CQmanagerBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
		let myDateBE=new this.dependencyes["dateBE"];
		this.defaultDate=myDateBE.defaultDate();
	}
	
	// avant 11/04
	async getData(options={}){
		const{
			NumBC=""
		}=options;
		
		let q="SELECT PRODUIT.DesignProd, DETAILCOMMANDE.*, PRODUIT.DesignProd, BONCOMMANDE.ResteAPayer, BONCOMMANDE.DateBC FROM BONCOMMANDE INNER JOIN (PRODUIT INNER JOIN DETAILCOMMANDE ON PRODUIT.ProductId = DETAILCOMMANDE.ProductId) ON BONCOMMANDE.NumBC = DETAILCOMMANDE.NumBC WHERE (((DETAILCOMMANDE.NumBC)='"+NumBC+"') AND ((BONCOMMANDE.ResteAPayer)>0) AND ((BONCOMMANDE.DateBC) Like '%2024%')) OR (((DETAILCOMMANDE.NumBC)='"+NumBC+"') AND ((BONCOMMANDE.ResteAPayer)>0) AND ((BONCOMMANDE.DateBC) Like '%"+this.idAnnee+"%')) ORDER BY BONCOMMANDE.RangCom DESC; ";
		var tableStructureBE=this.dependencyes.tableStructureBE;
		const mytableStructure=new tableStructureBE( this.odbc, this.res, this.req, {conStr:this.conStr, mois:this.mois, CIN:this.CIN, idAnnee:this.idAnnee, dependencyes:this.dependencyes}	);
		
		try{
			let con= await this.odbc.connect(this.conStr);
			let r=await con.query(q);
			// con.close()
			let r1={data:[],structure:{}};
			r1.structure=await mytableStructure.getTableStructurefromR({ars:r});
			let i=0
			while(typeof(r[i])!="undefined"){
				r1.data.push(r[i]);
				i++;
			}
			return r1;
		}catch(err){
			throw err
		}
		
		// 
	}

	// meme objectif que getData mais simplifier
	async getDetailCommandeData(options={}){
		const{NumBC=""}=options
		try{
			let q=(NumBC==="")?"SELECT PRODUIT.DesignProd, DETAILCOMMANDE.*, PRODUIT.DesignProd, BONCOMMANDE.ResteAPayer, BONCOMMANDE.DateBC FROM BONCOMMANDE INNER JOIN (PRODUIT INNER JOIN DETAILCOMMANDE ON PRODUIT.ProductId = DETAILCOMMANDE.ProductId) ON BONCOMMANDE.NumBC = DETAILCOMMANDE.NumBC WHERE (((DETAILCOMMANDE.NumBC)='"+NumBC+"') AND ((BONCOMMANDE.ResteAPayer)>0) AND ((BONCOMMANDE.DateBC) Like '%2024%')) OR (((DETAILCOMMANDE.NumBC)='"+NumBC+"') AND ((BONCOMMANDE.ResteAPayer)>0) AND ((BONCOMMANDE.DateBC) Like '%"+this.idAnnee+"%')) ORDER BY BONCOMMANDE.RangCom DESC; ":"SELECT TOP 1 * FROM DETAILCOMMANDE";
			let r=await this.Qman.getData({q:q});
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
	
	}

module.exports=DetailCommandeBE;