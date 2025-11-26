class dateBE{
	constructor(options={}){
		const{}=options
		try{

		}catch(err){
			console.log(err)
		}
		
	}
	
	defaultDate(){
		try{
			let d0=new Date();
			let d=d0.getDate();
			let sd=d.toString().padStart(2,'0');
			let m=d0.getMonth()+1;
			let sm=m.toString().padStart(2,'0');
			let y=d0.getFullYear().toString();
			let day=sd+"/"+sm+"/"+y;
			return day
		}catch(err){
			console.log(err)
		}
	}
	
	defaultDate2(){
		try{
			let d0=new Date();
			let d=d0.getDate();
			let sd=d.toString().padStart(2,'0');
			let m=d0.getMonth()+1;
			let sm=m.toString().padStart(2,'0');
			let y=d0.getFullYear().toString();
			let hr=d0.getHours;
			let min=d0.getMinutes;
			let day=sd+"/"+sm+"/"+y+" "+hr+":"+min;
			return day
		}catch(err){
			console.log(err)
		}
	}
	
}
module.exports=dateBE