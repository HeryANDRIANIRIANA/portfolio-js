class heureSupBE{
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
		try{
			let r={};
			let q="SELECT PERSONNEL.NomPrenom, DURER_SUPPLEMENTAIRE.* FROM DURER_SUPPLEMENTAIRE INNER JOIN PERSONNEL ON  DURER_SUPPLEMENTAIRE.CIN = PERSONNEL.CIN WHERE (((DURER_SUPPLEMENTAIRE.EsPayer) Is Null)); "
			let con=await this.odbc.connect(this.conStr);
			r=await con.query(q);
			let r2={};
			r2["data"]=[];
			r2["structure"]={} ;
			let avanceBE=this.dependencyes["avanceBE"];
			let myAv=new avanceBE( this.odbc, this.res, this.req, {conStr:this.conStr, mois:this.mois, CIN:this.CIN, dependencyes:this.dependencyes}	);
			r2["structure"]=await myAv.getTableStructurefromR({ars:r})
			let j=0;
			while(typeof(r[j])!="undefined"){
				r2.data.push(r[j]);
				j++;
			}
			
			return r2;
		}catch(err){
			throw err;
		}
	}
	
	async addRows(rows){
		try{
			let lrs={};
			let avanceBE=this.dependencyes["avanceBE"];
			let myAv=new avanceBE( this.odbc, this.res, this.req, {conStr:this.conStr, mois:this.mois, CIN:this.CIN, dependencyes:this.dependencyes});
			let struct=await this.getData() ;
			// console.log(rows)
			let reqs=await myAv.prepareInsert(rows,{struct:struct ,tableKey:"NumOrdreHS", tableName:"DURER_SUPPLEMENTAIRE"});//array req
			// console.log(reqs)
			let rs=await myAv.orderInsert(reqs);
			
			return rs;
		}catch(err) {
			throw err
		}
	}
	
}
module.exports = heureSupBE