class DemandeSpecialBE{
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
	
	async saveDemandeSpecial(demandeSpecial, demSpecialStructure, detailDs, detailDsStructure){
		try{
		// IdDem, DateDem, Motif, LasaV
		let IdDem=await this.buildIdDem();
		// console.log(IdDem);
		demandeSpecial[0]["IdDem"]=IdDem;
		demandeSpecial[0]["DateDem"]=this.defaultDate;
		demandeSpecial[0]["LasaV"]="Non";
		// console.log(demSpecialStructure);
		let q= await this.Qman.prepareInsert(demandeSpecial,{struct:{structure:demSpecialStructure}, tableKey:"NumOrdreDem", tableName:"DEMSPECIALE"})
		// console.log(q);
		let r=await this.Qman.orderInsert(q);
		for (let el of detailDs) {
		  el['IdDem']=IdDem;
		  el['QteRecu']=0;
		}
		q= await this.Qman.prepareInsert(detailDs,{struct:{structure:detailDsStructure}, tableKey:"", tableName:"DETAILDS"})
		// console.log(q);
		r=await this.Qman.orderInsert(q);
		return IdDem;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async getAllDSPat(options={}){
		const{day=this.defaultDate}=options
		try{
			let q="SELECT DEMSPECIALE.* FROM DEMSPECIALE WHERE (((DEMSPECIALE.DateDem) Like '%"+day+"%'));";
			let r=await this.Qman.getData({q:q});
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async getDetailDSPat(options={}){
		const{day=this.defaultDate}=options
		try{
			let q="SELECT DETAILDS.* FROM DEMSPECIALE INNER JOIN DETAILDS ON DEMSPECIALE.IdDem = DETAILDS.IdDem WHERE (((DEMSPECIALE.DateDem) Like '%"+day+"%'));";
			let r=await this.Qman.getData({q:q});
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async getCountDSP(options={}){
		const{day=this.defaultDate}=options
		try{
			let q="SELECT Count(*) AS count FROM DEMSPECIALE WHERE (((DEMSPECIALE.DateDem) Like '%"+day+"%'))";
			let r=await this.Qman.getData({q:q});
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async buildIdDem(options={}){
		const{day=this.defaultDate}=options
		try{
			let count=0;
			let count0 =await this.getCountDSP()
			// console.log(count0);
			count=count0.data[0].count;
			count++;
			let idDem="DS"+count+"/"+day;
			
		return idDem;
		}catch(err){
			console.log(err)
		}
		
	}
	
}

module.exports=DemandeSpecialBE;