class mois2BE{
	/*amélioration à prévoir impératif:
	création d'un mois vièrge, créer le mois s'il est intruvavle
	*/
	constructor(odbc,res,req,options={}){
		const{mois='',conStr=''}=options;
		this.conStr=conStr;
		this.mois=mois;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
	}
	async getInfoFromDb(){
		let r="SELECT * FROM MOIS2 WHERE (((MOIS2.Mois)='"+this.mois+"')); ";
		const con=await this.odbc.connect(this.conStr);
		try{
			const r1=await con.query(r);
			return r1
		}catch(err){
			throw err
		}
	}
}

module.exports=mois2BE;