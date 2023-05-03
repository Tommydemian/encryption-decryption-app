const { Writable } = require("node:stream");
const fs = require("fs");


class MyWritable extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });

    this.fileName = fileName;
    this.fd = null;
    this.chunks = [];
    this.chunksSize = 0;
  }
    // this will run after the constructor, and it will put off all calling the other methods until we run our callback function
  _construct(callback){
    fs.open(this.fileName, 'w', (err, fd) => { // fd => fileDescriptor => kinda of an ID
      if (err) {
        // if we call the callback with an argument means that we have an error and we should not proceed
        callback(err);
      } else {
        this.fd = fd;
        // no arguments means is was successful
        callback()
      }
    });
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    this.chunksSize += chunk.length
    // do our write operation...

    if (this.chunksSize > this.writableHighWaterMark) {
        fs.writeFile(this.fd, Buffer.concat)
    }


    // once we are done, we should call the callback function
    callback();
  }

//   _final(){

//   }

//   _destroy(){

//   }
}

const writableStream = new MyWritable({ highWaterMark: 1800, fileName: './text.txt' });
writableStream.write(Buffer.from("whatever"));
// writableStream.end(Buffer.from("this is my last write"));
