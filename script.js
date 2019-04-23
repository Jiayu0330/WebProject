var geoP = d3.json("data/world-countries.json")
//var stateP = d3.csv("data/states.csv")


// Promise.all([geoP, stateP])
//        .then(function(values)
//        {
//          var geoData = values[0];
//          var stateData = values[1];
//
//          console.log(geoData, stateData);
//
//          var stateDict = {}
//          stateData.forEach(function(state)
//          {
//            stateDict[state.NAME.trim()] = state; //trim() gets rid of spaces
//          })
//
//          geoData.features.forEach(function(state)
//          {
//            state.properties.ABBR = stateDict[state.properties.name].ABBR;
//          })
//
//          console.log(stateDict);
//
//          drawMap(geoData);
//        })


geoP.then(function(geoData)
{
  console.log(geoData);
  drawMap(geoData);
},
function(err) {
  console.log(err);
})


var drawMap = function(geoData)
{
  var screen = {width: 700, height: 600}

  var projection = d3.geoAlbersUsa()
                     .translate([screen.width/2, screen.height/2])
                     .scale([screen.width]);

  var countryGenerator = d3.geoPath()
                         .projection(projection);

  //console.log("coord", projection([-85, 35]));

  var svg = d3.select("body")
              .append("svg")
              .attr("width", screen.width)
              .attr("height", screen.height);

  var countries = svg.append("g")
                  .attr("id", "countries")
                  .selectAll("g")
                  .data(geoData.features) //array
                  .append("g")
                  .classed("country", true);

  countries.append("path")
        .attr("d", function(d) {
          return stateGenerator(d);})
        .attr("stroke", "red")
        .attr("fill", "none");

  countries.append("text")
        .text(function(d) {return d.properties.ABBR;})
        .attr("x", function(d) {return stateGenerator.centroid(d)[0];})
        .attr("y", function(d) {return stateGenerator.centroid(d)[1];})

}
