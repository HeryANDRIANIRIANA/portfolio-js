class tableStructureBE{
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
		this.odbc=odbc;
		this.idAnnee=idAnnee;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
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
	
}
module.exports=tableStructureBE;