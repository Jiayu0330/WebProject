var geoP = d3.json("data/world-countries.json")
var countriesP = d3.csv("data/Percentage_People_Using_Internet.csv")


Promise.all([geoP, countriesP])
       .then(function(values)
       {
         var geoData = values[0];
         var countries = values[1];

         console.log(geoData, countries);

         var countriesDict = {}
         countries.forEach(function(country)
         {
           countriesDict[country.CountryName] = country; //trim() gets rid of spaces
         })

         geoData.features.forEach(function(feature)
         {
           feature.properties.peopleUsingInternet = countriesDict[feature.properties.name_sort];
         })

         console.log(countriesDict);

         drawMap(geoData);
       })


// geoP.then(function(geoData)
// {
//   console.log(geoData);
//   drawMap(geoData);
// },
// function(err) {
//   console.log(err);
// })


var drawMap = function(geoData)
{
  var screen = {width: 1200, height: 650}

  var projection = d3.geoEqualEarth()
                     .translate([screen.width/2, screen.height/2])
                     .scale([220]);

  var countryGenerator = d3.geoPath()
                         .projection(projection);

  //console.log("coord", projection([-85, 35]));

  var svg = d3.select("body")
              .append("svg")
              .attr("width", screen.width)
              .attr("height", screen.height);

  // svg.selectAll("path")
  //    .data(geoData.features)
  //    .enter()
  //    .append("path")
  //    .attr("d", countryGenerator);

  var countries = svg.append("g")
                  .attr("id", "countries")
                  .selectAll("g")
                  .data(geoData.features) //array
                  .enter()
                  .append("g")
                  .classed("country", true)

  countries.append("path")
           .attr("d", countryGenerator)
           .attr("id", function(d) {return d.properties.name;})
           .attr("stroke", "black")
           .attr("fill", "orange")
           .on("click", function(d) {
             console.log("halo");
           })

  // d3.select("#United States")
  //   .attr("fill", "red");

  countries.append("text")
           .attr("id", "countryAbbrev")
           .text(function(d) {return d.properties.abbrev;})
           .attr("x", function(d) {return countryGenerator.centroid(d)[0];})
           .attr("y", function(d) {return countryGenerator.centroid(d)[1];})
           .attr("font-size", "14px")

  //Panning the map
  var panning = 30;
  //up
  var north = svg.append("g")
                 .attr("class", "pan")
                 .attr("id", "north");

  north.append("rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", screen.width)
       .attr("height", panning)
       .attr("fill", "grey")
       .attr("opacity", 0.4)

  north.append("text")
       .attr("x", screen.width/2)
       .attr("y", panning - 10)
       .html("&uarr;") //arrow

  //down
  var south = svg.append("g")
                .attr("class", "pan")
                .attr("id", "south");

  south.append("rect")
      .attr("x", 0)
      .attr("y", screen.height - panning)
      .attr("width", screen.width)
      .attr("height", panning)
      .attr("fill", "grey")
      .attr("opacity", 0.4)

  south.append("text")
      .attr("x", screen.width/2)
      .attr("y", screen.height - 10)
      .html("&darr;") //arrow

  //west
  var west = svg.append("g")
                .attr("class", "pan")
                .attr("id", "west");

  west.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", panning)
      .attr("height", screen.height)
      .attr("fill", "grey")
      .attr("opacity", 0.4)

  west.append("text")
      .attr("x", 3)
      .attr("y", screen.height/2)
      .html("&larr;") //arrow

  //east
  var east = svg.append("g")
                .attr("class", "pan")
                .attr("id", "east");

  east.append("rect")
      .attr("x", screen.width - panning)
      .attr("y", 0)
      .attr("width", panning)
      .attr("height", screen.height)
      .attr("fill", "grey")
      .attr("opacity", 0.4)

  east.append("text")
      .attr("x", screen.width - 27)
      .attr("y", screen.height/2)
      .html("&rarr;") //arrow

  d3.selectAll(".pan")
    .on("click", function()
    {
      var offset = projection.translate(); //get current translation offset
      var moveAmount = 50; //how much to move on each click
      var direction = d3.select(this).attr("id"); //which Norway

      switch(direction)
      {
        case "north":
            offset[1] += moveAmount;
            break;
        case "south":
            offset[1] -= moveAmount;
            break;
        case "west":
            offset[0] += moveAmount;
            break;
        case "east":
            offset[0] -= moveAmount;
            break;
        default:
            break;
      }

      projection.translate(offset);

      svg.selectAll("path")
         .transition()
         .attr("d", countryGenerator);

      svg.selectAll("#countryAbbrev")
         .transition()
         .attr("x", function(d) {return countryGenerator.centroid(d)[0];})
         .attr("y", function(d) {return countryGenerator.centroid(d)[1];})
    })

  //dragging the map
  var dragging = function(d) {
    //console.log("dragging!");
    //console.log(d3.event);
    var offset = projection.translate();

    offset[0] += d3.event.dx;
    offset[1] += d3.event.dy;

    projection.translate(offset);

    svg.selectAll("path")
       .transition()
       .attr("d", countryGenerator);

    svg.selectAll("#countryAbbrev")
       .transition()
       .attr("x", function(d) {return countryGenerator.centroid(d)[0];})
       .attr("y", function(d) {return countryGenerator.centroid(d)[1];})
  }

  var drag = d3.drag()
               .on("drag", dragging);

  var map = svg.append("g")
               .attr("id", "draggingMap")
               .call(drag);

  map.append("rect")
     .attr("x", panning)
     .attr("y", panning)
     .attr("width", screen.width - panning * 2)
     .attr("height", screen.height - panning * 2)
     .attr("opacity", 0)
     .attr("cursor", "move");

  //zooming the map
  var zooming = function(d) {
    //console.log(d3.event.transform);

    var offset = [d3.event.transform.x, d3.event.transform.y];

    var newScale = d3.event.transform.k * 2000;

    projection.translate(offset)
              .scale(newScale);

    svg.selectAll("path")
       .transition()
       .attr("d", countryGenerator);

    svg.selectAll("#countryAbbrev")
       .transition()
       .attr("x", function(d) {return countryGenerator.centroid(d)[0];})
       .attr("y", function(d) {return countryGenerator.centroid(d)[1];})
  }

  var zoom = d3.zoom()
               .on("zoom", zooming);

  var center = projection([30, 30]);
  //console.log(center);

  var map = svg.append("g")
               .attr("id", "zoomingMap")
               .call(zoom)
               .call(zoom.transform, d3.zoomIdentity
                   .translate(screen.width/2, screen.height/2 + 60)
                   .scale(0.12)
                   .translate(-center[0], -center[1]));

  map.append("rect")
     .attr("x", panning)
     .attr("y", panning)
     .attr("width", screen.width - panning * 2)
     .attr("height", screen.height - panning * 2)
     .attr("opacity", 0)
     .attr("cursor", "move")
}
