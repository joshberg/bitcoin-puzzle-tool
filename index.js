const fs = require('fs');
const Mnemonic = require('bitcore-mnemonic');
const bt = require('bitcoinjs-lib');
const bip39 = require('bip39');
const bip32 = require('bip32');
const math = require('mathjs');
let correctKey = '37XTVuaWt1zyUPRgDDpsnoo5ioHk2Da6Fs';
let correctWords;
let attempts = 0;
let validWords = 0;
let startTime = Date.now();
let attemptedSets = [];
let maxHits;
let deletedWords = 0;
let mostAttempts = 0;
let ttv = 0; //time to valid words
let atv = 0; //attempts to valid
let latestMilli = 0;

function timeConversion(millisec) {

    var seconds = (millisec / 1000).toFixed(1);

    var minutes = (millisec / (1000 * 60)).toFixed(1);

    var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

    if (seconds < 60) {
        return seconds + " Sec";
    } else if (minutes < 60) {
        return minutes + " Min";
    } else if (hours < 24) {
        return hours + " Hrs";
    } else {
        return days + " Days";
    }
}

function PrintStatus(address = '', testWords = '') {
    let milliseconds = (Date.now() - startTime);
    console.log("Atv: " + atv + "\t\tTtv: " + ttv + "\tA: " + attempts + "  V: " + validWords + "\tE: " +((validWords/attempts)*100).toString().substring(0,5) + "%  " + "Add: "+ address +  "\t%: " + (mostAttempts/maxHits) + "\tD: " + deletedWords +  "\tT: " + timeConversion(milliseconds) );
}

function Finish() {
    fs.writeFile('Words.txt', correctWords, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log('success');
            console.log(correctWords);
        }
    });
}

var baddress = bt.address;
var bcrypto = bt.crypto;

function getAddress(node) {
    let keyhash = bt.crypto.hash160(node.publicKey);
    let scriptSig = bt.script.witnessPubKeyHash.output.encode(keyhash);
    let addressBytes = bt.crypto.hash160(scriptSig);
    let outputScript = bt.script.scriptHash.output.encode(addressBytes);
    let address = bt.address.fromOutputScript(outputScript, bt.networks.bitcoin);
    return address;
}

/**
 * 
 * @param {string} filename Assumes a .txt extension
 * @param {number} phraseLength  Defaults to 12
 * @param {string} wallet Defaults to the wallet associated with the puzzle linked in the Readme.
 */
function Start(filename, phraseLength=12, wallet = correctKey) {
    return new Promise((resolve, reject) => {
        let words;
        let notFound = true;
        let randoms = [];
        let wordAttempts = [];
        attemptedSets.push('');
        let deltaTime = 0;
        let latestA = 0;
        fs.readFile(`./wordfiles/${filename}.txt`, 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                words = data.split('\r\n');
                maxHits = math.permutations(words.length,phraseLength);
                words.forEach(function(word){
                    wordAttempts[word] = 0;
                });
                PrintStatus();
                while (notFound) {
                    let testWords = '';
                    if(words.length < phraseLength){
                        notFound = true;
                        reject(words);
                    }
                    for (let i = 0; i < phraseLength; i++) {
                        let randomInt = Math.floor(Math.random() * (words.length-1));
                        while (randoms.includes(randomInt)) {
                            randomInt = Math.floor(Math.random() * (words.length-1));
                        }
                        randoms[i] = randomInt;
                    }
                    randoms.forEach(function (val) {
                        wordAttempts[words[val]] += 1;
                        testWords += words[val] + ' ';
                    });
                    words.forEach(function(word){
                        let testLength = wordAttempts[word];
                        if(testLength > mostAttempts){
                            mostAttempts = testLength;
                        }
                        if(testLength>maxHits){
                            words.splice(words.indexOf(word),1);
                            deletedWords++;
                        }
                    });
                    testWords = testWords.trim();
                    if(attemptedSets.includes(testWords)){
                        continue;
                    }
                    attempts++;
                    if (Mnemonic.isValid(testWords)) {                        
                        validWords++;
                        atv = (attempts - latestA); 
                        latestA = attempts;
                        ttv = (Date.now() - (latestMilli))/1000;
                        latestMilli = Date.now();
                        let seed = bip39.mnemonicToSeed(testWords);
                        let node = bip32.fromSeed(seed);
                        let child = node.derivePath("m/44'/0'/0'/0/0");
                        let address = getAddress(child);
                        if(address.substring(0,2).includes(wallet.substring(0,2)))
                            PrintStatus(address,testWords);
                        if (address.includes(wallet)) {
                            correctWords = testWords;
                            notFound = false;
                        }
                    }
                    attemptedSets.push(testWords);
                }
                Finish();
                resolve('Work Complete!!!');
            }
        });
    });
}

module.exports = {
    Start
}