/*
 * compairlines
 * https://github.com/bat-cha/compairlines
 *
 * Copyright (c) 2012 Baptiste Chatrain
 * Licensed under the MIT license.
 */
//var d3 = require("d3");

exports.getSimilarities = getSimilarities;

/**
 * Get Similarites between airlines using several aggregations to
 * compute cosine similarities.
 *
 * @method getSimilarities
 * @param {Object} data
 * @param {Function} [extra=null] A callback function to update progress
 * @return {Object} Returns a similarities object
 */
function getSimilarities(data, progressBarCallBack) {

    //Airport Dictionnary
    //var airports = getAirports(data.airportsDataSource);
    //console.log(airports.NCE.iata_code);
    //return airports;
    return 'NCE';
    /*
    var start = new Date();

    d3.csv("legs.csv", function(csv) {

        var data = csv.filter(function(row) {
            return (row.nbLeg >= 1000) && (airports[row.origin])
        });

        data.forEach(function(row) {

            var airportO = row.origin;
            var airline = row.airline;
            var size = parseInt(row.nbLeg);

            var ori = airports[row.origin];


            //add origin for similarity computation
            if (!airlineAirportMatrix[airline]) {
                airlineAirportMatrix[airline] = {};
            }
            if (!airlineAirportMatrix[airline][airportO]) {
                airlineAirportMatrix[airline][airportO] = 0;
            }
            airlineAirportMatrix[airline][airportO] += size;

            if (!airlineSize[airline]) {
                airlineSize[airline] = 0;
            }
            airlineSize[airline] += size;

            //do higher level aggregations
            var cityO = ori.city_code;
            var countryO = ori.country_code;
            var regionO = ori.region_code;

            //add city for similarity computation
            if (!airlineCityMatrix[airline]) {
                airlineCityMatrix[airline] = {};
            }
            if (!airlineCityMatrix[airline][cityO]) {
                airlineCityMatrix[airline][cityO] = 0;
            }
            airlineCityMatrix[airline][cityO] += size;
            //add country for similarity computation
            if (!airlineCountryMatrix[airline]) {
                airlineCountryMatrix[airline] = {};
            }
            if (!airlineCountryMatrix[airline][countryO]) {
                airlineCountryMatrix[airline][countryO] = 0;
            }
            airlineCountryMatrix[airline][countryO] += size;
            //add region for similarity computation
            if (!airlineRegionMatrix[airline]) {
                airlineRegionMatrix[airline] = {};
            }
            if (!airlineCityMatrix[airline][regionO]) {
                airlineRegionMatrix[airline][regionO] = 0;
            }
            airlineRegionMatrix[airline][regionO] += size;
        });


        similarityMatrix["airport"] = {};
        similarityMatrix["city"] = {};
        similarityMatrix["country"] = {};
        similarityMatrix["region"] = {};
        for (var a in airlineAirportMatrix) {
            airlines.push(a);
            similarityMatrix["airport"][a] = {};
            similarityMatrix["city"][a] = {};
            similarityMatrix["country"][a] = {};
            similarityMatrix["region"][a] = {};
        }

        var total = airlines.length;
        var current = 0;

        //compute similiraties for all airlines
        interval_progressbar = setInterval(function() {
            for (var i = current; i < current + 1; ++i) {
                var a1 = airlines[i];
                for (var j = i; j < airlines.length; ++j) {
                    var a2 = airlines[j];
                    similarityMatrix["airport"][a1][a2] = computeBoolSimilarity(a1, a2, airlineAirportMatrix);
                    similarityMatrix["airport"][a2][a1] = similarityMatrix["airport"][a1][a2];
                    similarityMatrix["city"][a1][a2] = computeBoolSimilarity(a1, a2, airlineCityMatrix);
                    similarityMatrix["city"][a2][a1] = similarityMatrix["city"][a1][a2];
                    similarityMatrix["country"][a1][a2] = computeBoolSimilarity(a1, a2, airlineCountryMatrix);
                    similarityMatrix["country"][a2][a1] = similarityMatrix["country"][a1][a2];
                    similarityMatrix["region"][a1][a2] = computeBoolSimilarity(a1, a2, airlineRegionMatrix);
                    similarityMatrix["region"][a2][a1] = similarityMatrix["region"][a1][a2];
                }
            }
            percentComplete = parseInt(current / total * 100);
            ++current;
            //console.log(percentComplete);	  
            $("#progressbar").progressbar({
                value: percentComplete
            });
            if (percentComplete == 100) {
                clearInterval(interval_progressbar);
                $("#progressbar").progressbar("destroy");
                var end = new Date();
                var elapsedT = new Date(end - start); // in ms		  
                console.log("similarities computed in " + elapsedT.getTime() + " ms");
                $("#loading").alert('close');
                setRoot("AF");
            }
        }, 0);

    });
*/

}

/**
 * Get the airport dictionnary
 * 
 * @method getAirports
 */
function getAirports(dataSource) {

    var results = {};

    d3.csv(dataSource, function(csv) {
        //header of the CSV
        //iata_code,country_code,city_code,region_code
        csv.forEach(function(row) {
            results[row.iata_code] = row;
        })

        return results;

    });
}
/*

function computeSimilarity(a1, a2, matrix) {

    var similarity = 0;
    var dotProd = 0;
    var norma1 = 0;
    var norma2 = 0;

    for (var airport in matrix[a1]) {
        if (matrix[a2][airport]) {
            dotProd += matrix[a1][airport] * matrix[a2][airport];
        }
        norma1 += Math.pow(matrix[a1][airport], 2);
    }
    for (airport in matrix[a2]) {
        norma2 += Math.pow(matrix[a2][airport], 2);
    }

    norma1 = Math.sqrt(norma1);
    norma2 = Math.sqrt(norma2);
    similarity = dotProd / (norma1 * norma2);
    similarity = Math.round(similarity * 100);
    return similarity;

}

function computeBoolSimilarity(a1, a2, matrix) {

    var similarity = 0;
    var dotProd = 0;
    var norma1 = 0;
    var norma2 = 0;

    for (var airport in matrix[a1]) {
        if (matrix[a2][airport]) {
            dotProd += 1 * 1;
        }
        norma1 += Math.pow(1, 2);
    }
    for (airport in matrix[a2]) {
        norma2 += Math.pow(1, 2);
    }

    norma1 = Math.sqrt(norma1);
    norma2 = Math.sqrt(norma2);
    similarity = dotProd / (norma1 * norma2);
    similarity = Math.round(similarity * 100);
    return similarity;

}
*/
