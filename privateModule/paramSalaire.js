class ParamSalaire{
	constructor(odbc,res,req,options={}){
		const{
			conStr="", 
			dependencyes=[]
			}=options;
		this.dependencyes=dependencyes;
		// console.log('dep:'+this.dependencyes);
		this.conStr=conStr;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.personnel=require('privateModule/personnel');
		this.excelFormated=[];
	}
	
	async getParamSalaire(){
		try{
			let myPerso=new this.personnel(this.odbc,this.res,{});
			const usedCIN=await myPerso.getUsedCIN();
			const allParamsalaire=await this.getParamSalaireBy(usedCIN);
			return allParamsalaire;
		}catch(err){
			console.error(err);
			throw err;
		}
		// myPerso.getUsedCIN().then((r)=>{
			// this.getParamSalaireBy(r).then((r2)=>{
				// this.res.json(r2)
			// } );
		// })
	}
	
	/**
	*get all pramsalaire by CIN delived in array r
	* r : array-forme:[{CIN:"xxx"},{CIN:"xxx"}...]-description:array of used CIN
	*
	*/	
	async getParamSalaireBy(r,options={}){
		const{}=options;
		// const{conStr='DSN=LAUVE-GRH'}=options
		
		let conStr=this.conStr;
		let arrReqs=r.map(v=>{return "SELECT TOP 1 * FROM (SELECT PERSONNEL.NomPrenom, PARAM_SALAIRE.*, PERSONNEL.idPointage, PERSONNEL.CIN, PARAM_SALAIRE.NumOrdreParamSal FROM PERSONNEL INNER JOIN PARAM_SALAIRE ON PERSONNEL.CIN = PARAM_SALAIRE.CIN WHERE (((PERSONNEL.idPointage)<>0) AND ((PERSONNEL.CIN)='"+v.CIN+"')) ORDER BY PARAM_SALAIRE.NumOrdreParamSal DESC)"; })
		
		const resObj={res:[]};
		// const i=0;
		const con=await this.odbc.connect(conStr);
		try{			
			 for(const arrReq of arrReqs){
				 let rs1=await con.query(arrReq);
				resObj.res.push(rs1[0]);
			 }
		}catch(err){
			console.log(err);
		}finally{
			con.close();
			return resObj;
		}
	}
	
	/* import data from excel
	@step:1- convert into array
	@step:2- get table structure
	@step:3- create query
	@step:4- perform insertion
	*/
	async importParamSalaire(exceljs){
		const ars=await this.getValueFromImportedExcel(exceljs);//step1 done
		const colNames=await this.getTableStructure();//step2 done
		const qrs=await this.buildInsertQuery(ars,colNames);//step3 done
		let r=await this.performInsertion(qrs);
		// console.log(r);
		const newps=await this.getParamSalaire();
		
		let myEs=new this.dependencyes.etatSalaireBE(this.odbc,this.res,this.req,{conStr:this.conStr, dependencyes:this.dependencyes});
		// console.log('startUpdate')
		let updt=await myEs.orderUpdateByParamSalaire();
		// console.log('update='+updt);
		return newps;
	}
	
	/* performInsertion of import */
	async performInsertion(rs){
		const con=await this.odbc.connect(this.conStr);
		try{
			for(const r of rs){
				 // console.log(r);
				let res2= await con.query(r);
				 // console.log(res2);
			}
			return 'OK';
		}catch(err){
			console.log("paramSalaire.performInsertion");
			console.error(err);
		}
	}
	
	/* build INSERT query for import 
	*prams:{colNames:Object.keys(rs[0]),colDescs}
	*/
	async buildInsertQuery(ars, cols){
		let arQuerys=[];
		let s1="";
		let k=0;
		
		var colNames=cols.colNames;
		colNames=colNames.filter(colName=>colName!="NumOrdreParamSal")
		for (let cn of colNames){
			s1+=(k==0)? ""+cn+" ":", "+cn+" ";
			k++;
		}
		let s0="INSERT INTO PARAM_SALAIRE ( "+s1+" )";
		let i=0;
		for( let ar of ars){
			let s="";
			let j=0;
			for (let colName of colNames){
				let vformated=0;

				// rectification su type de donnée
				if(cols.colDescs[colName].dataType>=4){
					if(ar[colName]==null||ar[colName]==''){
						vformated=0;
					}else{
						vformated=parseFloat(ar[colName]);
					}
				}else{
					vformated=ar[colName];
				}

				// Exception pour la Daty-date d'insertion de l'occurence
				let dt1="";
				let dt0=new Date();
				let d=dt0.getDate().toString().padStart(2,'0');
				let m=dt0.getMonth()+1;
				m=m.toString().padStart(2,'0');
				let y=dt0.getFullYear();
				dt1=d+"-"+m+"-"+y;
				// console.log(dt1);
				
				vformated=(typeof(ar[colName])=="string")?"'"+ar[colName]+"'":ar[colName];
				vformated=(ar[colName]==null||ar[colName]=="null")?"''":vformated;
				vformated=(colName=="Daty")?"'"+dt1+"'":vformated;
				
				s+=(j==0)?vformated:", "+vformated;
				j++;
			}
			if(i>0){arQuerys.push(" "+s0+" VALUES ( "+s+" ) ");}
			i++;
		}
		return arQuerys;
		// console.log(arQuerys);
	}
	
	/* geting table  PARAM_SALAIRE colNames 
	*@return Object:{colNames:Object.keys(rs[0]),colDescs}
	*/
	async getTableStructure(){
		try{
			// console.log(this.conStr);
			const qr=`SELECT TOP 1 * FROM PARAM_SALAIRE ORDER BY PARAM_SALAIRE.NumOrdreParamSal DESC`;
			const con=await this.odbc.connect(this.conStr);
			let rs=await con.query(qr);
			// console.log(rs['columns']);
			let cols = rs['columns'];
			let colDescs=[];
			for (let col of cols){
				colDescs[col.name]=col
			}
			let colWithDescr={colNames:Object.keys(rs[0]),colDescs}
			// console.log(colWithDescr);
			return colWithDescr;
		}catch{
			
		}
	}
	
	/*convert the imported excel inarray*/
	async getValueFromImportedExcel(exceljs){
		try {
				const workbook = new exceljs.Workbook();
				const wb1=await workbook.xlsx.readFile(this.req.file.path);
				// console.log(wb1);
				const worksheet = wb1.getWorksheet(1);
				// console.log(worksheet.getRow(1).values);
				const arkeys=worksheet.getRow(1).values;
				let arFormated0=[];
				worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
						let i=1;
						let rowFormated=[];
						row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
							let v=(typeof(cell.value)=='object'  && cell.value!=null )?cell.value.result:cell.value;
							v=(typeof(v)=="undefined" )?null:v;
							rowFormated[arkeys[i]]=v
							i++;
						});
						arFormated0.push(rowFormated);
					});	
				return arFormated0;
			} catch (error) {
				console.error('Erreur lors du traitement du fichier:', error);
				this.res.status(500).send('Erreur serveur');
			} finally{
				 
			}
		
	}
	
}
module.exports=ParamSalaire;