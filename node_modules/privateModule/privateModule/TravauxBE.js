class TravauxBE{
	constructor( odbc, res, req, options={}	){
		const{
			CIN="",
			mois="",
			conStr="",
			dependencyes=[],
			
			// idAnnee=2025
		}=options;
		this.mois=mois;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
		this.tableName="DEMSPECIALE";
		let CQmanagerBE=this.dependencyes["QmanagerBE"];
		this.Qman=new CQmanagerBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
		let myDateBE=new this.dependencyes["dateBE"];
		this.defaultDate=myDateBE.defaultDate();
	}
	
	// ({idAnnee:defaultIdAnnee})
	async getAllTravaux(options={}){
		const{idAnnee=2025, IsChequerM=""}=options
		try{
			let isCheqMCond="((DETAILCOMMANDE.IsChequerM) Like '%"+IsChequerM+"%') AND";
			let isCheqMCond1=(IsChequerM==="")?"":isCheqMCond;
			
			let q="SELECT PRODUIT.DesignProd, DETAILCOMMANDE.QteCom, CLIENT.NomClient, DETAILCOMMANDE.IsChequerM, BONCOMMANDE.DateBC, BONCOMMANDE.*, DETAILCOMMANDE.* FROM CLIENT INNER JOIN (PRODUIT INNER JOIN (BONCOMMANDE INNER JOIN DETAILCOMMANDE ON BONCOMMANDE.NumBC=DETAILCOMMANDE.NumBC) ON PRODUIT.ProductId=DETAILCOMMANDE.ProductId) ON CLIENT.IdClient=BONCOMMANDE.IdClient WHERE ("+isCheqMCond1+" ((BONCOMMANDE.DateBC) Like '%"+idAnnee+"%')) ORDER BY BONCOMMANDE.DateBC DESC; ";
			let r=await this.Qman.getData({q:q});
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
}
module.exports = TravauxBE