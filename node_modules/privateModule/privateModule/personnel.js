class Personnel{
	constructor(odbc, res,options={}){
		const{conStr='DSN=LAUVE-GRH'}=options
		this.conStr=conStr;
		this.odbc=odbc;
		this.res=res;
		this.r=[
		`SELECT * FROM PERSONNEL WHERE (((PERSONNEL.idPointage) Is Not Null)) ORDER BY PERSONNEL.idPointage; `,
		`SELECT PERSONNEL.CIN FROM PERSONNEL WHERE (((PERSONNEL.idPointage) Is Not Null)) ORDER BY PERSONNEL.idPointage; `
		];
		
	}
	
	async getListAllPers(){
		try{
			const con=await this.odbc.connect(this.conStr);
			const result= await con.query(this.r[0]);
			// this.res.json(result)
			return result;
		}catch(e){
			console.error(e);
		}
	}
	
	async getUsedCIN(){
		const con=await this.odbc.connect(this.conStr);
		const result= await con.query(this.r[1]);
	 // console.log(result);
		let keysToSkip=["statement", "parameters", "return", "count", "columns"];
		let usedCIN=[];
		for (let key in result) {
			if (!keysToSkip.includes(key)) {
				// console.log(key, result[key]); // Affiche uniquement les clés non ignorées
				usedCIN.push(result[key]);
			}
		}
		return usedCIN;
	}
	
	/* getCINFromSurname
	@params: string surname
	@return: Array rs
	*/
	async getCINBySurname(surName){
		try{
			const q="SELECT PERSONNEL.*, PERSONNEL.Surnom FROM PERSONNEL WHERE (((PERSONNEL.Surnom) Like '%"+surName+"%')); "
			// console.log(q);
			const con=await this.odbc.connect(this.conStr);
			const r=await con.query(q);
			const res2=(typeof(r[0])!="undefined")?r[0]["CIN"]:"";
			return res2
		}catch(err){
			throw err
		}
	}
	
	
}
module.exports=Personnel;