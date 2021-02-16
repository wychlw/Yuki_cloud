const crypto = require('crypto');
const fs = require('fs').promises;
const fs_sync = require('fs');

const config = require('./../config');

const user_system = {

	salt: config.salt,

	login(name, password) {
		return fs.readFile("./user_db.json", {
			encoding: "utf-8",
			flag: "r"
		}).then(
			data => {
				let user_data = JSON.parse(data);
				if (!user_data[name]) {
					return Promise.reject([404, 'no such user!']);
				}
				let hash = crypto.createHash('sha256');
				let input_pass_hash = hash.update(password + this.salt).digest().toString('base64');
				if (input_pass_hash != user_data[name].password) {
					return Promise.reject([403, 'Wrong user password']);
				}
				let hash2 = crypto.createHash('sha256');
				let token_hash = hash2.update(name + this.salt).digest().toString('base64');
				let my_date = new Date();
				let time_now = String(my_date.getTime());
				let user_token = time_now + '^' + token_hash;
				return Promise.resolve(user_token);
			}, reason => {
				return Promise.reject(reason);
			}
		);
	},

	valid(name, token) {
		let token_proc = token.split('%');
		var time = token_proc[0];
		var user_token_hash = token_proc[1];

		user_token_hash=(user_token_hash.split(' ')).join('+');
		// is right?
		let hash = crypto.createHash('sha256');
		let token_hash = hash.update(name + this.salt).digest().toString('base64');
		if (token_hash != user_token_hash) {
			return ([403, 'User info incorrect']);
		}

		//is out_of_date?
		let my_date = new Date();
		let time_now = my_date.getTime();
		let create_time = Number(time_now);
		if (time_now - create_time > 864000000) {
			return ([400, 'User login out of date']);
		}

		return ([200, 'Success']);
	},

	valid_authority(name,token,auth) {
		let data=fs_sync.readFileSync("./user_db.json", {
			encoding: "utf-8",
			flag: "r"
		});
		var user_data=JSON.parse(data);
		var valid_data=this.valid(name,token);
		if (valid[0]!=200){
			return valid_data;
		}
		if (!user_data[name]['auth'][auth]){
			return ([403,'No authority!']);
		}
		return ([200,'success']);
	}

}

module.exports = user_system;
