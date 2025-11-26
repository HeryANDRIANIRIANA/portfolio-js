class ClientBE{
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
	
	async getData(){
		let M=this.mois;
		let q="SELECT CLIENT.*, CLIENT.NomClient, BONCOMMANDE.ResteAPayer FROM CLIENT INNER JOIN BONCOMMANDE ON CLIENT.IdClient = BONCOMMANDE.IdClient WHERE (((BONCOMMANDE.DateBC) Like '%2024%')) OR (((BONCOMMANDE.DateBC) Like '%"+this.idAnnee+"%')) ORDER BY CLIENT.NomClient; ";
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


}

module.exports=ClientBE;