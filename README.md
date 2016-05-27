# LightBlue Bean Data Logging to MySQL

Here's an easy way to get data off an edge sensor and into the cloud. In this recipe, you will create an end-to-end demo system to capture temperature and accelerometer data from a [LightBlue Bean](https://punchthrough.com/bean), connect it to a Raspberry Pi which acts as a BLE hub, and then transport that data to a MySQL database in the cloud. We will use the [ble-bean-stream](https://www.npmjs.com/package/ble-bean-stream) module created by [Humans Forward](http://humansforward.com/) as well as [ble-bean](https://www.npmjs.com/package/ble-bean).


### Skill Level

This recipe assumes basic skills with an understanding of command line, SSH, Raspberry Pi (RPi), MySQL admin skills, JavaScript and Node.


### Timing

15 to 60 minutes depending on your comfort with Node, wi-fi, experience with the Bean, etc.


## Ingredients

*	[Raspberry Pi 2](https://www.raspberrypi.org/products/raspberry-pi-2-model-b/) or greater with an internet connection

*	Bluetooth dongle that works on an RPi such as the [Bluetooth 4.0 USB Module (v2.1 Back-Compatible)](https://www.adafruit.com/products/1327) from [Adafruit Industries](http://adafruit.com) (not needed for RPi 3)

*	[LightBlue Bean](https://punchthrough.com/bean)

*	Functioning install of [Node](https://nodejs.org/en/download/) version 4.4.3 or greater

For more satifying flavour without the fuss, you can forego the Bluetooth dongle by using the new RPi 3 with built in wi-fi and Bluetooth.


## Directions


### Set up a MySQL database account in the cloud

For this demo we decided to go for a quick, easy-to-set-up MySQL instance in the cloud using [FreeSQLdatabase.com](http://www.freesqldatabase.com/) in order to avoid complicated set-up requirements such as security, CIDR, etc. There are several of these services around, but if you have AWS or Google Cloud Platform already set-up, then you are ready to roll.

1.	Create an account on FreeSQLdatabase.

2.	Go to the "Your account" page on FreeSQLdatabase and create your demo database. Hang on to the data connection info, we'll need it in Step 3. When it is created, you will receive an email with all the details you need to set-up your connection. It will contain the following information:

	```
	Host: sql3.freesqldatabase.com
	Database name: <YourDatabaseName>
	Database user: <YourDatabaseUser>
	Database password: <YourDatabasePassword>
	Port number: 3306
	```

3.	Use your favourite MySQL client (e.g. [MySQLWorkbench](https://www.mysql.com/products/workbench/), [Sequel Pro](http://www.sequelpro.com), etc.) and create a connection using the data connection information.

Cool — now we've got our database in the cloud!


### Create a 'readings' table

Next, let's create a table into which we'll load our Bean sensor data:

1.	From within your MySQL client, cut and paste the following into a new SQL script to create a new table:

	```sql
	-- ----------------------------
	--  Table structure for `readings`
	-- ----------------------------
	DROP TABLE IF EXISTS `readings`;
	CREATE TABLE `readings` (
	  `id` int(11) NOT NULL AUTO_INCREMENT,
	  `celsius` int(11) NOT NULL,
	  `accell_x` float NOT NULL,
	  `accell_y` float NOT NULL,
	  `accell_z` float NOT NULL,
	  `captured_at` datetime NOT NULL,
	  PRIMARY KEY (`id`)
	);
	```

2.	Execute and refresh to display the table.


### Initialise the directory on the Raspberry Pi

1.	SSH into your RPi as the user `pi` or, if you are on the Pi desktop, launch the terminal.

2.	Create the location for the demo code. For this demo we use:

	```bashp
	mkdir -p ~/Documents/development/hf-bean-mysql-demo
	```
	
3.	Use `cd ~/Documents/development/hf-bean-mysql-demo` to change into the project directory.


### Install the required Node modules

Let's install the ble-bean-stream modules and all of its dependencies. This step will create a node_modules folder in your project. Please note that installation of NPM modules takes a lot longer on the RPi than on your laptop. Exhibit patience.

1.	**Install ble-bean** node module — Use `npm install ble-bean` to install the module. Some warnings might ensue, ignore them.

2.	**Install ble-bean-stream** node module — Use `npm install ble-bean-stream` to install the module. Some warnings might ensue, ignore them.

3.	**Install streamsql** node module — Use `npm install streamsql` to install the module. Some warnings might ensue, ignore them.

4.	**Install mysql** node module — Use `npm install mysql` to install the module. Some warnings might ensue, ignore them.


### Create the app.js file

At this point, we've installed all the modules. Now we are ready to write our JavaScript file that pulls all of this functionality together:

*	Establish the database connection

*	Configure data polling

*	Stream data to your MySQL database in a stable, throttled manner


To prepare this file, complete the following steps:

1.	From within the project folder type `touch app.js` to create a file.

2.	Using a text editor (e.g. vi, nano, pico), edit app.js and paste in the contents of [app.js](app.js) from our project repo.

3.	Locate and modify the data connection information. Replace the placeholders (e.g. `<YourDatabaseHost>`) with appropriate values.

	```javascript
	// TODO: Update these to match your database connection
	const db = streamsql.connect({
	  driver: 'mysql',
	  host: '<YourDatabaseHost>',
	  port: '3306',
	  database: '<YourDatabaseName>',
	
	  // TODO: Change these to your MySQL user and password
	  user: '<YourDatabaseUser>',
	  password: '<YourDatabasePassword>'
	});
	```

4.	Save the file.


## Serving

### Start capturing data

Now comes the moment of reckoning.

1.	From within the project directory on the RPi type the following:

	```bash
	sudo node app.js
	```

	You should see the following on the terminal as your output:
	
	```
	put stuff here
	```

2.	To see your accelerometer and temperature data, go to your MySQL client and create a new script with the following line and execute:

	```sql
	SELECT * FROM `readings`;
	```

To stop the app.js script, press Ctrl-C.

**Congratulations!**

You have edge sensor data rolling out to the cloud in a robust, simple, easy-to-understand framework. Feel free to let it run independently (don't exceed your data plan). Grab your phone and go for a neighbourhood stroll without disconnecting your Bean. Go on, you've earned it.

Peace,

Paul and Scott, [Humans Forward](http://humansforward.com)
