class Env{
	constructor(){
		this.odbc='mysql2/promise';
		this.port = process.env.PORT || 3002;
		this.adr="0.0.0.0";
	}
}
module.exports = Env
