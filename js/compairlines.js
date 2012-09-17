var width = 800,
    height = 800,
    node,
    link,
    root;

var percentComplete = 0;

var formatNumber = d3.format(",.0f"),
    format = function(d) {
        return formatNumber(d) + " Legs";
    },
    color = d3.scale.quantize().domain([0, 100]).range(["grey", "green", "blue", "yellow", "orange", "red"]);
levels = d3.scale.quantize().domain([0, 100]).range(["region", "country", "city", "airport"]);


var force = d3.layout.force().friction(0.65).on("tick", tick).linkDistance(function(d) {
    return 3 * (100 - d.target.similarity);
}).size([width, height]);

var vis = d3.select("#chart").append("svg").attr("width", width).attr("height", height);


var text = vis.append("svg:g").selectAll("g").data(force.nodes()).enter().append("svg:g");

var level = levels(100);
var threshold = 25;

//airports dictionary
var airports = {};

var airlineAirportMatrix = {};
var airlineCityMatrix = {};
var airlineCountryMatrix = {};
var airlineRegionMatrix = {};

var airlineAirportMatrix = {};
var similarityMatrix = {};
var airlines = [];
var airlineSize = {};

var rootChildrenIndex = {};

buildAirports();

function buildAirports() {
    //header iata_code,country_code,city_code,region_code
    d3.csv("data/airports.csv", function(csv) {

        csv.forEach(function(row) {
            airports[row.iata_code] = row;
        })

        computeSimilarities();

    });
}

function computeSimilarities() {
    var start = new Date();
    //header origin,destination,airline,nbLeg
    d3.csv("data/legs.csv", function(csv) {

        var data = csv.filter(function(row) {
            return (row.nbLeg >= 0) && (airports[row.origin])
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

        var total = airlines.length * (airlines.length - 1) / 2;
        var airline1 = 0;
        var airline2 =1;
        var a1a2Counter = 0;
        var step = 200;
        var currentStep =1;
        //compute similiraties for all airlines
        interval_progressbar = setInterval(function() {
            
            while (a1a2Counter < currentStep * total / step) {
                var a1 = airlines[airline1];
                var a2 = airlines[airline2];
                similarityMatrix["airport"][a1][a2] = computeBoolSimilarity(a1, a2, airlineAirportMatrix);
                similarityMatrix["airport"][a2][a1] = similarityMatrix["airport"][a1][a2];
                similarityMatrix["city"][a1][a2] = computeBoolSimilarity(a1, a2, airlineCityMatrix);
                similarityMatrix["city"][a2][a1] = similarityMatrix["city"][a1][a2];
                similarityMatrix["country"][a1][a2] = computeBoolSimilarity(a1, a2, airlineCountryMatrix);
                similarityMatrix["country"][a2][a1] = similarityMatrix["country"][a1][a2];
                similarityMatrix["region"][a1][a2] = computeBoolSimilarity(a1, a2, airlineRegionMatrix);
                similarityMatrix["region"][a2][a1] = similarityMatrix["region"][a1][a2];

                ++a1a2Counter;
                ++airline2;
                if (airline2 == airlines.length) {
                    ++airline1;
                    airline2 = airline1;
                }
            }
            ++currentStep;            
            console.log(a1+" "+a2);
            percentComplete = parseInt(a1a2Counter / total * 100);
            $("#progressbar").css('width', percentComplete + "%");            
            console.log(percentComplete+"%");
            
            if (airline2 == airlines.length) {
                ++airline1;
                airline2 = airline1;                
            }
            if (percentComplete==100 ||airline1 == airlines.length) {
                clearInterval(interval_progressbar);
                $("#progressbarContainer").remove();
                var end = new Date();
                var elapsedT = new Date(end - start); // in ms		  
                console.log("similarities computed in " + elapsedT.getTime() + " ms");
                $("#loading").alert('close');
                setRoot("AF");
            }
        }, 0);

    });


}

function computeSimilarity(a1, a2, matrix) {

    var similarity = 0;
    var dotProd = 0;
    var norma1 = 0;
    var norma2 = 0;

    for (airport in matrix[a1]) {
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

    for (airport in matrix[a1]) {
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

function buildVizNetwork() {

    var rootAirline = root.name;

    if (typeof root.children === 'undefined') {
        root.children = [];
    }

    for (airline in similarityMatrix[level][rootAirline]) {
        if (airline != rootAirline && similarityMatrix[level][rootAirline][airline] >= threshold) {

            var size = airlineSize[airline];
            var updatedChild = {
                name: airline,
                size: size,
                similarity: similarityMatrix[level][rootAirline][airline],
                parent: root
            };
            if (typeof rootChildrenIndex[airline] === 'undefined' || typeof root.children[rootChildrenIndex[airline]] === 'undefined') {
                root.children.push(updatedChild);
                rootChildrenIndex[airline] = root.children.length - 1;
            }
            else {
                root.children[rootChildrenIndex[airline]].similarity = similarityMatrix[level][rootAirline][airline];
                root.children[rootChildrenIndex[airline]].parent = root;
            }
        } else if (similarityMatrix[level][rootAirline][airline] < threshold && !(typeof rootChildrenIndex[airline] === 'undefined') && !(typeof root.children[rootChildrenIndex[airline]] === 'undefined')) {
            for (var index = rootChildrenIndex[airline]+1; index < root.children.length; ++index ) {
                rootChildrenIndex[root.children[index].name] -= 1;
            }
            root.children.splice(rootChildrenIndex[airline],1);
            delete rootChildrenIndex[airline];
        }
    }
    update();
    getTopTen();

}

function getTopTen() {
    var sorted = [];
    for (competitor in similarityMatrix[level][root.name]) {
        if (competitor != root.name) {
            sorted.push({
                "airline": competitor,
                "similarity": similarityMatrix[level][root.name][competitor]
            });
        }
    }
    sorted.sort(function(a, b) {
        return b.similarity - a.similarity
    });
    var table = '<table class="table table-striped"><thead><tr><th>IATA code</th><th>Similarity</th></tr></thead><tbody>';
    for (airline = 0; airline < 10; ++airline) {
        var a = sorted[airline];        
        table += ('<tr><td>'+a.airline+'</td><td>'+a.similarity+'%</td></tr>');
    }
    table+='</tbody></table>';
    $('#topTen').html(table);
   

}

function update() {
    var nodes = flatten(root),
        links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force.nodes(nodes).links(links).start();

    //remove the text
    d3.selectAll("text").remove();

    // Update the links…
    link = vis.selectAll("line.link").data(links, function(d) {
        return d.target.name;
    });

    // Enter any new links.
    link.enter().insert("line", ".node").attr("class", "link").attr("x1", function(d) {
        return d.source.x;
    }).attr("y1", function(d) {
        return d.source.y;
    }).attr("x2", function(d) {
        return d.target.x;
    }).attr("y2", function(d) {
        return d.target.y;
    });

    // Exit any old links.
    link.exit().remove();

    // Update the nodes…
    node = vis.selectAll("circle.node").data(nodes, function(d) {
        return d.name;
    });/*.style("fill", function(d) {
        return d.color = color(d.similarity);
    }).attr("r", function(d) {
        return d.children ? 10 : Math.sqrt(d.size) / 20;
    })*/

    vis.selectAll("title.node").transition().text(function(d) {
        return d.name + "\n" + "Similarity with " + d.parent.name + " " + formatNumber(d.similarity) + "%" + "\n" + "Size " + d.size + " Legs";
    });
    
    //console.log(node.enter());
    //console.log(node.exit());



    node.transition().style("fill", function(d) {
        return d.color = color(d.similarity);
    }).attr("r", function(d) {
        return d.children ? 10 : Math.sqrt(d.size) / 20;
    });

    // Enter any new nodes.
    node.enter().append("circle").attr("class", "node").attr("cx", function(d) {
        return d.x;
    }).attr("cy", function(d) {
        return d.y;
    }).attr("r", function(d) {
        return d.children ? 10 : Math.sqrt(d.size) / 20;
    }).style("fill", function(d) {
        return d.color = color(d.similarity);
    }).on("click", changeRoot).call(force.drag).append("title").text(function(d) {
        return d.name + "\n" + "Similarity with " + d.parent.name + " " + formatNumber(d.similarity) + "%" + "\n" + "Size " + d.size + " Legs";
    });


    // Exit any old nodes.  
    node.exit().remove();

    text = vis.append("svg:g").selectAll("g").data(nodes, function(d) {
        return d.name;
    }).enter().append("svg:g");

    // A copy of the text with a thick white stroke for legibility.
    text.append("svg:text").attr("x", 8).attr("y", ".31em").attr("class", "shadow").text(function(d) {
        return (d.similarity >= 10) ? d.name : "";
    });

    text.append("svg:text").attr("x", 8).attr("y", ".31em").attr("class", "label").text(function(d) {
        return (d.similarity >= 10) ? d.name : "";
    });



}

function color(d) {
    return d.color = color(d.similarity);
}

function tick() {
    link.attr("x1", function(d) {
        return d.source.x;
    }).attr("y1", function(d) {
        return d.source.y;
    }).attr("x2", function(d) {
        return d.target.x;
    }).attr("y2", function(d) {
        return d.target.y;
    });

    node.attr("cx", function(d) {
        return d.x;
    }).attr("cy", function(d) {
        return d.y;
    });

    text.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
}

// change root.
function changeRoot(d) {

    setRoot(d.name);

}

function updateRoot() {
    var name = $("#rootAirline").val();
    setRoot(name);

}

function setRoot(name) {

    root = {
        "name": name,
        "size": 0,
        "similarity": 100,
        "parent": root
    };
    root.parent = root;
    root.fixed = true;
    root.x = width / 2;
    root.y = height / 2;
    buildVizNetwork(level);
}

// Returns a list of all nodes under the root.
function flatten(root) {
    var nodes = [];

    function recurse(node) {
        if (node.children) node.size = node.children.reduce(function(p, v) {
            return p + recurse(v);
        }, 0);
        nodes.push(node);
        return node.size;
    }

    root.size = recurse(root);
    return nodes;
}

function updateLevel(newValue) {
    var previousLevel = level;
    level = levels(newValue);
    if (level != previousLevel) {

        $("#levelName").html(level);
        buildVizNetwork();
    }
}

function updateThreshold(newValue) {
    var previousThreshold = threshold;
    threshold = newValue;
    if (threshold != previousThreshold) {

        $("#threshold").html(threshold+"%");
        buildVizNetwork();
    }
}