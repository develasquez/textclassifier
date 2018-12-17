/* eslint-disable 
var localStorage = {
    items: {},
    getItem: function(key) {
        return localStorage.items[key];
    },
    setItem: function(key, value) {
        localStorage.items[key] = value;
    },
    clear: function() {
        localStorage.items = {}
    }
};       eslint-disable */
const redis = require('./redis');
 
var localStorage = {
    getItem: async function (key) {
        return await redis.get(key);
    },
    setItem: function (key, value) {
        redis.set(key, value);
    }
};

Array.prototype.forEachAsync = async function (fn) {
    for (let t of this) { await fn(t) }
}

Array.prototype.forEachAsyncParallel = async function (fn) {
    await Promise.all(this.map(fn));
}
/*
var localStorage = {
    items: {},
    getItem: async function(key) {
        return  localStorage.items[key];
    },
    setItem: function(key, value) {
        localStorage.items[key] = value;
    },
    clear: function() {
        localStorage.items = {}
    }
};  */ 
 
var Bayes = (async function (Bayes) {
    Array.prototype.unique = function () {
        var u = {},
            a = [];
        for (var i = 0, l = this.length; i < l; ++i) {
            if (u.hasOwnProperty(this[i])) {
                continue;
            }
            a.push(this[i]);
            u[this[i]] = 1;
        }
        return a;
    }
    var stemKey = function (stem, label) {
        return '_Bayes::stem:' + stem + '::label:' + label;
    };
    var docCountKey = function (label) {
        return '_Bayes::docCount:' + label;
    };
    var stemCountKey = function (stem) {
        return '_Bayes::stemCount:' + stem;
    };
 
    var log = function (text) {
        console.log(text);
    };
 
    var tokenize = function (text) {
        text = (text.toString() + "").toLowerCase().replace(/\W/g, ' ').replace(/\s+/g, ' ').trim().split(' ').unique();
        return text;
    };
 
    var getLabels = async function () {
        var labels = await localStorage.getItem('_Bayes::registeredLabels');
        if (!labels) labels = '';
        return await labels.split(',').filter(async function (a) {
            return await a.length;
        });
    };
 
    var registerLabel = async function (label) {
        var labels = await getLabels();
        if (labels.indexOf(label) === -1) {
            labels.push(label);
            localStorage.setItem('_Bayes::registeredLabels', labels.join(','));
        }
        return true;
    };
 
    var stemLabelCount = async function (stem, label) {
        var count = parseInt(await localStorage.getItem(stemKey(stem, label)));
        if (!count) count = 0;
        return count;
    };
    var stemInverseLabelCount = async function (stem, label) {
        var labels = await getLabels();
        var total = 0;
        for (var i = 0, length = labels.length; i < length; i++) {
            if (labels[i] === label)
                continue;
            total += parseInt(await stemLabelCount(stem, labels[i]));
        }
        return total;
    };
 
    var stemTotalCount = async function (stem) {
        var count = parseInt(await localStorage.getItem(stemCountKey(stem)));
        if (!count) count = 0;
        return count;
    };
    var docCount = async function (label) {
        var count = parseInt(await localStorage.getItem( await docCountKey(label)));
        if (!count) count = 0;
        return count;
    };
    var docInverseCount = async function (label) {
        var labels = await getLabels();
        var total = 0;
        for (var i = 0, length = labels.length; i < length; i++) {
            if (labels[i] === label)
                continue;
            total += parseInt(await docCount(labels[i]));
        }
        return total;
    };
    var increment = async function (key) {
        var count = parseInt(await localStorage.getItem(key));
        if (!count) count = 0;
        await localStorage.setItem(key, parseInt(count) + 1);
        return count + 1;
    };
 
    var incrementStem = async function  (stem, label) {
        await increment(await stemCountKey(stem));
        await increment(await stemKey(stem, label));
    };
 
    var incrementDocCount = async function (label) {
        return await increment(await docCountKey(label));
    };
 
    Bayes.train = async function (text, label) {
        await registerLabel(label);
        var words = await tokenize(text);
        var length = words.length;
        for (var i = 0; i < length; i++){
            await incrementStem(words[i], label);
        }
        await incrementDocCount(label);
        return true;
    };
 
    Bayes.guess = async function (text) {
        var words = await tokenize(text);
        var length = words.length;
        var labels = await getLabels();
        var totalDocCount = 0;
        var docCounts = {};
        var docInverseCounts = {};
        var scores = {};
        var labelProbability = {};
 
        for (var j = 0; j < labels.length; j++) {
            var label = labels[j];
            docCounts[label] = await docCount(label);
            docInverseCounts[label] = await docInverseCount(label);
            totalDocCount += parseInt(docCounts[label]);
        }
 
        for (var j = 0; j < labels.length; j++) {
            var label = labels[j];
            var logSum = 0;
            labelProbability[label] = docCounts[label] / totalDocCount;
 
            for (var i = 0; i < length; i++) {
                var word = words[i];
                var _stemTotalCount = await stemTotalCount(word);
                if (_stemTotalCount === 0) {
                    continue;
                } else {
                    var wordProbability = await stemLabelCount(word, label) / docCounts[label];
                    var wordInverseProbability = await stemInverseLabelCount(word, label) / docInverseCounts[label];
                    var wordicity = wordProbability / (wordProbability + wordInverseProbability);
 
                    wordicity = ((1 * 0.5) + (_stemTotalCount * wordicity)) / (1 + _stemTotalCount);
                    if (wordicity === 0)
                        wordicity = 0.01;
                    else if (wordicity === 1)
                        wordicity = 0.99;
                }
 
                logSum += (Math.log(1 - wordicity) - Math.log(wordicity));
                //log(label + "icity of " + word + ": " + wordicity);
            }
            scores[label] = 1 / (1 + Math.exp(logSum));
        }
        return scores;
    };
 
    Bayes.extractWinner = async function (scores) {
        var bestScore = 0;
        var bestLabel = null;
        for (var label in scores) {
            if (scores[label] > bestScore) {
                bestScore = scores[label];
                bestLabel = label;
            }
        }
        return {
            label: bestLabel,
            score: bestScore
        };
    };
 
    return Bayes;
})(Bayes || {});
 
module.exports = {
    init: async () => {
        await redis.init();
        return Bayes;
    }
};
 
