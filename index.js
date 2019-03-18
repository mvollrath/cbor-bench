const fs = require('fs');
const CBOR = require('./cbor');

const encoders = {
  json: function encodeToJson(data) {
    return JSON.stringify({
      name: 'Strawberry Pie',
      jpeg_data: data.toString('base64'),
    });
  },
  cbor: function encodeToCbor(data) {
    return CBOR.encode({
      name: 'Strawberry Pie',
      jpeg_data: data,
    });
  },
};

const decoders = {
  json: function decodeFromJson(data) {
    const decoded = JSON.parse(data);
    decoded.jpeg_data = Buffer.from(decoded.jpeg_data, 'base64');
    return decoded;
  },
  cbor: function decodeFromCbor(data) {
    return CBOR.decode(data);
  },
};

function benchmark(data, method, runs) {
  const times = [];
  var result;
  for (var i = 0; i < runs; i++) {
    const t0 = process.hrtime();
    result = method(data);
    const dt = process.hrtime(t0);
    const dtMs = dt[0] * 1000 + dt[1] / 1e6;
    times.push(dtMs);
  }
  return [result, times];
}

const JPEG = fs.readFileSync('strawberry_pie.jpg');
const RUNS = 10;

var [jsonEncResult, jsonEncTimes] = benchmark(JPEG, encoders.json, RUNS);
console.log('JSON encoding size:', jsonEncResult.length, 'bytes');
console.log('JSON encoding times (in ms):');
console.log(jsonEncTimes);

var [cborEncResult, cborEncTimes] = benchmark(JPEG, encoders.cbor, RUNS);
console.log('CBOR encoding size:', cborEncResult.byteLength, 'bytes');
console.log('CBOR encoding times (in ms):');
console.log(cborEncTimes);

var [jsonDecResult, jsonDecTimes] = benchmark(jsonEncResult, decoders.json, RUNS);
console.log('JSON decoding times (in ms):');
console.log(jsonDecTimes);

var [cborDecResult, cborDecTimes] = benchmark(cborEncResult, decoders.cbor, RUNS);
console.log('CBOR decoding times (in ms):');
console.log(cborDecTimes);

function median(values){
    values.sort(function(a,b){
    return a-b;
  });

  if(values.length ===0) return 0

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}

console.log('Median JSON encoding time:', median(jsonEncTimes));
console.log('Median CBOR encoding time:', median(cborEncTimes));
console.log('Median JSON decoding time:', median(jsonDecTimes));
console.log('Median CBOR decoding time:', median(cborDecTimes));

function toHexString(byteArray) {
  return byteArray.reduce((output, elem) =>
    (output + ('0' + elem.toString(16)).slice(-2)),
    '');
}

//console.log('JSON', jsonEncResult);
//console.log('CBOR', toHexString(new Uint8Array(cborEncResult)));
