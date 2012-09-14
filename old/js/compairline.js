var width = 1024,
height = 768,
node,
link,
root;

var formatNumber = d3.format(",.0f"),
format = function(d) { return formatNumber(d) + " Legs"; },
color = d3.scale.quantize().domain([0, 100]).range(["grey", "blue", "green", "yellow","orange","red"]);

root = {"name":"SA","size":0,"similarity":100,"parent":{"name":"SA"}};
root.fixed = true;
root.x = width / 2;
root.y = height / 2;

var airlineAirportMatrix = {};
var similarityMatrix = {};
var airlines = [];
var airlineSize = {};

computeSimilarities();


function computeSimilarities() {
  var start = new Date();

  d3.csv("legs.csv",function (csv) {
    
	var data = csv.filter(function(row){return  row.nbLeg >= 5000});
	data.forEach(function(row) {	
	  var airportO = row.origin;
	  var airline = row.airline;
	  var size = parseInt(row.nbLeg);
	  
	  //add origin for similarity computation
	  if (!airlineAirportMatrix[airline]) {        	  
	    airlineAirportMatrix[airline] = {};
	  }
	  if (!airlineAirportMatrix[airline][airportO]){
		airlineAirportMatrix[airline][airportO] = 0;
	  }
	  airlineAirportMatrix[airline][airportO] += size;
	  
	  if(!airlineSize[airline]) {
	    airlineSize[airline] = 0;
	  }
	  airlineSize[airline] += size;
	  
	});
	
	
	for(var a in airlineAirportMatrix) {
      airlines.push(a);
	  similarityMatrix[a] = {};
    }	
	
	//compute similiraties for all airlines
	for (var i = 0; i< airlines.length; ++i) {
	  var a1 = airlines[i];  
	  for (var j = i; j < airlines.length; ++j) {
	    var a2 = airlines[j];		
	    similarityMatrix[a1][a2] = computeBoolSimilarity(a1,a2);		
		similarityMatrix[a2][a1] = similarityMatrix[a1][a2];
	  }
	}
	
	var end = new Date(); 
    var elapsedT = new Date(end - start); // in ms
	
	console.log("similarities computed in "  + elapsedT.getTime() +" ms");
	buildVizNetwork();
    });

}

function computeSimilarity(a1,a2) {

  var similarity = 0;
  var dotProd = 0;
  var norma1 = 0;
  var norma2 = 0;
  
  for (airport in airlineAirportMatrix[a1]) {
    if(airlineAirportMatrix[a2][airport]) {
	  dotProd += airlineAirportMatrix[a1][airport] * airlineAirportMatrix[a2][airport];	  
	}
	norma1 += Math.pow(airlineAirportMatrix[a1][airport],2);
  }
  for (airport in airlineAirportMatrix[a2]) {
    norma2 += Math.pow(airlineAirportMatrix[a2][airport],2);
  }
  
  norma1 = Math.sqrt(norma1);
  norma2 = Math.sqrt(norma2);
  similarity = dotProd / (norma1 * norma2);
  similarity = Math.round(similarity*100);
  return similarity;

}

function computeBoolSimilarity(a1,a2) {

  var similarity = 0;
  var dotProd = 0;
  var norma1 = 0;
  var norma2 = 0;
  
  for (airport in airlineAirportMatrix[a1]) {
    if(airlineAirportMatrix[a2][airport]) {
	  dotProd += 1 * 1;	  
	}
	norma1 += Math.pow(1,2);
  }
  for (airport in airlineAirportMatrix[a2]) {
    norma2 += Math.pow(1,2);
  }
  
  norma1 = Math.sqrt(norma1);
  norma2 = Math.sqrt(norma2);
  similarity = dotProd / (norma1 * norma2);
  similarity = Math.round(similarity*100);
  return similarity;

}

var force = d3.layout.force()
    .on("tick", tick)
	.friction(0.1)
    .linkDistance(function(d) { return 4*(100-d.target.similarity); })
    .size([width, height]);

var vis = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);
	
	
var text = vis.append("svg:g").selectAll("g")
    .data(force.nodes())
    .enter().append("svg:g");

function buildVizNetwork(){
    var rootAirline = root.name;
	root.children = [];
    for (airline in similarityMatrix[rootAirline]) {
		if (airline != rootAirline) {
		  var size = airlineSize[airline];			
		  root.children.push({"name":airline,"size":size,"similarity":similarityMatrix[rootAirline][airline],"parent":root});		
		}
	}    
	update();
  
}

function update() {
  var nodes = flatten(root),
      links = d3.layout.tree().links(nodes);

  // Restart the force layout.
  force
      .nodes(nodes)
      .links(links)
      .start();
	  
	  //remove the text
  d3.selectAll("text").remove();
  
  // Update the links…
  link = vis.selectAll("line.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links.
  link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  // Exit any old links.
  link.exit().remove();
  
  // Update the nodes…
  node = vis.selectAll("circle.node")
      .data(nodes, function(d) { return d.id; })
      .style("fill", function(d) { return d.color = color(d.similarity); })
  

  node.transition()
      .attr("r", function(d) { return d.children ? 10 : Math.sqrt(d.size) / 10; });

  // Enter any new nodes.
  node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.children ? 10 : Math.sqrt(d.size) / 10; })
      .style("fill", color)
      .on("click", changeRoot)
      .call(force.drag)
	  .append("title").text(function(d) { return d.name 
		+ "\n" + "Similarity with " + d.parent.name + " " + formatNumber(d.similarity) + "%" 
		+ "\n" + "Size " + d.size + " Legs"; });

text = vis.append("svg:g").selectAll("g")
    .data(force.nodes())
    .enter().append("svg:g");

  // A copy of the text with a thick white stroke for legibility.
  text.append("svg:text")
	.attr("x", 8)
	.attr("y", ".31em")
	.attr("class", "shadow")
	.text(function(d) { return d.name });

  text.append("svg:text")
	.attr("x", 8)
	.attr("y", ".31em")
	.attr("class", "label")
	.text(function(d) { return d.name });	  

  // Exit any old nodes.  
  node.exit().remove();

}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
	  
  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

// change root.
function changeRoot(d) {

  root = {"name":d.name,"size":0,"similarity":100,"parent":{"name":d.name}};
  root.fixed = true;
  root.x = width / 2;
  root.y = height / 2;
  buildVizNetwork();
  
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
    if (!node.id) node.id = ++i;
    nodes.push(node);
    return node.size;
  }

  root.size = recurse(root);
  return nodes;
}
