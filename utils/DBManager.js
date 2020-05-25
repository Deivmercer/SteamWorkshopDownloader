const sqlite = require("sqlite3").verbose();
const md5 = require("md5");

module.exports = {

	createConnection: function(path) {

		let connection = new sqlite.Database(path, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
			if(err)
				console.log(err);
		});
		connection.serialize(function() {

			connection.all("SELECT name " +
						   "FROM sqlite_master " +
						   "WHERE type='table' " +
						   "AND name='users';", [], function(err, rows) {
				if (err)
					throw err;
				if(rows.length === 0)
					connection.run("CREATE TABLE users (" +
										"id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, " +
										"username TEXT NOT NULL, " +
										"password TEXT NOT NULL, " +
										"permission TEXT CHECK(permission IN ('N', 'E', 'A') ) NOT NULL DEFAULT 'E'" +
								   ");");
			});

			connection.all("SELECT name " +
				   		   "FROM sqlite_master " +
				   		   "WHERE type='table' " +
				   		   "AND name='maps';", [], function(err, rows) {
				if (err)
					throw err;
				if(rows.length === 0)
					connection.run("CREATE TABLE maps (" +
										"id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, " +
										"path TEXT NOT NULL, " +
										"contentId TEXT NOT NULL, " +
										"user INTEGER NOT NULL, " +
										"FOREIGN KEY(user) REFERENCES users(id)" +
								   ");");
			});
		});

		return connection;
	},

	selectAllUsers: function(connection) {

		return new Promise((resolve, reject) => {
			connection.all(`SELECT id, username, permission 
							FROM users;`, [], function(err, rows) {
				if (err)
					reject(err);
				else
					resolve(rows);
			});
		});
	},

	selectSingleUser: function(connection, user) {

		return new Promise((resolve, reject) => {
			connection.all(`SELECT id, permission 
							FROM users 
							WHERE username = '${user.username}' 
							AND password = '${md5(user.password)}';`, [], function(err, rows) {
				if (err)
					reject(err);
				if(rows.length === 1)
					resolve(rows[0]);
				else
					resolve(-1);
			});
		});
	},

	insertUser: function(connection, user) {

		return new Promise((resolve, reject) => {
			connection.all(`INSERT INTO users(id, username, password, permission) 
							VALUES(null, '${user.username}', '${md5(user.password)}', 'N');`, [], function(err) {
				if (err)
					reject(err);
				else
					resolve();
			});
		});
	},

	updateUserPermission: function(connection, userId, permission) {

		return new Promise((resolve, reject) => {
			connection.all(`UPDATE users 
							SET permission = '${permission}'
							WHERE id = ${userId};`, [], function(err) {
				if (err)
					reject(err);
				else
					resolve();
			});
		});
	},
	
	selectSingleMap: function(connection, contentId) {

		return new Promise((resolve, reject) => {
			connection.all(`SELECT id
							FROM maps 
							WHERE contentId = '${contentId}';`, [], function(err, rows) {
				if (err)
					reject(err);
				if(rows.length === 1)
					resolve(rows[0].id);
				else
					resolve(-1);
			});
		});
	},

	insertMap: function(connection, userId, contentId, path) {

		return new Promise((resolve, reject) => {
			connection.all(`INSERT INTO maps(id, path, contentId, user) 
							VALUES(null, '${path}', '${contentId}','${userId}');`, [], function(err) {
				if (err)
					reject(err);
				else
					resolve();
			});
		});
	}
};
