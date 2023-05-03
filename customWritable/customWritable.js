const { Writable } = require("node:stream");
const fs = require("fs");

class MyWritable extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });

    this.fileName = fileName;
    this.fd = null;
    this.chunks = [];
    this.chunksSize = 0;
    this.writesCount = 0;
  }
  // this will run after the constructor, and it will put off all calling the other methods until we run our callback function
  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      // fd => fileDescriptor => kinda of an ID
      if (err) {
        // if we call the callback with an argument means that we have an error and we should not proceed
        callback(err);
      } else {
        this.fd = fd;
        // no arguments means is was successful
        callback();
      }
    });
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;
    // do our write operation...

    if (this.chunksSize > this.writableHighWaterMark) {
      fs.writeFile(this.fd, Buffer.concat(this.chunks), (err) => {
        if (err) {
          return callback(err);
        }
        this.chunks = [];
        this.chunksSize = 0;
        ++this.writesCount;
        callback();
      });
    } else {
      // once we are done, we should call the callback function
      callback();
    }
  }

  // this is going to run after our stream has finished
  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
      if (err) {
        return callback(err);
      }
      this.chunks = [];
      callback();
    });
  }

  _destroy(error, callback) {
    console.log('number of counts:', this.writesCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        callback(err || error);
      })
    } else {
      callback(error);
    }
  }
}

const writableStream = new MyWritable({
  highWaterMark: 1800,
  fileName: "./text.txt",
});

writableStream.write(Buffer.from("whatever"));
writableStream.end(Buffer.from("our last read!")); // This is needed to run the write method

writableStream.on("finish", () => {
  console.log('Stream was finished.');
})