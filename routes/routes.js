// Grocery Store App

// routes.js - Handles the routing!
// DB Connection Config
var config = require("../config/dbconnection.js");
var _ = require('lodash');

module.exports = function(app, db){

	app.get('/', isLoggedin, function(req, res){
		//res.send("Page /"); // Home Page
		if (!req.session.order) {
			req.session.order = [];
		}
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "SELECT * FROM productInfo WHERE state = (SELECT state FROM address WHERE addressid = :aid)";
				var qparams = [req.session.addressid];
				if (req.session.cat) {
					query = "SELECT * FROM productInfo WHERE state = (SELECT state FROM address WHERE addressid = :aid) AND categoryid = :cid";
					qparams = {aid: req.session.addressid, cid: req.session.cat};
				}
				
				connection.execute(query, qparams, function(err, result){
					if (err) {
						console.log(err);
					} else {
						var products = result.rows;
						var query = "SELECT * FROM productInfo WHERE state = (SELECT state FROM address WHERE addressid = :aid)";
						var qparams = [req.session.addressid];	
						connection.execute(query, qparams, function(err, result){
							if (err) {
								console.log(err);
							} else {
								res.render('index.ejs', {
									products: products,
									category: result.rows
								});
							}
						});
					}
				});
			}
		});
	});

	app.post('/', function(req, res){
		// What happens when a user posts a req? // Order is posted Store order and then move to payment info
		req.session.order.push(req.body.product);
		req.session.cat = req.body.cat;
		res.redirect('/');
		// db.getConnection(config, function(err, connection){
		// 	if (err) {
		// 		console.log(err);
		// 	} else {
		// 		var query = "SELECT * FROM productInfo WHERE addressid = :aid";
		// 		var qparams = [req.session.addressid];
		// 		connection.execute(query, qparams, function(err, result){
		// 			if (err) {
		// 				console.log(err);
		// 			} else {
		// 				res.render('index.ejs', {
		// 					products: result.rows
		// 				});
		// 			}
		// 		});
		// 	}
		// });
	});

	app.get('/signup', function(req, res){
		res.render('signup.ejs');
	});

	app.post('/signup', function(req, res){
		// Insert CC Address get ID Back, Insert CC get ID back, Insert Customer Address get ID back, Insert Customer with CC ID and ADD ID
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "INSERT INTO address(street,city,state,zipcode) VALUES (:street, :city, :state, :zipcode)"; // INSERT CC ADD
				var qparams = {
					street: req.body.ccaddress.STREET,
					city: req.body.ccaddress.CITY,
					state: req.body.ccaddress.STATE,
					zipcode: req.body.ccaddress.ZIPCODE
				};
				connection.execute(query, qparams,{autoCommit: true}, function(err, result){
					if (err) {
						console.log(err);
					} else {
						// Lets get CC ADD ID back
						var query = "SELECT addressid FROM address where ROWNUM <= 1 order by addressid DESC";
						var qparams = {};
						connection.execute(query, qparams, function(err, result){
							if (err) {
								console.log(err);
							} else {
								var tmp_ccadd = result.rows[0].ADDRESSID;

								// Insert Credit Card
								var query = "INSERT INTO creditcard(cardnumber,cvc,nameoncard,expirymonth,expiryyear,paymentaddress) VALUES (:cardnumber, :cvc, :nameoncard, :expirymonth, :expiryyear, :paymentaddress)"; // INSERT CC ADD
								var qparams = {
									cardnumber: req.body.creditcard.CARDNUMBER,
									cvc: req.body.creditcard.CVC,
									nameoncard: req.body.creditcard.NAMEONCARD,
									expirymonth: req.body.creditcard.EXPIRYMONTH,
									expiryyear: req.body.creditcard.EXPIRYYEAR,
									paymentaddress: tmp_ccadd
								};
								var tmp_cnum = qparams.cardnumber;
								connection.execute(query, qparams,{autoCommit: true}, function(err, result){
									if (err) {
										console.log(err);
									} else {
										// Insert C ADD
										var query = "INSERT INTO address(street,city,state,zipcode) VALUES (:street, :city, :state, :zipcode)"; // INSERT CC ADD
										var qparams = {
											street: req.body.address.STREET,
											city: req.body.address.CITY,
											state: req.body.address.STATE,
											zipcode: req.body.address.ZIPCODE
										};
										connection.execute(query, qparams,{autoCommit: true}, function(err, result){
											if (err) {
												console.log(err);
											} else {
												var query = "SELECT addressid FROM address where ROWNUM <= 1 order by addressid DESC";
												var qparams = {};
												connection.execute(query, qparams, function(err, result){
													if (err) {
														console.log(err);
													} else {
														var tmp_cadd = result.rows[0].ADDRESSID;

														// Finally inster into user
														var query = "INSERT INTO customer(firstname,lastname,email,addressid,cardnumber) VALUES (:firstname, :lastname, :email, :addressid, :cardnumber)"; // INSERT CC ADD
														var qparams = {
															firstname: req.body.customer.FIRSTNAME,
															lastname: req.body.customer.LASTNAME,
															email: req.body.customer.EMAIL,
															addressid: tmp_cadd,
															cardnumber: tmp_cnum
														};
														connection.execute(query, qparams,{autoCommit: true}, function(err, result){
															if (err) {
																console.log(err);
															} else {
																// Add CUSTOMER to login table
																var query = "INSERT INTO login(email,password,type) VALUES (:email, :password, :type)"; // INSERT CC ADD
																var qparams = {
																	email: req.body.customer.EMAIL,
																	password: req.body.customer.PASSWORD,
																	type: 'c'
																};
																connection.execute(query, qparams,{autoCommit: true}, function(err, result){
																	if (err) {
																		console.log(err);
																	} else {
																		res.redirect('/login');
																	}
																});
															}
														});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});				
			}
		});
	});	

	app.get('/login', function(req, res){
		res.render('login.ejs');
	});

	// Make middleware to check if user is logged in
	app.post('/login', function(req, res){
		
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "SELECT TYPE FROM login WHERE EMAIL = :email AND PASSWORD = :password";
				var qparams = {email: req.body.login.EMAIL, password: req.body.login.PASSWORD};
				connection.execute(query, qparams, function(err, result){
					if (err) {
						console.log(err);
					} else {
						if (!result.rows[0]) {
							res.send("Not a user");
						} else {
							var table = "";
							if (result.rows[0].TYPE === 'c'){
								table = "CUSTOMER";
							} else {
								table = "STAFF";
							}
							var queryT = "SELECT * FROM " + table + " WHERE EMAIL = :email";
							var qparamsT = {email: req.body.login.EMAIL};
							connection.execute(queryT, qparamsT, function(err, result1){
								req.session.userid = result1.rows[0][Object.keys(result1.rows[0])[0]]; // Check if this is the user id
								req.session.addressid = result1.rows[0].ADDRESSID;
								req.session.usertype = table;
								req.session.loggedin = true;
								var query = "SELECT orderdetail FROM sessionstore WHERE customerid = :cid";
								var qparams = {cid: result1.rows[0][Object.keys(result1.rows[0])[0]]};
								connection.execute(query, qparams, function(err, result){
									if (err) {
										console.log(err);
									} else {
										if (result.rows.length > 0) {
											req.session.order = JSON.parse(result.rows[0].ORDERDETAIL);
										} else {
											req.session.order = [];
										}

										if (req.session.pre){
											res.redirect(req.session.pre);
										} else {
											res.redirect('/');
										}
									}
								});
							});
						}
					}
				});
			}
		});
	});

	app.get('/logout', function(req, res){
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "INSERT INTO sessionstore(customerid, orderdetail) VALUES(:cid, :ord)";
				var qparams = {
					cid: req.session.userid,
					ord: JSON.stringify(req.session.order)
				};
				connection.execute(query, qparams, {autoCommit: true} ,function(err, result){
					if (err) {
						console.log(err);
					} else {
						req.session.loggedin = false;
						res.redirect('/');
					}
				});
			}
		});
	});

	app.get('/checkout', isLoggedin, function(req, res){
		//res.send("Page /products"); // Get data from DB and then calculate price and show a list of cards once done add to DB
		
		var customercards;
		var orderLst = [];
		var orderTtl = 0;

		var finished = _.after(req.session.order.length, renderPage);

		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				// Get Credit Card List and send to Front End here too!
				db.getConnection(config, function(err, connection){
					if (err) {
						console.log(err);
					} else {
						var queryT = "SELECT cardnumber FROM customer WHERE customerid = :id"; // Change this in SQL
						var qparamsT = [req.session.userid];
						connection.execute(queryT, qparamsT, function(err, result){
							if (err) {
								console.log(err);
							} else {
								// VARS
								customercards = result.rows;
								orderLst = [];
								orderTtl = 0;
								req.session.order.forEach(function(item){
									var query = "SELECT price FROM productPrice WHERE productid = :id AND addressid = :aid";
									var qparams = {
										id: item.PRODUCT, 
										aid: req.session.addressid
									};
									connection.execute(query, qparams, function(err, result){
										if (err) {
											console.log(err);
										} else {
											orderTtl += (item.QUANTITY * result.rows[0].PRICE);
											var orderItem = {
												PRODUCTID: item.PRODUCT, // Name
												QUANTITY: item.QUANTITY,
												PRICE: (item.QUANTITY * result.rows[0].PRICE)
											};
											orderLst.push(orderItem);
											finished();
										}
									});
								});
							}
						});
					}
				});
			}
		});

		function renderPage() {
			res.render('checkout.ejs', {
				orderLst: orderLst,
				orderTotal: orderTtl,
				customercards: customercards
			});	
		}
	});

	app.post('/checkout', function(req, res){
		// Handle customer checkout // make order get id back, put all products against order id, change user bal
		var finished = _.after(req.session.order.length, postOrder);
		var finished2 = _.after(req.session.order.length, renderPage);

		req.session.order.forEach(function(orderItem){
			db.getConnection(config, function(err, connection){
				if (err) {
					console.log(err);
				} else {
					db.getConnection(config, function(err, connection){
						if (err) {
							console.log(err);
						} else {
							var query = "SELECT state FROM customer LEFT JOIN address ON customer.ADDRESSID = address.ADDRESSID WHERE customerid = :cid";
							var qparams = {cid: req.session.userid};
							connection.execute(query, qparams, function(err, result){
								if (err) {
									console.log(err);
								} else {
									var state = result.rows[0].STATE;
									var query = "SELECT * FROM warehouse LEFT JOIN address ON warehouse.ADDRESSID = address.ADDRESSID WHERE address.STATE = :state";
									var qparams = {state: state}; 
									connection.execute(query, qparams, function(err, result){
										if (err) {
											console.log(err);
										} else {
											// Got warehouse id now get stock
											var wid = result.rows[0].WAREHOUSEID;
											var query = "SELECT quantity FROM stock WHERE warehouseid = :wid and productid = :pid";
											var qparams = {
												wid: wid,
												pid: orderItem.PRODUCT
											};
											connection.execute(query, qparams, function(err, result){
												if (err) {
													console.log(err);
												} else {
													var quan = result.rows[0].QUANTITY - orderItem.QUANTITY;
													
													if (quan < 0) {
														res.send("Product " + orderItem.PRODUCT + " is not in stock!");
													} else {
														var query = "UPDATE stock SET quantity = :quan WHERE warehouseid = :wid and productid = :pid";
														var qparams = {
															quan: quan,
															wid: wid,
															pid: orderItem.PRODUCT
														};
														connection.execute(query, qparams, {autoCommit: true}, function(err, result){
															if (err) {
																console.log(err);
															} else {
																finished();
															}
														});
													}
												}
											});
										}
									});
								}
							});
						}
					});	
				}
			});
		});

		function postOrder() {
			// Reduce Products in warehouse
			// req.session.order.forEach
				// Get previous quantity then reduce if negative complain
				// Save back again in warehouse
			db.getConnection(config, function(err, connection){
				if (err) {
					console.log(err);
				} else {
					var query = "DELETE FROM sessionstore WHERE customerid = :cid";
					var qparams = {cid: req.session.userid};
					connection.execute(query, qparams, {autoCommit: true}, function(err, result){
						if (err) {
							console.log(err);
						} else {
							var query = "UPDATE customer SET balance = :bal WHERE customerid = :cid";
							var qparams = {
								bal: req.body.totalPrice,
								cid: req.session.userid
							};
							connection.execute(query, qparams, {autoCommit: true}, function(err, result){
								if (err) {
									console.log(err);
								} else {
									var date = new Date();
									var query = "INSERT INTO orderinfo(customerid, cardnumber, orderdate, status) VALUES(:cid, :cardnumber, :orderdate, :status)";
									var qparams = {
										cid: req.session.userid,
										cardnumber: req.body.customercards.CARDNUMBER,
										orderdate: date.toDateString(),
										status: 'Issued'
									};
									connection.execute(query, qparams, {autoCommit: true}, function(err, result){
										if (err) {
											console.log(err);
										} else {
											// Get last inserted order
											var query = "SELECT orderid FROM orderinfo where ROWNUM <= 1 order by orderid DESC";
											var qparams = [];
											connection.execute(query, qparams, function(err, result){
												if (err) {
													console.log(err);
												} else {
													// Use Result to enter into order details
													var orderid = result.rows[0].ORDERID;
													req.session.order.forEach(function(orderItem){
														var query = "INSERT INTO orderdetails(orderid, productid, quantity) VALUES(:orderid, :pid, :quantity)";
														var qparams = {
															orderid: orderid,
															pid: orderItem.PRODUCT,
															quantity: orderItem.QUANTITY
														};
														connection.execute(query, qparams, {autoCommit: true}, function(err, result){
															if (err) {
																console.log(err);
															} else {
																finished2();
															}
														});
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}

		function renderPage() {
			req.session.order = [];
			res.send('Order Posted');
		}
	});

	app.get('/user', isLoggedin, function(req, res){ // Add login middleware // Give customer 2 buttons in the Front End to POST change to address and card
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				// Select c
				var query = "SELECT * FROM customer WHERE customerid = :id";
				var qparams = [req.session.userid];
				connection.execute(query, qparams, function(err, result){
					if (err) {
						console.log(err);
					} else {
						var customer = result.rows;
						// Select c add
						var query = "SELECT * FROM address WHERE addressid = :id";
						var qparams = [customer[0].ADDRESSID];
						connection.execute(query, qparams, function(err, result){
							if (err) {
								console.log(err);
							} else {
								var address = result.rows;
								// Select cc
								var query = "SELECT * FROM creditcard WHERE customerid = :cid";
								var qparams = [customer[0].CUSTOMERID];
								connection.execute(query, qparams, function(err, result){
									if (err) {
										console.log(err);
									} else {
										var creditcard = result.rows;
										// Select cc add
										var query = "SELECT * FROM address WHERE addressid = :id";
										var qparams = [creditcard[0].PAYMENTADDRESS];
										connection.execute(query, qparams, function(err, result){
											if (err) {
												console.log(err);
											} else {
												// Select pass
												var ccaddress = result.rows;
												var query = "SELECT password FROM login WHERE email = :id";
												var qparams = [customer[0].EMAIL];
												connection.execute(query, qparams, function(err, result){
													if (err) {
														console.log(err);
													} else {
														customer[0].PASSWORD = result.rows[0].PASSWORD;
														// Let's finally render the page
														res.render('user.ejs',{
															customer: customer,
															address: address,
															creditcard: creditcard,
															ccaddress: ccaddress
														});
													}
												});
											}
										});
									}
								});
							}
						});

					}
				});
			}
		});
	});

	app.post('/user', isLoggedin, function(req, res){
		//Update Everything
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				// Update c
				var query = "UPDATE customer SET FIRSTNAME = :firstname, LASTNAME = :lastname WHERE customerid = :id";
				var qparams = {
					firstname: req.body.customer.FIRSTNAME,
					lastname: req.body.customer.LASTNAME,
					id: req.body.customer.CUSTOMERID
				};
				connection.execute(query, qparams, {autoCommit: true}, function(err, result){
					if (err) {
						console.log(err);
					} else {
						// Update c add
						var query = "UPDATE address SET STREET = :street, CITY = :city, STATE = :state, ZIPCODE = :zipcode WHERE addressid = :id";
						var qparams = {
							street: req.body.address.STREET,
							city: req.body.address.CITY,
							state: req.body.address.STATE,
							zipcode: req.body.address.ZIPCODE,
							id: req.body.address.ADDRESSID
						};
						connection.execute(query, qparams, {autoCommit: true}, function(err, result){
							if (err) {
								console.log(err);
							} else {
								// Update cc
								var query = "UPDATE creditcard SET CVC = :cvc, NAMEONCARD = :nameoncard, EXPIRYMONTH = :expirymonth, EXPIRYYEAR = :expiryyear WHERE cardnumber = :id";
								var qparams = {
									cvc: req.body.creditcard.CVC,
									nameoncard: req.body.creditcard.NAMEONCARD,
									expirymonth: req.body.creditcard.EXPIRYMONTH,
									expiryyear: req.body.creditcard.EXPIRYYEAR,
									id: req.body.creditcard.CARDNUMBER
								};
								connection.execute(query, qparams, {autoCommit: true}, function(err, result){
									if (err) {
										console.log(err);
									} else {
										// Update cc add
										var query = "UPDATE address SET STREET = :street, CITY = :city, STATE = :state, ZIPCODE = :zipcode WHERE addressid = :id";
										var qparams = {
											street: req.body.ccaddress.STREET,
											city: req.body.ccaddress.CITY,
											state: req.body.ccaddress.STATE,
											zipcode: req.body.ccaddress.ZIPCODE,
											id: req.body.ccaddress.ADDRESSID
										};
										connection.execute(query, qparams, {autoCommit: true}, function(err, result){
											if (err) {
												console.log(err);
											} else {
												// Update pass
												var query = "UPDATE login SET PASSWORD = :password WHERE email = :id";
												var qparams = {
													password: req.body.customer.PASSWORD,
													id: req.body.customer.EMAIL
												};
												connection.execute(query, qparams, {autoCommit: true}, function(err, result){
													if (err) {
														console.log(err);
													} else {
														// Let's finally render the page
														res.send('User Information Updated!');
													}
												});
											}
										});
									}
								});
							}
						});

					}
				});
			}
		});
	});

	app.get('/manager', [isLoggedin, isManager], function(req, res){
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "SELECT * FROM product";
				var qparams = [];
				connection.execute(query, qparams, function(err, result){
					if (err) {
						console.log(err);
					} else {
						var products = result.rows;
						// Get warehouses
						var query = "SELECT * FROM warehouse";
						var qparams = [];
						connection.execute(query, qparams, function(err, result){
							if (err) {
								console.log(err);
							} else {
								res.render('manager.ejs',{
									products: products,
									warehouse: result.rows
								});
							}
						});
					}
				});
			}
		});
	});

	app.post('/manager', isLoggedin, function(req, res){
		if (req.body.selectedProduct){
			req.session.selectedProduct = req.body.selectedProduct;
			res.redirect('/manager/product');
		} else if (req.body.selectedWarehouse){
			req.session.selectedWarehouse = req.body.selectedWarehouse;
			res.redirect('/manager/warehouse');
		}
	});

	app.get('/manager/product', isLoggedin, function(req, res){
		// Send all products so that the user can change them
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "SELECT * FROM productInfo WHERE productid = :id";
				var qparams = [req.session.selectedProduct];
				connection.execute(query, qparams, function(err, result){
					if (err) {
						console.log(err);
					} else {
						res.render('productupdate.ejs',{
							products: result.rows
						});	
					}
				});
			}
		});
	});

	app.post('/manager/product/update', isLoggedin, function(req, res){
		// Manager changes a product UPDATE in table
		console.log(">>>UPDATE");
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "UPDATE product SET PRODUCTNAME = :productname, DETAILS = :details, IMAGE = :image, PRODUCTSIZE = :productsize WHERE productid = :id";
				var qparams = {
					productname: req.body.product.PRODUCTNAME,
					details: req.body.product.DETAILS,
					image: req.body.product.IMAGE,
					productsize: req.body.product.PRODUCTSIZE,
					id: req.session.selectedProduct
				};
				connection.execute(query, qparams, {autoCommit: true}, function(err, result){
					if (err) {
						console.log(err);
					} else {
						res.redirect('/manager/product');
					}
				});
			}
		});
	});

	app.post('/manager/product/delete', isLoggedin, function(req, res){
		// Manager changes a product UPDATE in table
		console.log(">>>DELETE");
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "BEGIN DELETE FROM supplies WHERE productid = :id; DELETE FROM stock WHERE productid = :id; DELETE FROM productprice WHERE productid = :id; DELETE FROM orderdetails WHERE productid = :id; DELETE FROM product WHERE productid = :id; END;";
				var qparams = {id: req.session.selectedProduct};
				connection.execute(query, qparams, {autoCommit: true}, function(err, result){
					if (err) {
						console.log(err);
					} else {
						res.redirect('/manager/product');
					}
				});
			}
		});
	});	

	app.post('/manager/product/price', isLoggedin, function(req, res){
		// Manager changes a product UPDATE in table
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "UPDATE productInfo SET PRICE = :productprice WHERE productid = :id AND state = :state";
				var qparams = {
					productprice: req.body.stateprice.PRICE,
					id: req.body.stateprice.PRODUCTID,
					state: req.body.stateprice.STATE
				};
				connection.execute(query, qparams, {autoCommit: true}, function(err, result){
					if (err) {
						console.log(err);
					} else {
						res.redirect('/manager/product');
					}
				});
			}
		});
	});

	app.get('/manager/product/add', isLoggedin, function(req, res){
		// Send all products so that the user can change them
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "SELECT * FROM address";
				var qparams = [];
				connection.execute(query, qparams, function(err, result){
					if (err) {
						console.log(err);
					} else {
						res.render('addprod.ejs',{
							products: result.rows
						});	
					}
				});
			}
		});
	});

	app.post('/manager/product/add', isLoggedin, function(req, res){
		// Manager changes a product UPDATE in table
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "INSERT INTO product(productname, productsize, details, image) VALUES(:productname, :productsize, :details, :image)";
				var qparams = {
					productname: req.body.product.PRODUCTNAME,
					details: req.body.product.DETAILS,
					image: req.body.product.IMAGE,
					productsize: req.body.product.PRODUCTSIZE
				};
				connection.execute(query, qparams, {autoCommit: true}, function(err, result){
					if (err) {
						console.log(err);
					} else {
						var query = "SELECT productid FROM product where ROWNUM <= 1 order by productid DESC";
						var qparams = {};
						connection.execute(query, qparams, function(err, result){
							if (err) {
								console.log(err);
							} else {
								var pid = result.rows[0].PRODUCTID;
								var query = "INSERT INTO productprice(productid, addressid, price) VALUES(:pid, :aid, :price)";
								var qparams = {
									pid: pid,
									aid: req.body.stateprice.ADDRESSID,
									price: req.body.stateprice.PRICE
								};
								connection.execute(query, qparams, {autoCommit: true}, function(err, result){
									if (err) {
										console.log(err);
									} else {
										res.redirect('/manager');
									}
								});
							}
						});
					}
				});
			}
		});
	});

	app.get('/manager/warehouse', isLoggedin, function(req, res){
		// Send all warehouse and product so that the manager can change the quantity

		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "SELECT * FROM product";
				var qparams = [];
				connection.execute(query, qparams, function(err, result){
					if (err) {
						console.log(err);
					} else {
						var productsAll = result.rows;
						var query = "SELECT * FROM stock LEFT JOIN product ON stock.PRODUCTID = product.PRODUCTID where warehouseid = :wid";
						var qparams = [req.session.selectedWarehouse];
						connection.execute(query, qparams, function(err, result){
							res.render('warehouse.ejs', {
								products: result.rows,
								productsAll: productsAll
							});
						});
					}
				});
			}
		});
	});

	app.post('/manager/warehouse/quantity', isLoggedin, function(req, res){
		// Manager updates products to a warehouse
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "UPDATE stock SET quantity = :quantity WHERE productid = :id AND warehouseid = :wid";
				var qparams = {
					quantity: req.body.products.QUANTITY,
					id: req.body.products.PRODUCTID,
					wid: req.session.selectedWarehouse
				};
				connection.execute(query, qparams, {autoCommit: true}, function(err, result){
					if (err) {
						console.log(err);
					} else {
						res.redirect('/manager/warehouse');
					}
				});
			}
		});
	});

	app.post('/manager/warehouse/product', isLoggedin, function(req, res){
		// Manager adds a new product
		db.getConnection(config, function(err, connection){
			if (err) {
				console.log(err);
			} else {
				var query = "INSERT INTO stock(warehouseid, productid, quantity) VALUES(:wid, :pid, :quantity)";
				var qparams = {
					wid: req.session.selectedWarehouse,
					pid: req.body.products.PRODUCTID,
					quantity: req.body.products.QUANTITY
				};
				connection.execute(query, qparams, {autoCommit: true}, function(err, result){
					if (err) {
						console.log(err);
					} else {
						res.redirect('/manager/warehouse');
					}
				});
			}
		});
	});

	app.get('*', function(req, res){
		res.send('Oops the page does not exist!');
	});
};

// Login Middleware
var isLoggedin = function(req, res, next){
	req.session.pre = req.url;
	if (req.session.loggedin && req.session.loggedin === true) {
		next();
	} else {
		res.redirect('/login');
	}
};

// Manager Middleware
var isManager = function(req, res, next){
	if (req.session.usertype === 'STAFF') {
		next();
	} else {
		res.send('You are not a registered Staff Member!');
	}
};