const chars = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/-_.()'].sort();
const numShards = 5;
const prefixLength = 2;
const dbName = "yourDatabase";
const collName = "yourCollection";
const shardKey = "yourShardKey";
const ns = `${dbName}.${collName}`;
const shards = ["shard01", "shard02", "shard03", "shard04", "shard05"];

function getLexSplits(charset, partitions, prefixLength) {
    const total = Math.pow(charset.length, prefixLength);
    const step = Math.floor(total / partitions);
    const splits = [];

    for (let i = 1; i < partitions; i++) {
        let n = i * step;
        let val = '';
        for (let j = 0; j < prefixLength; j++) {
            val = charset[n % charset.length] + val;
            n = Math.floor(n / charset.length);
        }
        splits.push(val);
    }
    return splits;
}

const splitPoints = getLexSplits(chars, numShards, prefixLength);

console.log("### Split Commands:");
splitPoints.forEach(point => {
    console.log(`sh.splitAt("${ns}", { "${shardKey}": "${point}" });`);
});

console.log("\n### MoveChunk Commands:");
const boundaries = ["MinKey", ...splitPoints, "MaxKey"];
for (let i = 0; i < numShards; i++) {
    const lower = boundaries[i];
    const upper = boundaries[i + 1];

    const lowerStr = lower === "MinKey" ? "MinKey" : `"${lower}"`;
    const upperStr = upper === "MaxKey" ? "MaxKey" : `"${upper}"`;

    console.log(`sh.moveChunk("${ns}", { "${shardKey}": { "$gte": ${lowerStr}, "$lt": ${upperStr} } }, "${shards[i]}");`);
}