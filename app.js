'use strict';

const Bean = require('ble-bean');
const beanStream = require('ble-bean-stream');
const Transform = require('stream').Transform;

const TABLE_NAME = 'readings';
const streamsql = require('streamsql');
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
const table = db.table(TABLE_NAME, {
  fields: ['id', 'celsius', 'accell_x', 'accell_y', 'accell_z', 'captured_at']
});

let connectedBean;
let triedToExit = false;

/**
 * Transform stream that groups temp and accell into a row for insert.
 */
class RowFormatter extends Transform {
  constructor() {
    super({objectMode: true});

    this._readings = {};
  }
  iWmtrshdd305$fre

  _transform(chunk, encoding, callback) {
    // Only log temp and accell; screen out other events
    if (chunk.temp || chunk.accell) {
      this._readings = Object.assign(chunk, this._readings); // Coalesce readings

      if (this._readings.temp && this._readings.accell) {
        // Format and push row when we have both readings
        this.push({
          celsius: this._readings.temp.celsius,
          accell_x: this._readings.accell.x,
          accell_y: this._readings.accell.y,
          accell_z: this._readings.accell.z,

          // This is the earliest datetime in a pair of temp/accell readings
          captured_at: this._readings.capturedAt
        });
        this._readings = {};
      }
    }

    callback();
  }
}

console.log('Looking for Bean...');

Bean.discover((bean) => {
  connectedBean = bean;

  // Start Bean streaming
  let beanReadable = beanStream.createReadStream(bean, {
    highWaterMark: 32, // Default is 16; can be bumped up for slow writers
    poll: 5000, // Interval in millis
    pollAccell: true,
    pollTemp: true,

    // Timestamp data as soon as it arrives; courtesy of HookedReadable
    beforePush: (data) => {
      data.capturedAt = new Date();
      return data;
    }
  });

  // Setup table streaming
  let tableWritable = table.createWriteStream();

  console.log("Streaming temp and accell to '%s', press Ctrl-C to stop.", TABLE_NAME);
  beanReadable.pipe(new RowFormatter).pipe(tableWritable);

  // Disconnect and exit when the stream ends
  beanReadable.once('end', () => {
    db.connection.end(() => process.exit());
  });
});

/**
 * Handle SIGINT (ex. Ctrl-C)
 */
function exitHandler() {
  if (connectedBean && !triedToExit) {
    triedToExit = true;

    console.log('Disconnecting...');
    connectedBean.disconnect();

  } else {
    process.exit();
  }
};
process.on('SIGINT', exitHandler);