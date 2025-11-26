class demandeurBE{
	constructor( odbc, res, req, options={}	){
		const{
			conStr="",
			dependencyes=[],
			// idAnnee=2025
		}=options;
		// this.mois=mois;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
		this.tableName="DEMANDEUR";
		let CQmanagerBE=this.dependencyes["QmanagerBE"];
		this.Qman=new CQmanagerBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
	}
	
	async getListDemandeur(options={}){
		const{}=options
		try{
			let q="SELECT * FROM "+this.tableName+" ORDER BY DEMANDEUR.IdDemandeur;"
			// console.log(q);
			let r=await this.Qman.getData({q:q});
			return r
		}catch(err){
			console.log(err)
		}
		
	}
}
module.exports= demandeurBE