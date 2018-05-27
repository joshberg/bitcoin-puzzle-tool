This is to help brute force this puzzle. The method employed is based on random with uniqueness enforced. It is not the most efficient method.

https://www.reddit.com/r/Bitcoin/comments/8kk0pa/1_btc_is_hidden_in_this_puzzle_good_luck/

<h1>Usage</h1>
<pre>
    const bpt = require('bitcoin-puzzle-tool');

    bpt.Start('myfilename').then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });
</pre>


This has console output so you can see that it is doing something. The output is triggered on addresses that start with "37" because I got annoyed with seeing everything else.

Output labels:

<ls>
<li>Atv: Attempts to last ValidPhrase</li>
<li>Ttv: Time passed since last ValidPhrase (in seconds)</li>
<li>A: Total number of attempts</li>
<li>V: Total number of ValidPhrases</li>
<li>E: Efficiency calculation (validPhrases/attempts)*100 -- This is a poor indicator of efficiency.</li>
<li>Add: Address derived</li>
<li>%: A derivation of attempts versus a permutation of maxHits. (mostAttempts/maxHits) Maxhits follows the formula P!/(P!-R) or something like that...</li>
<li>D: Number of deleted words. These words passed the maxHits threshold. Trying to think of a way to make this part more effective.</li>
<li>T: Total time elapsed.</li>
</ls>

You may need to install windows build tools globally to get the npm install command to run properly.

npm intall windows-build-tools -g

For testing your own word sets, I recommend creating a new wordfiles file. Use one of the existing wordfiles to check your file format.

<h3>Assumptions: </h3>
<ls>
<li>The words chosen are all BIP39 accepted mnemonics.</li>
<li>The address is derived from "m/44'/0'/0'/0/0".</li>
</ls>