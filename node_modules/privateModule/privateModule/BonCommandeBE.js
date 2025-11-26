class BonCommandeBE{
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
		
	}
	
	async getData(options={}){
		const{
			IdClient=3161
		}=options;
		
		let q="SELECT BONCOMMANDE.*, CLIENT.IdClient FROM CLIENT INNER JOIN BONCOMMANDE ON CLIENT.IdClient = BONCOMMANDE.IdClient WHERE (((CLIENT.IdClient)="+IdClient+") AND ((BONCOMMANDE.DateBC) Like '%"+this.idAnnee+"%') AND ((BONCOMMANDE.ResteAPayer)>0)) OR (((CLIENT.IdClient)="+IdClient+") AND ((BONCOMMANDE.DateBC) Like '%2024%') AND ((BONCOMMANDE.ResteAPayer)>0)) ORDER BY BONCOMMANDE.RangCom DESC; ";
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

	async updtBonCommande(options={}){
			const{ar=[]}=options
			try{
				let r={};
				let avanceBE=this.dependencyes["avanceBE"];
				let myAv=new avanceBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
				let q=await myAv.prepareUpdate(ar, {tableName:"BONCOMMANDE", id:"NumBC"});
				// console.log(q);
				r=await myAv.orderInsert(q);
				return r;
			}catch(err){
				console.log(err)
			}
			
	}

}

module.exports=BonCommandeBE;