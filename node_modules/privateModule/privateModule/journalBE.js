class journalBE{
	constructor( odbc, res, req, options={}	){
		const{
			CIN="",
			day="",
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
		let d0=new Date();
		let d=d0.getDate();
		let sd=d.toString().padStart(2,'0');
		let m=d0.getMonth()+1;
		let sm=m.toString().padStart(2,'0');
		let y=d0.getFullYear().toString();
		this.day=(day==="")?sd+"/"+sm+"/"+y:day;
		let CQmanagerBE=this.dependencyes["QmanagerBE"];
		this.Qman=new CQmanagerBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
	}
	
	async getJournalDuJour(options={}){
		const{d=""}=options
		try{
			let d0=(d==="")?this.day:d;
			let q="SELECT PIECE.* FROM PIECE WHERE (((PIECE.DatePiece)='"+d0+"')); "
			// console.log(q);
			let r=await this.Qman.getData({q:q});
			return r
		}catch(err){
			console.log(err)
		}
		
	}
	
	async addJournalRow(options={}){
		const{ar=[] , structure={} }=options
		try{
			let o={structure:structure}
			let q=await this.Qman.prepareInsert(ar,{struct:o, tableKey:"RangPiece", tableName:"PIECE"} );
			
			let r=await this.Qman.orderInsert(q);
			// console.log(r);
			// TODO:GETDETAILJOURNAL
			/* generate NumPiece from ar,  */
			
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async addRowDetailJounal(options={}){
		const{ar=[] , structure={} }=options
		try{
			let r=await this.Qman.addRow({ar:ar, structure:structure,  tableKey:"NumDetailPiece", tableName:"DETAILPIECE"});
			// let n=ar[0].NumPiece;
			// let [s,d,m,y]=n.split("/");
			// let s1="JCST/"+d+"/"+m+"/"+y;
			// let s2="JBST/"+d+"/"+m+"/"+y;
			// let arNumPiece=[s1,s2];
			// r=await this.getDetailJournal({arNumPiece:arNumPiece});
			return r
		}catch(err){
			console.log(err)
		}
		
	}
	
	async getDetailJournal(options={}){
		const{arNumPiece=[]}=options
		try{
			let q="SELECT DETAILPIECE.* FROM DETAILPIECE WHERE (((DETAILPIECE.NumPiece)='"+arNumPiece[0]+"')) OR (((DETAILPIECE.NumPiece)='"+arNumPiece[1]+"')); ";
			let r=await this.Qman.getData({q:q});
			return r
		}catch(err){
			console.log(err)
		}
		
	}
	
	async getAllDetailJournal(options={}){
		const{idAnnee=0}=options
		try{
			//DETAILPIECE.MontantPiece, PIECE.*,
			let q="SELECT  DETAILPIECE.* FROM PIECE INNER JOIN DETAILPIECE ON PIECE.NumPiece = DETAILPIECE.NumPiece WHERE (((PIECE.DatePiece) Like '%"+idAnnee+"%')) ORDER BY DETAILPIECE.NumDetailPiece DESC; ";
			let r=this.Qman.getData({q:q});
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
}
module.exports=journalBE;